const { logger } = require('../common');
const config = require('../configLoader');
const string = require('../stringResolver');
const { prefix } = config.load(['prefix']);

module.exports = {
    name: 'help',
    description: string.get('helpCommandDesc'),
    argsRequired: false,
    aliases: [string.get('helpCommandAliases')],
    usage: string.get('helpCommandUsage'),
    cooldown: 5,
    execute(message, args) {
        const data = [];
        const { commands } = message.client;

        if (!args.length) {
            data.push(string.get('helpDmDescLine1'));
            data.push(commands.map(command => command.name).join(', '));
            data.push(string.get('helpDmDescLine3').format(prefix));

            return message.author.send(data, {split: true})
                .then(() => {
                    if (message.channel.type === 'dm') return;
                    message.channel.send(string.get('helpDmDescSendSucceed').format(message.author));
                }).catch(error => {
                    logger.log('info', `[discord.js] Failed to send DM to ${message.author.tag}: ${error}\n${error.body}`);
                    message.channel.send(string.get('helpDmDescSendFailed').format(message.author));
                });
        }

        const name = args[0].toLowerCase();
        command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.channel.send(string.get('unknownCommandError'));
        }

        if (command.aliases) data.push(string.get('helpCmdDescNameWithAliases').format(prefix, command.name, command.aliases.join(', ')));
        else data.push(string.get('helpCmdDescName').format(prefix, command.name));
        if (command.description) data.push(string.get('helpCmdDescDesc').format(command.description));
        if (command.usage) data.push(string.get('helpCmdDescUsage').format(prefix, command.name, command.usage));
        data.push(string.get('helpCmdDescCooldown').format(command.cooldown || 3));

        message.channel.send(data, { split: true });
    }
}
