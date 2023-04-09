import * as discord from './modules/discordwrapper/main.mod';
import * as logger from './modules/logger/main.mod';
const myPackage = require('../package.json');  //TODO: replace to another import method

// initialize logger module for main
logger.info(myPackage.name, `version ${myPackage.version}`);

// initialize discord module
discord.init();
