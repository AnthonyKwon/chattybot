const common = require('../common');
const config = require('../configLoader');
const { prefix } = config.load(['prefix']);

module.exports = {
    name: 'help',
    description: '명령어 도움말을 보여줍니다.',
    argsRequired: false,
    aliases: ['commands', '도움말', '명령어'],
    usage: '[명령어]',
    cooldown: 5,
    execute(message, args) {
        const data = [];
        const { commands } = message.client;

        if (!args.length) {
            data.push('저의 모든 명령어 목록이에요:');
            data.push(commands.map(command => command.name).join(', '));
            data.push(`\n\`${prefix}help [명령어]\`를 입력해 특정 명령어에 대한 정보를 얻을 수 있어요!`);

            return message.author.send(data, {split: true})
                .then(() => {
                    if (message.channel.type === 'dm') return;
                    message.channel.send(`${message.author}님의 DM으로 명령어 도움말을 보냈습니다!`);
                }).catch(error => {
                    common.logger.log('info', `[discord.js] Failed to send DM to ${message.author.tag}: ${error}\n${error.body}`);
                    message.channel.send(`어라? ${message.author}님에게 DM을 보낼수 없는 것 같습니다! DM을 비활성화 하셨나요?`);
                });
        }

        const name = args[0].toLowerCase();
        command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.channel.send('알수 없는 명령어 입니다!');
        }

        data.push(`**명령어**: ${command.name}`);
        if (command.aliases) data.push(`**...또는**: ${command.aliases.join(', ')}`);
        if (command.description) data.push(`**설명**: ${command.description}`);
        if (command.usage) data.push(`**사용법**: ${prefix}${command.name} ${command.usage}`);
        data.push(`**대기시간**: ${command.cooldown || 3}초`);

        message.channel.send(data, { split: true });
    }
}
