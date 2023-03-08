const discord = require('./modules/discordwrapper/main.mod');
const logger = require('./modules/logger/main.mod.js');
const package = require('./package.json');

// initialize logger module for main
logger.info(package.name, `version ${package.version}`);

// initialize discord module
discord.init();
