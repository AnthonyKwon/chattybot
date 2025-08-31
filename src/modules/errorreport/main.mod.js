const fs = require('fs');
const path = require('path');
const logger = require('../logger/main.mod.js');

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
function createReport(error, uid = undefined) {
    const errorid = `${error.name.toUpperCase()}_${datetime()}_${uid}`;
    const filename = `report-${errorid}.txt`;
    const data = { date: new Date(), uid, errorId: error.name, errorStack: error.stack };

    try {
        // check if report directory exists and create if not
        if (!fs.existsSync(path.join(appRoot, '/logs/report/'))) {
            fs.mkdirSync(path.join(appRoot, '/logs/report/'));
        }

        // save report to file
        fs.writeFileSync(path.join(appRoot, '/logs/report/', filename), JSON.stringify(data));
    } catch (fileErr) {
        logger.error({ topic: 'errorreport', message: `Failed to write error report "${filename}"!` });
        logger.error({ topic: 'errorreport', message: fileErr.stack ? fileErr.stack : fileErr });
    }

    // return error id
    return errorid;
}

module.exports = createReport;
