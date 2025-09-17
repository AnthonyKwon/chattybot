import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { generate } from 'random-words';
import { IReport } from './IReport';
import logger from "../Logger";

export function createReport(error: Error, userId?: string) {
    const fileName = `R_${(new Date()).toISOString().replace(/:/g, '+')}-${generate({ exactly: 1, minLength: 5, maxLength: 5, formatter: w => w.toUpperCase() })}.json`;
    const data: IReport = { date: Date.now(), user: userId,
        error: { name: error.name, message: error.message, stack: error.stack } };

    try {
        // create report directory if not exist
        if (!existsSync(resolve(global.appRoot, 'logs', 'report')))
            mkdirSync(resolve(global.appRoot, 'logs', 'report'));

        // write report data to file
        writeFileSync(resolve(global.appRoot, 'logs', 'report', fileName), JSON.stringify(data));
        logger.verbose({ topic: 'report', message: `Created report "${fileName}".` });

        // return name of the created file
        return fileName;
    } catch (err: any) {
        logger.error({ topic: 'report', message: `Failed to create report "${fileName}"!` });
        logger.error({ topic: 'report', message: err.stack ? err.stack : err });
    }
}