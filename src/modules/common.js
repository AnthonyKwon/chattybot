const datetimePretty = customDate => {
    const currDate = new Date();
    let dateString = String(currDate.getFullYear()).padStart(4, '0');
    dateString = `${dateString}/${String(currDate.getMonth() + 1).padStart(2, '0')}`;
    dateString = `${dateString}/${String(currDate.getDate()).padStart(2, '0')}`;
    dateString = `${dateString} ${String(currDate.getHours()).padStart(2, '0')}`;
    dateString = `${dateString}:${String(currDate.getMinutes()).padStart(2, '0')}`;
    dateString = `${dateString}:${String(currDate.getSeconds()).padStart(2, '0')}`;
    return dateString;
}

// check if application is running as development mode or doing slash-command related job
function isDevMode() {
    if (process.env.NODE_ENV == 'development' || process.env.DEV_MODE == 'true' || process.env.SLASH_ACTION)
        return true;
    else
        return false;
}

module.exports = {
    datetimePretty,
    isDevMode
}
