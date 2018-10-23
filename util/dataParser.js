function parseReport(reportJson) {
    let result = [];
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
            result.push([featureName, scenarioName, statisics.passed, statisics.failed, statisics.skipped, scenarioStatus, statisics.duration]);
        })
    })
    return result;
}

module.exports = parseReport;