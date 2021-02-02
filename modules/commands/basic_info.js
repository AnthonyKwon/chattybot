const string = require('../stringManager.js');
const info = require('../../package.json');

const devFlag = process.env.NODE_ENV === 'development' ? true : false;

module.exports = {
    name: 'chattybot.command.info',
    aliases: 'chattybot.command.info.aliases',
    description: 'chattybot.command.info.desc',
    cooldown: 30,
    execute(message) {
        const reply = [];
        reply.push(string.stringFromId('chattybot.info.message.line1', message.client.user, info.version));
        if (devFlag === true) reply.push(string.stringFromId('chattybot.info.message.maintenance', message.client.user));
        reply.push(string.stringFromId('chattybot.info.message.line2', message.client.user));
        reply.push(string.stringFromId('chattybot.info.message.line3'));
        reply.push(string.stringFromId('chattybot.info.message.line4', info.repository.url));
        message.channel.send(reply);
    },
};
