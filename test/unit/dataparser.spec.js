const chai = require('chai');
const { parseReport, getByCurrentDate, getByCurrentWeek, getByCurrentMonth } = require('../../util/dataParser');
const expect = chai.expect;
const report = require('../resources/testReport.json');
const testData = require('../resources/testData.json');

describe('Data Parser', () => {
    
    it('should correctly parse a report', () => {
        const result = parseReport(report, new Date('2018-10-26T10:00:00'));
        expect(result).to.be.eql(testData.data);
    })

    describe('Getting data by time period', () => {

        let day, week, month, allData;

        before(() => {
            day = parseReport(report, new Date('2018-10-26T10:00:00'));
            week = parseReport(report, new Date('2018-10-22T10:00:00'));
            month = parseReport(report, new Date('2018-10-01T10:00:00'));
            const oddData = parseReport(report, new Date('2019-10-01T10:00:00'));
            allData = day.concat(week, month, oddData);
        })

        it('should get data by day', () => {
            const dataByDay = getByCurrentDate(allData, new Date('2018-10-26T10:00:00'));
            expect(dataByDay).to.be.eql(day);
        })

        it('should get data by week', () => {
            const dataByDay = getByCurrentWeek(allData, new Date('2018-10-26T10:00:00'));
            expect(dataByDay).to.be.eql(day.concat(week));
        })

        it('should get data by month', () => {
            const dataByDay = getByCurrentMonth(allData, new Date('2018-10-26T10:00:00'));
            expect(dataByDay).to.be.eql(day.concat(week, month));
        })

    })

})