const { logger } = require('../common');
const string = require('../stringResolver');
const tts = require('../textToSpeech');

module.exports = {
    name: string.get('speedCommandName'),
    argsRequired: true,
    aliases: [string.get('speedCommandAliases')],
    usage: string.get('speedCommandUsage'),
    description: string.get('speedCommandDesc').format(string.get('localizedBotName')),
    execute (message, args) {
        const speed = parseFloat(args[0]);
        if (speed < 0.25 || speed > 4.0) {
            logger.log('error', `[google-tts] Wrong speed range ${speed}.`);
            message.channel.send(string.get('wrongProperties1').format(string.get('speedCommandName'), speed) +
                string.get('wrongProperties2').format(string.get('speedCommandName'), string.get('speedCommandUsage')));
            return;
        }
        const result = tts.config('speakingRate', speed);
        if (result === true) {
            logger.log('info', `[google-tts] Speed changed to ${speed}.`);
            message.channel.send(string.get('propChangeSuccessful').format(string.get('speedCommandName'), speed));
        } else {
            logger.log('error', `[google-tts] Failed to change speed to ${speed}.`);
            message.channel.send(string.get('propChangeFailed'), string.get('speedCommandName'));
        }
    }
}
