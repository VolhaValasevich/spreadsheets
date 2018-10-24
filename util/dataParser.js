function parseReport(reportJson) {
    let result = [];
    const date = new Date(Date.now());
    const dateString = date.toDateString();
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
                    statisics.duration += step.result.duration;
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

function getByCurrentDate(data) {
    const currentDate = new Date(Date.now());   //get current date and time
    const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());   //get the beginning of current day
    const result = data.map((row) => {
        const dataDate = stringToDate(row[0]);      //parse the date of scenario run into a Date object
        if (dataDate.getTime() === today.getTime()) return row;     
    })
    return result.filter(el => el);     //clear all undefined values
}

function getByCurrentWeek(data) {
    const currentDate = new Date(Date.now());   //get current date and time
    const currentWeekDay = currentDate.getDay();
    const firstWeekDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentWeekDay + 1);   //date in the beginning of current week
    const lastWeekDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + (7 - currentWeekDay));  //date in the end of current week
    const result = data.map((row) => {
        const dataDate = stringToDate(row[0]);      //parse the date of scenario run into a Date object
        if (dataDate.getTime() >= firstWeekDay.getTime() && dataDate.getTime() <= lastWeekDay.getTime()) return row;     
    })
    return result.filter(el => el);     //clear all undefined values
}

function getByCurrentMonth(data) {
    const currentDate = new Date(Date.now());   //get current date and time
    const result = data.map((row) => {
        const dataDate = stringToDate(row[0]);      //parse the date of scenario run into a Date object
        if (dataDate.getMonth() === currentDate.getMonth()) return row;     
    })
    return result.filter(el => el);     //clear all undefined values
}

module.exports = { parseReport, getByCurrentDate, getByCurrentWeek, getByCurrentMonth };