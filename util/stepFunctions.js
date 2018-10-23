const { google } = require('googleapis');
const logger = require('./logger').logger;
const newSpreadsheetProperties = require('../resources/newSpreadsheetProperties.json');
const colorFormattingRules = require('../resources/colorFormattingRules.json');

class StepFunctions {

    constructor(auth) {
        this.sheets = google.sheets({ version: 'v4', auth });
    }

    createNewSpreadsheet() {
        const resource = newSpreadsheetProperties;
        return new Promise((resolve, reject) => {
            this.sheets.spreadsheets.create({
                resource
            }, (err, spreadsheet) => {
                if (err) reject(err);
                resolve(spreadsheet.data.spreadsheetId);
            })
        })
    }

    readRange(spreadsheetId, range) {
        return new Promise((resolve, reject) => {
            this.sheets.spreadsheets.values.get({
                spreadsheetId,
                range
            }, (err, result) => {
                if (err) reject(err);
                resolve(result.data.values);
            })
        })
    }

    readMultipleRanges(spreadsheetId, ranges) {
        return new Promise((resolve, reject) => {
            this.sheets.spreadsheets.values.batchGet({
                spreadsheetId,
                ranges
            }, (err, result) => {
                if (err) reject(err);
                resolve(result.data.valueRanges);
            })
        })
    }

    writeValuesToRange(spreadsheetId, values, range) {
        const resource = { values };
        const valueInputOption = 'RAW';
        return new Promise((resolve, reject) => {
            this.sheets.spreadsheets.values.update({
                spreadsheetId,
                range,
                valueInputOption,
                resource
            }, (err, result) => {
                if (err) reject(err);
                resolve(result.data);
            })
        })
    }

    appendValues(spreadsheetId, values, range) {
        const resource = { values };
        const valueInputOption = 'RAW';
        return new Promise((resolve, reject) => {
            this.sheets.spreadsheets.values.append({
                spreadsheetId,
                range,
                valueInputOption,
                resource
            }, (err, res) => {
                if (err) reject(err);
                resolve(res);
            })
        })
    }

    colorFormatting(spreadsheetId) {
        const resource = colorFormattingRules;
        return new Promise((resolve, reject) => {
            this.sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                resource
            }, (err, res) => {
                if (err) reject(err);
                resolve(res);
            })
        })
    }

}

module.exports = StepFunctions;