const string = require('../stringResolver');
const { version } = require('../../package.json');
const repository = 'https://github.com/AnthonyKwon/discord-catty/';

module.exports = {
    name: string.get('infoCommandName'),
    argsRequired: false,
    aliases: [string.get('infoCommandAliases')],
    description: string.get('infoCommandDesc').format(string.get('localizedBotName')),
    execute(message, args) {
        const info_message = [];
        info_message.push(string.get('infoMessage1').format(string.get('localizedBotName'), version));
        info_message.push(string.get('infoMessage2').format(string.get('localizedBotName')));
        info_message.push(string.get('infoMessage3'));
        info_message.push(string.get('infoMessage4').format(repository));
        message.channel.send(info_message);
    },
};
