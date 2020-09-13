const { logger } = require('../common');
const string = require('../stringResolver');
const tts = require('../textToSpeech');

module.exports = {
    name: string.get('genderCommandName'),
    argsRequired: true,
    aliases: [string.get('genderCommandAliases')],
    usage: string.get('genderCommandUsage'),
    description: string.get('genderCommandDesc').format(string.get('localizedBotName')),
    execute (message, args) {
        const gender = args[0].toUpperCase();
        if (gender !== 'MALE' && gender !== 'FEMALE') {
            logger.log('error', `[google-tts] Unknown properties ${gender}.`);
            message.channel.send(string.get('wrongProperties1').format(string.get('genderCommandName'), gender) +
                string.get('wrongProperties2').format(string.get('genderCommandName'), string.get('genderCommandUsage')));
            return;
        }
        const result = tts.config('ssmlGender', gender);
        if (result === true) {
            logger.log('info', `[google-tts] ${string.get('genderCommandName')} changed to ${gender}.`);
            message.channel.send(string.get('propChangeSuccessful').format(string.get('genderCommandName'), gender));
        } else {
            logger.log('error', `[google-tts] Failed to change ${string.get('volumeCommandName')} to ${gender}.`);
            message.channel.send(string.get('propChangeFailed').format(string.get('genderCommandName')));
        }
    }
}
