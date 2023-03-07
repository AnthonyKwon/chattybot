const path = require('path');
const winston = require('winston');

// initialize logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: path.join(__dirname, '../logs/error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(__dirname, '../logs/verbose.log'), level: 'verbose' })
    ]
});

// test if development mode is set
if (process.env.DEVMODE == 1) {
    logger.isDevMode = true;
    logger.add(new winston.transports.Console({ format: winston.format.cli(), level: 'verbose' }));
} else {
    logger.isDevMode = false;
    logger.add(new winston.transports.Console({ format: winston.format.cli(), level: 'warn' }));
}

module.exports = logger;
