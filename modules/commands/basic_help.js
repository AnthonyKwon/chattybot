const configManager = require('../configManager.js');
const logger = require('../logger.js');
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
            /* try to send DM to message author */
            const resposne = message.author.send(reply, {split:true});
            message.channel.send(string.stringFromId('chattybot.help.message.check_dm', message.author));
            logger.log('verbose', `[discord.js] Sent help DM to ${message.author}.`);
        } catch(err) {
            /* DM failed. send error to channel */
            message.channel.send(string.stringFromId('chattybot.help.message.dm_failed', message.author));
            logger.log('error', `[discord.js] Failed to send DM to ${message.author}!\n${err.stack}\n`);
        }
    } else {
        /* forgot to re-implement here... */
    }
    return;
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

