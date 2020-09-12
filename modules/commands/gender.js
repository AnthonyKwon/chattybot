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
            logger.log('error', `[google-tts] Unknown gender ${gender}.`);
            message.channel.send(string.get('unknownGender').format(gender));
            return;
        }
        const result = tts.config('ssmlGender', gender);
        if (result === true) {
            logger.log('info', `[google-tts] Gender chaned to ${gender}.`);
            message.channel.send(string.get('genderChangeSuccessful').format(gender));
        } else {
            logger.log('error', `[google-tts] Failed to change gender to ${gender}.`);
            message.channel.send(string.get('genderChangeFailed'));
        }
    }
}
