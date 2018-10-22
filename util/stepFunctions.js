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
            resource,
            fields: 'spreadsheetId'
        })
    }

}

module.exports = StepFunctions;