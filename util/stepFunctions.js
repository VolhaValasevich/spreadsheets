const { google } = require('googleapis');
const logger = require('./logger').logger;

class StepFunctions {

    constructor(auth) {
        this.sheets = google.sheets({ version: 'v4', auth });
    }

    createNewSpreadsheet(title) {
        const resource = {
            properties: { title },
        };
        return this.sheets.spreadsheets.create({
            resource
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

}

module.exports = StepFunctions;