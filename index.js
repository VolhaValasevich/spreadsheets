const creds = require('./resources/credentials.json');
const authorize = require('./util/Authorize');
const stepFunctions = require('./util/stepFunctions');
const fs = require('fs');
const path = require('path');
const { parseReport } = require('./util/dataParser');
const report = require('./resources/report.json');
const logger = require('./util/logger').logger;
const spreadsheetIdPath = path.join(__dirname, 'resources', 'spreadsheetId.json');

async function main() {
    let spreadsheetId;
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

main().catch((err) => {
    logger.error(err);
    if (err === 'Requested entity was not found.') {
        logger.info('A new spreadsheet will be created.');
        fs.unlinkSync(spreadsheetIdPath);
        main();
    }
})



