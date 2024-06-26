const path = require('path');
const winston = require('winston');

// initialize logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.printf(info => `{"timestamp":"${info.timestamp}", "topic":"${logger.topic}", "level":"${info.level}", "message":"${info.message}"}`)
    ),
    topic: undefined,
    transports: [
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error'
        })
    ]
});

// test if development mode is set
if (process.env.NODE_ENV == "development" || process.env.SLASH_ACTION) {
    // enable full file logging in development mode
    logger.add(new winston.transports.File({
        filename: path.join(__dirname, '../../logs/verbose.log'),
        level: 'verbose'
    }));
    // show full log on console in development mode
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.cli(),
            winston.format.printf(info => `${info.timestamp} - ${info.level}/${logger.topic}: ${info.message}`)),
        level: 'verbose'
    }));
} else {
    // show only warning+ log on console in release mode
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.cli(),
            winston.format.printf(info => `${info.timestamp} - ${info.level}/${logger.topic}: ${info.message}`)),
        level: 'warn'
    }));
}

function log(topic, level, message) {
    logger.topic = topic;
    logger.log(level, message);
}
function error(topic, message) { log(topic, 'error', message) }
function warn(topic, message) { log(topic, 'warn', message) }
function info(topic, message) { log(topic, 'info', message) }
function http(topic, message) { log(topic, 'http', message) }
function verbose(topic, message) { log(topic, 'verbose', message) }
function debug(topic, message) { log(topic, 'debug', message) }
function silly(topic, message) { log(topic, 'silly', message) }

module.exports = {
    log, error, warn, info, http, verbose, debug, silly
};
