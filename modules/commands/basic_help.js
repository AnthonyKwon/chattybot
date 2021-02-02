const { logger } = require('../common');
const configManager = require('../configManager.js');
const string = require('../stringManager.js');

const config = configManager.read('prefix');

function commandHelp(message, args) {
    const reply = [];
    if (args.length === 0) {
        /* If no argument provided, send full help to DM */
        reply.push(string.stringFromId('catty.help.message.main.line1'));
        reply.push(string.stringFromId('catty.help.message.main.line2'));
        reply.push('*' + message.client.commands.map(cmd => '%' + string.stringFromId(cmd.name)).join(', ') + '*');
        reply.push('\n' + string.stringFromId('catty.help.message.main.line3',
            config.prefix, string.stringFromId(this.name), string.stringFromId(this.usage)));
        try {
            const resposne = message.author.send(reply, {split:true});
            message.channel.send(string.stringFromId('catty.help.message.check_dm', message.author));
        } catch(err) {
            logger.log('info', `[discord.js] Failed to send DM to ${message.author.tag}: ${err}\n${err.body}\n${err.stack}`);
            message.channel.send(string.stringFromId('catty.help.message.dm_failed', message.author));
        }
    }
}

module.exports = {
    name: 'catty.command.help',
    description: 'catty.command.help.desc',
    argsRequired: false,
    aliases: 'catty.command.help.aliases',
    usage: 'catty.command.help.usage',
    cooldown: 5,
    execute: commandHelp
}

