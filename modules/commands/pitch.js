const { logger } = require('../common');
const string = require('../stringResolver');
const tts = require('../textToSpeech');

module.exports = {
    name: string.get('pitchCommandName'),
    argsRequired: true,
    aliases: [string.get('pitchCommandAliases')],
    usage: string.get('pitchCommandUsage'),
    description: string.get('pitchCommandDesc').format(string.get('localizedBotName')),
    execute (message, args) {
        /* Convert every falsey value to 0
         * https://stackoverflow.com/a/7540412 */
        const pitch = parseFloat(args[0]) || 0;
        if (pitch < -20 || pitch > 20) {
            logger.log('error', `[google-tts] Wrong pitch range ${pitch}.`);
            message.channel.send(string.get('wrongProperties1').format(string.get('pitchCommandName'), pitch) +
                string.get('wrongProperties2').format(string.get('pitchCommandName'), string.get('pitchCommandUsage')));
            return;
        }
        const result = tts.config('pitch', pitch);
        if (result === true) {
            logger.log('info', `[google-tts] Pitch changed to ${pitch}.`);
            message.channel.send(string.get('propChangeSuccessful').format(string.get('pitchCommandName'), pitch));
        } else {
            logger.log('error', `[google-tts] Failed to change pitch to ${pitch}.`);
            message.channel.send(string.get('propChangeFailed'), string.get('pitchCommandName'));
        }
    }
}
