const string = require('../stringResolver');

module.exports = {
    name: string.get('infoCommandName'),
    argsRequired: false,
    aliases: [string.get('infoCommandAliases')],
    description: string.get('infoCommandDesc').format(string.get('localizedBotName')),
    execute(message, args) {
        const info_message = [];
        message.channel.send(info_message);
    },
};
