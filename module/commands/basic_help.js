const common = require('../common.js');
const config = require('../config.js');
const localize = require('../localization.js');
const logger = require('../logger.js');

async function commandHelp(message, args) {
    const reply = [];
    if (args.length === 0) {
        const commands = message.client.commands.map(cmd => '\\' + config.prefix + localize.command(cmd.name, 'name'));
        /* If no argument provided, send full help to DM */
        reply.push(localize.get('message.help.dm',
            '*' + commands.join(', ') + '*', config.prefix, localize.command(this.name, 'name'), localize.command(this.name, 'usage')));
        try {
            /* try to send DM to message author */
            const resposne = await message.author.send(reply, {split:true});
            message.channel.send(localize.get('message.help.dm_sent', message.author));
            logger.log('verbose', `[discord.js] Sent help DM to ${message.author}.`);
        } catch (err) {
            /* DM failed. send error to channel */
            message.channel.send(localize.get('error.help.dm_failed', message.author));
            logger.log('error', `[discord.js] Failed to send DM to ${message.author}!\n${err.stack}\n`);
        }
    } else {
        const commandName = args[0];

        const command = message.client.commands.get(commandName)
            || message.client.commands.find(cmd => localize.commandCheck(commandName, cmd.name))
            || message.client.commands.find(cmd => common.parseAliases(commandName, cmd.aliases));

        // Show unknown command message and return
        if (!command) {
            message.channel.send(localize.get('error.discord.unknown_command'));
            return;
        }

        let usage = localize.command(command.name, 'usage');
        let description = localize.command(command.name, 'desc');

        if (usage === command.name)
            usage = '';
        if (description === command.name)
            description = localize.get('message.help.no_desc');

        message.channel.send(localize.get('message.help.detail',
                config.prefix, localize.command(command.name, 'name'), usage, description));
    }
    return;
}

module.exports = {
    name: 'help',
    argsRequired: false,
    cooldown: 15,
    execute: commandHelp
}

