const fs = require('fs');
const path = require('path');
const common = require(path.join(__dirname, '../common'));
const config = require(path.join(__dirname, '../configLoader'));
const { staff_roles } = config.load(['staff_roles']);

module.exports = {
    name: 'reload',
    description: '명령어 세트를 다시 불러옵니다.',
    execute (message, args) {
        const commandName = args[0] ? args[0].toLowerCase() : undefined;
        const command = commandName ? message.client.commands.get(commandName)
            || message.client.commands.get(message.client.aliases.get(commandName)) : undefined;
        if (args[0] && !command) return message.channel.send("해당 명령어를 찾을 수 없어요. 다시 시도해 주세요.");
        fs.readdirSync(path.join(__dirname)).filter(file => file.endsWith('.js')).forEach(file => {
            const newCommand = require(path.join(__dirname, file));
            if ((args[0] && newCommand.name === command.name) || (args.length === 0)) {
                try {
                    delete require.cache[require.resolve(path.join(__dirname, file))];
                    message.client.commands.set(newCommand.name, newCommand);
                    return message.channel.send(`\`${file}\`를 성공적으로 갱신했습니다!`);
                } catch {
                    message.channel.send('`' + `${prefix}` + `${args[0].toLowerCase()}` + '`을 갱신하지 못했습니다!');
                    return common.logger.log('error', e.stack || e);
                }
            }
        });
    }
}
