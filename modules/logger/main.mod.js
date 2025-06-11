const path = require('path');
const winston = require('winston');

// set winston log level to verbose, if app is running on dev mode or slash-command related job
const logLevel = (process.env.NODE_ENV == 'development' || process.env.SLASH_ACTION) ?
                  winston.config.syslog.levels.verbose : winston.config.syslog.levels.warning;

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
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/latest.log'),
            level: logLevel
        })
    ]
});

