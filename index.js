const creds = require('./resources/credentials.json');
const authorize = require('./util/Authorize');
const stepFunctions = require('./util/stepFunctions');
const fs = require('fs');
const path = require('path');
const { parseReport, getByCurrentDate, getByCurrentWeek, getByCurrentMonth } = require('./util/dataParser');
const report = require('./resources/report.json');
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
    
    let allTimeData = await steps.readRange(spreadsheetId, "'All Time Statistics'");
    const latestData = parseReport(report);
    allTimeData = allTimeData.slice(2).concat(latestData);
    const lastMonthData = getByCurrentMonth(allTimeData);
    const lastWeekData = getByCurrentWeek(allTimeData);
    const todayData = getByCurrentDate(lastWeekData);
    await steps.writeValuesToRange(spreadsheetId, allTimeData, "'All Time Statistics'!A3:H");
    await steps.writeValuesToRange(spreadsheetId, lastMonthData, "'Last Month Statistic'!A3:H");
    await steps.writeValuesToRange(spreadsheetId, lastWeekData, "'Last Week Statistic'!A3:H");
    await steps.writeValuesToRange(spreadsheetId, todayData, "'Today Statistic'!A3:H");
}

main()



