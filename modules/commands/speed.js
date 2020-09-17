const { logger } = require('../common');
const string = require('../stringResolver');
const tts = require('../textToSpeech');
const name = string.get('speedCommandName');

const commandFunc = (message, args) => {
    const speed = parseFloat(args[0]);
    if (speed < 0.25 || speed > 4.0) {
        logger.log('error', `[google-tts] Wrong speed range ${speed}.`);
        message.channel.send(string.get('wrongProperties1').format(string.get('speedCommandName'), speed) +
            string.get('wrongProperties2').format(string.get('speedCommandName'), string.get('speedCommandUsage')));
        return;
    }
    tts.config('speakingRate', speed, message, name);
}

module.exports = {
    name,
    argsRequired: true,
    aliases: [string.get('speedCommandAliases')],
    usage: string.get('speedCommandUsage'),
    description: string.get('speedCommandDesc').format(string.get('localizedBotName')),
    execute (message, args) {
        return commandFunc(message, args);
    }
}
