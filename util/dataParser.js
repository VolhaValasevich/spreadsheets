const dayInMilliseconds = 24 * 60 * 60 * 1000;

function parseReport(reportJson, dateOptional) {
    let result = [];
    let date;
    if (!dateOptional) {
        date = new Date(Date.now());
    } else date = dateOptional;
    const dateString = date.toLocaleDateString('en-US');
    result.push([dateString, date.toLocaleTimeString()]);
    reportJson.forEach((feature) => {
        let featureName = feature.name;
        feature.elements.forEach((scenario) => {
            let scenarioName = scenario.name;
            const statisics = {
                passed: 0,
                skipped: 0,
                failed: 0,
                duration: 0
            }
            scenario.steps.forEach((step) => {
                if (step.result) {
                    statisics[step.result.status]++;
                    if (step.result.duration) statisics.duration += step.result.duration;
                }
            })
            const scenarioStatus = (statisics.failed > 0) ? 'failed' : 'passed';
            result.push([dateString, featureName, scenarioName, statisics.passed, statisics.failed, statisics.skipped, scenarioStatus, statisics.duration]);
        })
    })
    return result;
}

function stringToDate(string) {
    const dateArray = string.split('/');
    return new Date(dateArray[2], dateArray[0] - 1, dateArray[1]);
}

function getByCurrentDate(data, dateOptional) {
    let currentDate;
    if (!dateOptional) currentDate = new Date(Date.now());   //get current date and time
    else currentDate = dateOptional;
    const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());   //get the beginning of current day
    const result = data.map((row) => {
        const dataDate = stringToDate(row[0]);      //parse the date of scenario run into a Date object
        if (dataDate.getTime() === today.getTime()) return row;
    })
    return result.filter(el => el);     //clear all undefined values
}

function getByCurrentWeek(data, dateOptional) {
    let currentDate;
    if (!dateOptional) currentDate = new Date(Date.now());   //get current date and time
    else currentDate = dateOptional;
    const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());   //get the beginning of current day
    const currentWeekDay = currentDate.getDay();
    const firstWeekDay = today.getTime() - dayInMilliseconds * (currentWeekDay + 1);   //date in the beginning of current week
    const lastWeekDay = today.getTime() + dayInMilliseconds * (7 - currentWeekDay);    //date in the end of current week
    const result = data.map((row) => {
        const dataDate = stringToDate(row[0]);      //parse the date of scenario run into a Date object
        if (dataDate.getTime() >= firstWeekDay && dataDate.getTime() <= lastWeekDay) return row;
    })
    return result.filter(el => el);     //clear all undefined values
}

function getByCurrentMonth(data, dateOptional) {
    let currentDate;
    if (!dateOptional) currentDate = new Date(Date.now());   //get current date and time
    else currentDate = dateOptional;
    const result = data.map((row) => {
        const dataDate = stringToDate(row[0]);      //parse the date of scenario run into a Date object
        if (dataDate.getMonth() === currentDate.getMonth() && dataDate.getFullYear() === currentDate.getFullYear()) return row;
    })
    return result.filter(el => el);     //clear all undefined values
}

module.exports = { parseReport, getByCurrentDate, getByCurrentWeek, getByCurrentMonth };