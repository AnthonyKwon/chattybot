import winston from 'winston';
import 'winston-daily-rotate-file';
import config from '../config/ConfigLoader';
import path from "path";

// set winston log level to verbose, if app is running on dev mode
const logLevel = global.devMode ? 'verbose' : 'warn';

// get log rotation time and size limit from config
const timeLimit: string = `${config.log.timeLimit ?? 24}h`;
const sizeLimit: string = `${config.log.sizeLimit ?? 100}k`;

export default winston.createLogger({
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
