const { logger } = require('../common');
const config = require('../configLoader');
const string = require('../stringResolver');
const { prefix } = config.load(['prefix']);

module.exports = {
    name: 'help',
    description: string.get('helpCommandDesc'),
    argsRequired: false,
    aliases: [string.get('helpCommandAliases1'), string.get('helpCommandAliases2')],
    usage: string.get('helpCommandUsage'),
    cooldown: 5,
    execute(message, args) {
        const data = [];
        const { commands } = message.client;

        if (!args.length) {
            data.push(string.get('helpDescLine1'));
            data.push(commands.map(command => command.name).join(', '));
            data.push(string.get('helpDescLine3').format(prefix));

            return message.author.send(data, {split: true})
                .then(() => {
                    if (message.channel.type === 'dm') return;
                    message.channel.send(string.get('helpDescSendSucceed').format(message.author));
                }).catch(error => {
                    logger.log('info', `[discord.js] Failed to send DM to ${message.author.tag}: ${error}\n${error.body}`);
                    message.channel.send(string.get('helpDescSendFailed').format(message.author));
                });
        }

        const name = args[0].toLowerCase();
        command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.channel.send(string.get('unknownCommandError'));
        }

        data.push(string.get('helpSingleName').format(command.name));
        if (command.aliases) data.push(string.get('helpSingleAliases').format(command.aliases.join(', ')));
        if (command.description) data.push(string.get('helpSingleDesc').format(command.description));
        if (command.usage) data.push(string.get('helpSingleUsage').format(prefix, command.name, command.usage));
        data.push(string.get('helpSingleCoolDown').format(command.cooldown || 3));

        message.channel.send(data, { split: true });
    }
}
