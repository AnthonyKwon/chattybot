const path = require('path');
const winston = require('winston');

// initialize logger
    const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.printf(info => `{"timestamp":"${info.timestamp}", "topic":"${info.topic}", "level":"${info.level}", "message":"${info.message}"}`)
    ),
    topic: undefined,
    transports: [
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error'
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/verbose.log'),
            level: 'verbose'
        })
    ]
});

// test if development mode is set
if (process.env.MAINTENANCE == 1) {
    logger.maintenance = true;
    logger.add(new winston.transports.Console({ 
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.cli(),
            winston.format.printf(info => `${info.timestamp} - ${info.level}/${info.topic || logger.topic}: ${info.message}`)),
        level: 'verbose'
    }));
} else {
    logger.isMAINTENANCE = false;
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.cli(),
            winston.format.printf(info => `${info.timestamp} - ${info.level}/${info.topic}: ${info.message}`)),
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
