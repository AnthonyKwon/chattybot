const fs = require('fs');
const path = require('path');
const { logger } = require(path.join(__dirname, '../common'));
const config = require(path.join(__dirname, '../configLoader'));
const string = require(path.join(__dirname, '../stringResolver'));
const { staff_roles } = config.load(['staff_roles']);

const commandFunc = (message, args) => {
    /* If user doesn't have a staff role, block command use */
    if (!message.member.roles.cache.some((role) => role === staff_roles)) {
        logger.log('error', `${message.author.tag} tried to reload without permission!`);
        message.channel.send(string.get('noPermissionError'));
        return;
    }

    const commandName = args[0] ? args[0].toLowerCase() : undefined;
    const command = commandName ? message.client.commands.get(commandName)
        || message.client.commands.get(message.client.aliases.get(commandName)) : undefined;
    if (args[0] && !command) return message.channel.send(string.get('unknownCommandError'));
    fs.readdirSync(path.join(__dirname)).filter(file => file.endsWith('.js')).forEach(file => {
        const newCommand = require(path.join(__dirname, file));
        if ((args[0] && newCommand.name === command.name) || (args.length === 0)) {
            try {
                    delete require.cache[require.resolve(path.join(__dirname, file))];
                    message.client.commands.set(newCommand.name, newCommand);
                    return message.channel.send(string.get('reloadComplete').format(file));
            } catch {
                message.channel.send(string.get('reloadFailed').format(prefix, args[0].toLowerCase()));
                return logger.log('error', e.stack || e);
            }
        }
    });
}

module.exports = {
    name: 'reload',
    description: string.get('reloadCommandDesc').format(string.get('localizedBotName')),
    execute (message, args) {
        commandFunc(message, args);
    }
}
