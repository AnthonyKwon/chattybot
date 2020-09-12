const string = require('../stringResolver');

module.exports = {
    name: 'info',
    argsRequired: true,
    aliases: [string.get('infoCommandAliases')],
    description: string.get('infoCommandDesc'),
    execute(message, args) {
        message.channel.send('NO_MESSAGE');
    },
};
