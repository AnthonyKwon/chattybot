const path = require('path');
const winston = require('winston');
require('winston-daily-rotate-file');
const config = require('../config/ConfigLoader').default;
const { isDevMode } = require('../common');

// set winston log level to verbose, if app is running on dev mode
const logLevel = isDevMode() ? 'verbose' : 'warn';

// get log rotation time and size limit from config
const timeLimit = `${config.log.timeLimit ?? 24}h`;
const sizeLimit = `${config.log.sizeLimit ?? 100}k`;

// create new logger_legacy object and export it
module.exports = winston.createLogger({
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.colorize(),
                winston.format.printf(info => `${info.timestamp} - ${info.level}/${info.topic}:  ${info.message}`)),
            level: logLevel
        }),
        new winston.transports.DailyRotateFile({
            filename: path.join(appRoot, 'logs/%DATE%'),
            dirname: path.join(appRoot, 'logs'),
            extension: '.log',
            datePattern: 'YYYY-MM-DD',
            frequency: timeLimit,
            maxSize: sizeLimit,
            createSymlink: true,
            symlinkName: 'latest.log',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
                winston.format.printf(info => `{"timestamp":"${info.timestamp}", "topic":"${info.topic}", "level":"${info.level}", "message":"${info.message}"}`)),
            level: logLevel,
        })
    ]
});

