const { logger } = require('../common');
const configManager = require('../configManager.js');
const string = require('../stringManager.js');

const config = configManager.read('prefix');

function commandHelp(message, args) {
    const reply = [];
    if (args.length === 0) {
        /* If no argument provided, send full help to DM */
        reply.push(string.stringFromId('chattybot.help.message.main.line1'));
        reply.push(string.stringFromId('chattybot.help.message.main.line2'));
        reply.push('*' + message.client.commands.map(cmd => '%' + string.stringFromId(cmd.name)).join(', ') + '*');
        reply.push('\n' + string.stringFromId('chattybot.help.message.main.line3',
            config.prefix, string.stringFromId(this.name), string.stringFromId(this.usage)));
        try {
            const resposne = message.author.send(reply, {split:true});
            message.channel.send(string.stringFromId('chattybot.help.message.check_dm', message.author));
        } catch(err) {
            logger.log('info', `[discord.js] Failed to send DM to ${message.author.tag}: ${err}\n${err.body}\n${err.stack}`);
            message.channel.send(string.stringFromId('chattybot.help.message.dm_failed', message.author));
        }
    } else {
        /* forgot to re-implement here... */
    }
}

module.exports = {
    name: 'chattybot.command.help',
    description: 'chattybot.command.help.desc',
    argsRequired: false,
    aliases: 'chattybot.command.help.aliases',
    usage: 'chattybot.command.help.usage',
    cooldown: 30,
    execute: commandHelp
}

