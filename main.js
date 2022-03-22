const winston = require('winston');
const wrapper_init = require('./module/discordwrapper/main.mod');
const logger = require('./module/logger.js');

const devFlag = process.env.NODE_ENV === 'development' ? true : false;

/* Logging winston to console on development mode. */
if (devFlag === true) {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

wrapper_init();
