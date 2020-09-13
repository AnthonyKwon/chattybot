const { logger } = require('../common');
const string = require('../stringResolver');
const tts = require('../textToSpeech');

module.exports = {
    name: 'gender',
    argsRequired: true,
    aliases: [string.get('genderCommandAliases')],
    usage: string.get('genderCommandUsage'),
    description: string.get('genderCommandDesc'),
    execute (message, args) {
        const gender = args[0].toUpperCase();
        if (gender !== 'MALE' && gender !== 'FEMALE') {
            logger.log('error', `[google-tts] Unknown properties ${gender}.`);
            message.channel.send(string.get('unknownProperties1').format(string.get('genderCommandAliases'), gender) +
                string.get('unknownProperties2').format(string.get('propCommandUsage')));
            return;
        }
        const result = tts.config('ssmlGender', gender);
        if (result === true) {
            logger.log('info', `[google-tts] ${string.get('genderCommandAliases')} changed to ${gender}.`);
            message.channel.send(string.get('propChangeSuccessful').format(string.get('genderCommandAliases'), gender));
        } else {
            logger.log('error', `[google-tts] Failed to change ${string.get('volumeCommandAliases')} to ${gender}.`);
            message.channel.send(string.get('propChangeFailed').format(string.get('genderCommandAliases')));
        }
    }
}
