const { token } = require('./config/token.json');
const winston = require(winston);
const Discord = require('discord.js');
const client = new Discord.Client();

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/verbose.log', level: 'verbose' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }))
}

client.once('ready', () => {
    logger.log('info', 'Ready!');
});

client.login(token);
