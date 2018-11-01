#!/usr/bin/env node

const authorize = require('./util/Authorize');
const stepFunctions = require('./util/stepFunctions');
const fs = require('fs');
const path = require('path');
const { parseReport } = require('./util/dataParser');
const logger = require('./util/logger').logger;
const spreadsheetIdPath = path.join(__dirname, 'resources', 'spreadsheetId.json');
const yargs = require('yargs')
    .usage('Cucumber reporter for Google Spreadsheets.\nUsage: spreadsheets <path to report.json>')
    .options({
        'r': {
            alias: 'report',
            describe: 'path to cucumber report.json',
            type: 'string',
            demand: true
        },
        'c': {
            alias: 'creds',
            describe: 'path to google credentials',
            type: 'string',
            demand: true
        }
    }).argv;

async function main(reportPath, credsPath) {
    let report, spreadsheetId;
    try {
        report = require(path.resolve(reportPath));
        creds = require(path.resolve(credsPath));
    } catch (err) {
        throw new Error(`Cannot read json file - ${err.message}`);
    }
    const auth = await authorize(creds);
    const steps = new stepFunctions(auth);
    if (!fs.existsSync(spreadsheetIdPath)) {
        spreadsheetId = await steps.createNewSpreadsheet('test');
        fs.writeFileSync(spreadsheetIdPath, JSON.stringify({ id: spreadsheetId }));
        await steps.colorFormatting(spreadsheetId);
    } else {
        spreadsheetId = require(spreadsheetIdPath).id;
    }
    const latestData = parseReport(report);
    await steps.updateData(spreadsheetId, latestData);
    logger.info(`Successfully updated test data on https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
}

main(yargs.report, yargs.creds).catch((err) => {
    logger.error(`${err.message}\n${err.stack}`);
    if (err === 'Requested entity was not found.') {
        logger.info('A new spreadsheet will be created.');
        fs.unlinkSync(spreadsheetIdPath);
        main();
    }
})

module.exports = main;


