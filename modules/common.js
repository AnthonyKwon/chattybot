const fs = require('fs');
const path = require('path');
const winston = require('winston');

let ttsConnection = undefined;
const getTtsConnection = () => {
    return ttsConnection;
}
const setTtsConnection = args => {
    ttsConnection = args;
}

let ytConnection = undefined;
const getYtConnection = () => {
    return ytConnection;
}
const setYtConnection = args => {
    ytConnection = args;
}

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: path.join(__dirname, '../logs/error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(__dirname, '../logs/verbose.log'), level: 'verbose' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
            format: winston.format.simple(),
        }))
}

module.exports = {
    getTtsConnection,
    setTtsConnection,
    getYtConnection,
    setYtConnection,
    logger
}
