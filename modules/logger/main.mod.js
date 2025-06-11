const path = require('path');
const winston = require('winston');
require('winston-daily-rotate-file');
const config = require('../config');

// set winston log level to verbose, if app is running on dev mode or slash-command related job
const logLevel = (process.env.NODE_ENV == 'development' || process.env.SLASH_ACTION) ?
                  winston.config.syslog.levels.verbose : winston.config.syslog.levels.warning;

// get log rotation time and size limit from config
const timeLimit = `${config['log-rotate'].timeLimit ?? 24}h`;
const sizeLimit = `${config['log-rotate'].sizeLimit ?? 100}k`;

// create new logger object and export it
module.exports = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.printf(info => `{"timestamp":"${info.timestamp}", "topic":"${info.topic}", "level":"${info.level}", "message":"${info.message}"}`)
    ),
    transports: [
        new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.cli(),
            winston.format.printf(info => `${info.timestamp} - ${info.level}/${info.topic}:  ${info.message}`)),
        level: logLevel
        }),
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../../logs/%DATE%'),
            dirname: path.join(__dirname, '../../logs'),
            extension: '.log',
            datePattern: 'YYYY-MM-DD',
            frequency: timeLimit,
            maxSize: sizeLimit,
            createSymlink: true,
            symlinkName: 'latest.log',
            level: logLevel,
        })
    ]
});

