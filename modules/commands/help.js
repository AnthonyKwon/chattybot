const { logger } = require('../common');
const config = require('../configLoader');
const string = require('../stringResolver');
const { prefix } = config.load(['prefix']);

const commandFunc = (message, args) => {
    const data = [];
    const { commands } = message.client;

    /* If no argument provided, send full help to DM */
    if (!args.length) {
        data.push(string.get('helpDmDescLine1').format(string.get('localizedBotName')));
        data.push(commands.map(command => command.name).join(', '));
        data.push(string.get('helpDmDescLine3').format(prefix));

        return message.author.send(data, {split: true})
            .then(() => {
                /* Notice user to check DM for help message */
                if (message.channel.type === 'dm') return;
                message.channel.send(string.get('helpDmDescSendSucceed').format(message.author));
            }).catch(error => {
                /* Notice DM send failure to user */
                logger.log('info', `[discord.js] Failed to send DM to ${message.author.tag}: ${error}\n${error.body}`);
                message.channel.send(string.get('helpDmDescSendFailed').format(message.author));
            });

        /* Parse command from argument */
        const name = args[0].toLowerCase();
        command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        /* If command doesn't exist, send error */
        if (!command) return message.channel.send(string.get('unknownCommandError'));

        /* Send help about parsed command */
        if (command.aliases) data.push(string.get('helpCmdDescNameWithAliases').format(prefix, command.name, command.aliases.join(', ')));
        else data.push(string.get('helpCmdDescName').format(prefix, command.name));
        if (command.description) data.push(string.get('helpCmdDescDesc').format(command.description));
        if (command.usage) data.push(string.get('helpCmdDescUsage').format(prefix, command.name, command.usage));
        data.push(string.get('helpCmdDescCooldown').format(command.cooldown || 3));

        message.channel.send(data, { split: true });
    }
}

module.exports = {
    name: 'help',
    description: string.get('helpCommandDesc').format(string.get('localizedBotName')),
    argsRequired: false,
    aliases: [string.get('helpCommandAliases')],
    usage: string.get('helpCommandUsage'),
    cooldown: 5,
    execute(message, args) {
        return commandFunc(message, args);
    }
}

