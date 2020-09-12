const fs = require('fs');
let { getTtsConnection, setTtsConnection, getYtConnection, setYtConnection } = require('../common');
const string = require('../stringResolver');

const sayInternal = async (message, args) => {
    if (!getTtsConnection() && message.member.voice.channel) {
        setTtsConnection(await message.member.voice.channel.join());
        setYtConnection(await message.member.voice.channel.join());
    } else if (!getTtsConnection() && args) {
        const channel = await message.client.channels.fetch(args[0]);
        setTtsConnection(await channel.join());
        setYtConnection(await channel.join());
    } else {
        return string.get('먼저 음성 채널에 들어가 있어야 해요.');
    }
}

module.exports = {
    name: 'join',
    description: string.get('joinCommandDesc'),
    argsRequired: true,
    aliases: [string.get('joinCommandAliases')],
    usage: string.get('joinCommandUsage'),
    cooldown: 5,
    execute(message, args) {
        return sayInternal(message, args);
    }
}
