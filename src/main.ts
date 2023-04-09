import 'module-alias/register';
import * as discord from '@modules/discordwrapper/main.mod';
import logger from '@modules/logger/main.mod';
const myPackage = require('../package.json');

// initialize logger module for main
logger.info(myPackage.name, `version ${myPackage.version}`);

// initialize discord module
discord.init();