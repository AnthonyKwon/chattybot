const { logger } = require('../common');
const string = require('../stringResolver');
const tts = require('../textToSpeech');

module.exports = {
    name: string.get('volumeCommandName'),
    argsRequired: true,
    aliases: [string.get('volumeCommandAliases')],
    usage: string.get('volumeCommandUsage'),
    description: string.get('volumeCommandDesc').format(string.get('localizedBotName')),
    execute (message, args) {
        /*
         * Convert every falsey value to 0
         * https://stackoverflow.com/a/7540412
         */
        const volume = parseFloat(args[0]) || 0;
        if (volume < -96.0 || volume > 16.0) {
            logger.log('error', `[google-tts] Unknown volume value ${volume}!`);
            message.channel.send(string.get('wrongProperties1').format(string.get('volumeCommandName'), volume) +
                string.get('wrongProperties2').format(string.get('volumeCommandName'), string.get('volumeCommandUsage')));
            return;
        }
        const result = tts.config(message, 'volumeGainDb', volume);
    }
}
