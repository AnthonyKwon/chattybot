const winston = require('winston');
const discord = require('./modules/discordwrapper.js');
const logger = require('./modules/logger.js');

const devFlag = process.env.NODE_ENV === 'development' ? true : false;

/* Logging winston to console on development mode. */
if (devFlag === true) {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

discord.init(devFlag);
