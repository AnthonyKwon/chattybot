const { logger } = require('../common');
const string = require('../stringResolver');
const tts = require('../textToSpeech');
const name = string.get('genderCommandName');

const commandFunc = (message, args) => {
    const gender = args[0].toUpperCase();
    /* If gender is not an MALE or FEMALE, show an error. */
    if (gender !== 'MALE' && gender !== 'FEMALE') {
        logger.log('error', `[google-tts] Unknown properties ${gender}.`);
        message.channel.send(string.get('wrongProperties1').format(string.get('genderCommandName'), gender) +
            string.get('wrongProperties2').format(string.get('genderCommandName'), string.get('genderCommandUsage')));
        return;
    }
    tts.config('ssmlGender', gender, message, name);
}

module.exports = {
    name,
    argsRequired: true,
    aliases: [string.get('genderCommandAliases')],
    usage: string.get('genderCommandUsage'),
    description: string.get('genderCommandDesc').format(string.get('localizedBotName')),
    execute (message, args) {
        commandFunc(message, args);
    }
}
