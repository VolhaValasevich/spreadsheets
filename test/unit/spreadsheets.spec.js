const chai = require('chai');
const StepFunctions = require('../../util/stepFunctions');
const authorize = require('../../util/Authorize');
const creds = require('../resources/credentials.json');
const { parseReport, getByCurrentDate, getByCurrentWeek, getByCurrentMonth } = require('../../util/dataParser');
const newSpreadsheetProperties = require('../../resources/newSpreadsheetProperties.json');
const testSpreadsheetId = require('../resources/testSpreadsheetId.json').id;
const expect = chai.expect;
const testData = require('../resources/testData.json');
const testReport = require('../resources/testReport.json');
const testDate = '2018-10-26T10:00:00';

function generateDataByDate(report) {
    const day = parseReport(report, new Date('2018-10-26T10:00:00'));
    const week = parseReport(report, new Date('2018-10-22T10:00:00'));
    const month = parseReport(report, new Date('2018-10-01T10:00:00'));
    const oddData = parseReport(report, new Date('2019-10-01T10:00:00'));
    allData = day.concat(week, month, oddData);
    return allData;
}

describe('Spreadsheet Functions', () => {

    let auth, steps;

    before(async () => {
        auth = await authorize(creds);
        steps = new StepFunctions(auth);
    })

    describe('Basic functions', async () => {

        after(async () => {
            await steps.clearAllData(testSpreadsheetId);
        })

        it('should write data to a spreadsheet and read it', async () => {
            await steps.writeValuesToRange(testSpreadsheetId, testData.data, "'All Time Statistics'!A3:H");
            const data = await steps.readRange(testSpreadsheetId, "'All Time Statistics'!A3:H");
            expect(data).to.be.eql(testData.data);
        });
    })

    describe('Sorting by date', async () => {

        let today, week, month;

        before(async () => {
            const dataCopy = Object.assign({}, testData);
            const generatedData = generateDataByDate(testReport);
            today = getByCurrentDate(generatedData, new Date(testDate));
            week = getByCurrentWeek(generatedData, new Date(testDate));
            month = getByCurrentMonth(generatedData, new Date(testDate));
            await steps.updateData(testSpreadsheetId, generatedData);
        })

        after(async () => {
            await steps.clearAllData(testSpreadsheetId);
        })

        it('should get data for today', async () => {
            const result = await steps.readRange(testSpreadsheetId, "'Today Statistic'!A3:H");
            expect(result).to.be.eql(today);
        });

        it('should get data for this week', async () => {
            const result = await steps.readRange(testSpreadsheetId, "'Last Week Statistic'!A3:H");
            expect(result).to.be.eql(week);
        });

        it('should get data for this month', async () => {
            const result = await steps.readRange(testSpreadsheetId, "'Last Month Statistic'!A3:H");
            expect(result).to.be.eql(month);
        });
    })

    newSpreadsheetProperties.sheets.forEach((sheet) => {
        describe(`${sheet.properties.title}`, async () => {

            before(async () => {
                await steps.writeValuesToRange(testSpreadsheetId, testData.data, `'${sheet.properties.title}'!A3:H`);
            })

            after(async () => {
                await steps.clearAllData(testSpreadsheetId);
            })

            it('should calculate the amount of passed steps', async () => {
                const result = await steps.readRange(testSpreadsheetId, `'${sheet.properties.title}'!D2`);
                expect(result).to.be.eql(testData.expectedResults.passedSteps);
            });

            it('should calculate the amount of failed steps', async () => {
                const result = await steps.readRange(testSpreadsheetId, `'${sheet.properties.title}'!E2`);
                expect(result).to.be.eql(testData.expectedResults.failedSteps);
            });

            it('should calculate the amount of skipped steps', async () => {
                const result = await steps.readRange(testSpreadsheetId, `'${sheet.properties.title}'!F2`);
                expect(result).to.be.eql(testData.expectedResults.skippedSteps);
            });

            it('should calculate total duration', async () => {
                const result = await steps.readRange(testSpreadsheetId, `'${sheet.properties.title}'!H2`);
                expect(result).to.be.eql(testData.expectedResults.duration);
            });

            it('should calculate the amount of scenarios', async () => {
                const result = await steps.readRange(testSpreadsheetId, `'${sheet.properties.title}'!I2`);
                expect(result).to.be.eql(testData.expectedResults.totalScenarios);
            });

            it('should calculate the amount of passed scenarios', async () => {
                const result = await steps.readRange(testSpreadsheetId, `'${sheet.properties.title}'!J2`);
                expect(result).to.be.eql(testData.expectedResults.passedScenarios);
            });

            it('should calculate the amount of failed scenarios', async () => {
                const result = await steps.readRange(testSpreadsheetId, `'${sheet.properties.title}'!K2`);
                expect(result).to.be.eql(testData.expectedResults.failedScenarios);
            });

            it('should calculate passrate', async () => {
                const result = await steps.readRange(testSpreadsheetId, `'${sheet.properties.title}'!L2`);
                expect(result).to.be.eql(testData.expectedResults.passrate);
            });
        })
    })

})