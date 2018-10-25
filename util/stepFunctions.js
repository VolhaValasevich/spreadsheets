const { google } = require('googleapis');
const logger = require('./logger').logger;
const fs = require('fs');
const newSpreadsheetProperties = require('../resources/newSpreadsheetProperties.json');
const defaultSheetData = require('../resources/defaultSheetData.json');
const colorFormattingRules = require('../resources/colorFormattingRules.json');
const conditionalFormattingRules = require('../resources/conditionalFormattingRules.json');
const sheetProperties = require('../resources/sheetProperties.json');
const { getByCurrentDate, getByCurrentWeek, getByCurrentMonth } = require('./dataParser');

class StepFunctions {

    constructor(auth) {
        this.sheets = google.sheets({ version: 'v4', auth });
    }

    createNewSpreadsheet() {
        const resource = newSpreadsheetProperties;
        resource.sheets.forEach((sheet) => {
            sheet.data = defaultSheetData.data;
        })
        return new Promise((resolve, reject) => {
            this.sheets.spreadsheets.create({
                resource
            }, (err, spreadsheet) => {
                if (err) {
                    logger.error(`Cannot create a spreadsheet: ${err.errors[0].message}`);
                    reject(err.errors[0].message);
                } else resolve(spreadsheet.data.spreadsheetId);
            })
        })
    }

    readRange(spreadsheetId, range) {
        return new Promise((resolve, reject) => {
            this.sheets.spreadsheets.values.get({
                spreadsheetId,
                range
            }, (err, result) => {
                if (err) {
                    logger.error(`Cannot read values in spreadsheet https://docs.google.com/spreadsheets/d/${spreadsheetId} in range [${range}]: ${err.errors[0].message}`);
                    reject(err.errors[0].message);
                } else resolve(result.data.values);
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
        const valueInputOption = 'USER_ENTERED';
        return new Promise((resolve, reject) => {
            this.sheets.spreadsheets.values.update({
                spreadsheetId,
                range,
                valueInputOption,
                resource
            }, (err, result) => {
                if (err) reject(err);
                resolve(result);
            })
        })
    }

    appendValues(spreadsheetId, values, range) {
        const resource = { values };
        const valueInputOption = 'USER_ENTERED';
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

    async writeAllDataToSpreadsheet(spreadsheetId, data) {
        const categories = Object.keys(data);
        await this.clearAllData(spreadsheetId);
        newSpreadsheetProperties.sheets.forEach(async (sheet) => {
            await this.writeValuesToRange(spreadsheetId, data[categories[sheet.properties.sheetId]], `'${sheet.properties.title}'!A3:H`);
        })
    }

    async updateData(spreadsheetId, report) {
        const data = { };
        data.allTimeData = await this.readRange(spreadsheetId, newSpreadsheetProperties.sheets[0].properties.title);
        data.allTimeData = data.allTimeData.slice(2).concat(report);
        data.lastMonthData = getByCurrentMonth(data.allTimeData);
        data.lastWeekData = getByCurrentWeek(data.allTimeData);
        data.todayData = getByCurrentDate(data.lastWeekData);
        await this.writeAllDataToSpreadsheet(spreadsheetId, data);
    }

    clearAllData(spreadsheetId) {
        return new Promise((resolve, reject) => {
            const ranges = [];
            newSpreadsheetProperties.sheets.forEach((sheet) => {
                ranges.push(`'${sheet.properties.title}'!A3:H`);
            })
            this.sheets.spreadsheets.values.batchClear({
                spreadsheetId,
                ranges
            }, (err, res) => {
                if (err) reject(err);
                resolve(res);
            })
        })
    }

    colorFormatting(spreadsheetId) {
        let requests = [];
        newSpreadsheetProperties.sheets.forEach((sheet) => {    //apply all color and conditional formatting rules to all sheets in a spreadsheet
            conditionalFormattingRules.requests.forEach((rule) => {
                const conditionalRule = JSON.parse(JSON.stringify(rule));   //create a copy of an object to avoid rewriting properties
                conditionalRule.addConditionalFormatRule.rule.ranges[0].sheetId = sheet.properties.sheetId;
                requests.push(conditionalRule);
            });
            colorFormattingRules.requests.forEach((rule) => {
                const colorRule = JSON.parse(JSON.stringify(rule));         //create a copy of an object to avoid rewriting properties
                colorRule.repeatCell.range.sheetId = sheet.properties.sheetId;
                requests.push(colorRule);
            });
            sheetProperties.requests.forEach((rule) => {
                const property = JSON.parse(JSON.stringify(rule));         //create a copy of an object to avoid rewriting properties
                property.updateSheetProperties.properties.sheetId = sheet.properties.sheetId;
                requests.push(property);
            })
        })
        return new Promise((resolve, reject) => {
            this.sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                resource: { requests }
            }, (err, res) => {
                if (err) reject(err);
                resolve(res);
            })
        })
    }

}

module.exports = StepFunctions;