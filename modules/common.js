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

const getUsername = message => {
    const username = message.client.guilds.cache.get(message.guild.id).member(message.author).displayName;
    return username.split('_').join(' ');
}

if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function (search, replace) {
        return this.split(search).join(replace);
    }
}

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
    getUsername,
    logger
}
