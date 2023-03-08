const fs = require('fs');
const path = require('path');

// parse date-time for filename
const datetime = () => {
    const currDate = new Date();
    let dateString = String(currDate.getFullYear()).padStart(4, '0');
    dateString = `${dateString}${String(currDate.getMonth() + 1).padStart(2, '0')}`;
    dateString = `${dateString}${String(currDate.getDate() + 1).padStart(2, '0')}`;
    dateString = `${dateString}${String(currDate.getHours()).padStart(2, '0')}`;
    dateString = `${dateString}${String(currDate.getMinutes()).padStart(2, '0')}`;
    dateString = `${dateString}${String(currDate.getSeconds()).padStart(2, '0')}`;
    return dateString;
}

// create an error report and return report id
function createReport(error, uid=undefined) {
    const errorid = `${error.name.toUpperCase()}_${datetime()}_${uid}`;
    const filename = `report-${errorid}.txt`;
    const data = { date: new Date(), uid, errorId: error.name, errorStack: error.stack };

    // check if report directory exists and create if not
    if (!fs.existsSync(path.join(path.dirname(require.main.filename), '/logs/report/'))) {
        fs.mkdirSync(path.join(path.dirname(require.main.filename), '/logs/report/'));
    }

    // save report to file
    fs.writeFileSync(path.join(path.dirname(require.main.filename), '/logs/report/', filename), JSON.stringify(data));

    // return error id
    return errorid;
}

module.exports = createReport;
