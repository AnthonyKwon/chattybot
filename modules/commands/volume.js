const { logger } = require('../common');
const string = require('../stringResolver');
const tts = require('../textToSpeech');

module.exports = {
    name: 'volume',
    argsRequired: true,
    aliases: [string.get('volumeCommandAliases')],
    usage: string.get('volumeCommandUsage'),
    description: string.get('volumeCommandDesc'),
    execute (message, args) {
        /*
         * Convert every falsey value to 0
         * https://stackoverflow.com/a/7540412
         */
        const volume = parseFloat(args[0]) || 0;
        if (volume < -96.0 || volume > 16.0) {
            logger.log('error', `[google-tts] Unknown volume value ${volume}!`);
            message.channel.send(string.get('wrongProperties1').format(string.get('volumeCommandAliases'), volume)) +
                message.channel.send(string.get('wrongProperties2').format(string.get('volumeCommandAliases'), string.get('volumeCommandUsage')));
            return;
        }
        const result = tts.config('volumeGainDb', volume);
        if (result === true) {
            logger.log('info', `[google-tts] volume changed to ${volume}.`);
            message.channel.send(string.get('propChangeSuccessful').format(string.get('volumeCommandAliases'), volume));
        } else {
            logger.log('error', `[google-tts] Failed to change volume to ${volume}.`);
            message.channel.send(string.get('propChangeFailed').format(string.get('volumeCommandAliases')));
        }
    }
}
