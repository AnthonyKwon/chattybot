const { logger } = require('../common');
const string = require('../stringResolver');
const tts = require('../textToSpeech');

const commandFunc = (message, args) => {
    const gender = args[0].toUpperCase();
    /* If gender is not an MALE or FEMALE, show an error. */
    if (gender !== 'MALE' && gender !== 'FEMALE') {
        logger.log('error', `[google-tts] Unknown properties ${gender}.`);
        message.channel.send(string.get('wrongProperties1').format(string.get('genderCommandName'), gender) +
            string.get('wrongProperties2').format(string.get('genderCommandName'), string.get('genderCommandUsage')));
        return;
    }

    const result = tts.config('ssmlGender', gender);
    /* Send success/failed message by result
     * TODO: move this part into textToSpeech.js - tts_config() */
    if (result === true) {
        /* Success */
        logger.log('info', `[google-tts] ${string.get('genderCommandName')} changed to ${gender}.`);
        message.channel.send(string.get('propChangeSuccessful').format(string.get('genderCommandName'), gender));
    } else {
        /* Failed */
        logger.log('error', `[google-tts] Failed to change ${string.get('volumeCommandName')} to ${gender}.`);
        message.channel.send(string.get('propChangeFailed').format(string.get('genderCommandName')));
    }
}

module.exports = {
    name: string.get('genderCommandName'),
    argsRequired: true,
    aliases: [string.get('genderCommandAliases')],
    usage: string.get('genderCommandUsage'),
    description: string.get('genderCommandDesc').format(string.get('localizedBotName')),
    execute (message, args) {
        commandFunc(message, args);
    }
}
