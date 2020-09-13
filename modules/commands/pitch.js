const { logger } = require('../common');
const string = require('../stringResolver');
const tts = require('../textToSpeech');

module.exports = {
    name: 'pitch',
    argsRequired: true,
    aliases: [string.get('pitchCommandAliases')],
    usage: string.get('pitchCommandUsage'),
    description: string.get('pitchCommandDesc'),
    execute (message, args) {
        /*
         * Convert every falsey value to 0
         * https://stackoverflow.com/a/7540412
         */
        const pitch = parseFloat(args[0]) || 0;
        console.log(typeof pitch);
        if (pitch < -20 || pitch > 20) {
            logger.log('error', `[google-tts] Wrong pitch range ${pitch}.`);
            message.channel.send(string.get('unknownProperties1').format(string.get('pitchCommandAliases'), pitch)) +
            message.channel.send(string.get('unknownProperties2').format(string.get('pitchCommandUsage')));
            return;
        }
        const result = tts.config('pitch', pitch);
        if (result === true) {
            logger.log('info', `[google-tts] Pitch changed to ${pitch}.`);
            message.channel.send(string.get('propChangeSuccessful').format(string.get('pitchCommandAliases'), pitch));
        } else {
            logger.log('error', `[google-tts] Failed to change pitch to ${pitch}.`);
            message.channel.send(string.get('propChangeFailed'), string.get('pitchCommandAliases'));
        }
    }
}
