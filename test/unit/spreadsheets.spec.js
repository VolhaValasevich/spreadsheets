const chai = require('chai');
const StepFunctions = require('../../util/stepFunctions');
const authorize = require('../../util/Authorize');
const creds = require('../resources/credentials.json');
const { getByCurrentDate, getByCurrentWeek, getByCurrentMonth } = require('../../util/dataParser');
const newSpreadsheetProperties = require('../../resources/newSpreadsheetProperties.json');
const testSpreadsheetId = require('../resources/testSpreadsheetId.json').id;
const expect = chai.expect;
const testData = require('../resources/testData.json');
const fs = require('fs');

function generateDataByDate(data) {
    const dayInMilliseconds = 24 * 60 * 60 * 1000;
    const resultDates = [];
    const currentDate = new Date(Date.now());
    const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());   //get the beginning of current day
    const currentWeekDay = today.getDay();
    const currentMonth = today.getMonth();
    const firstWeekDay = today.getTime() - dayInMilliseconds * (currentWeekDay + 1);   //date in the beginning of current week
    const lastWeekDay = today.getTime() + dayInMilliseconds * (7 - currentWeekDay);    //date in the end of current week
    for (let i = firstWeekDay; i <= lastWeekDay; i += dayInMilliseconds) {                //get an array with days of current week
        resultDates.push(new Date(i));
    }
    for (let i = 1; i <= 2; i++) {
        let month = currentMonth - i;
        if (month < 0) month = 11 + month;
        resultDates.push(new Date(today.getFullYear(), month, today.getDate()))
    }
    for (let i = 1; i <= 2; i++) {
        let month = currentMonth + i;
        if (month > 11) month = month - 11;
        resultDates.push(new Date(today.getFullYear(), month, today.getDate()))
    }
    data.forEach((el, index) => {
        el[0] = resultDates[index].toLocaleDateString('en-US');
    })
    return data;
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
            const generatedData = generateDataByDate(dataCopy.data);
            today = getByCurrentDate(generatedData);
            week = getByCurrentWeek(generatedData);
            month = getByCurrentMonth(generatedData);
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