const string = require('../stringManager.js');
const info = require('../../package.json');

const devFlag = process.env.NODE_ENV === 'development' ? true : false;

module.exports = {
    name: 'catty.command.info',
    acceptDM: true,
    aliases: 'catty.command.info.aliases',
    description: 'catty.command.info.desc',
    execute(message) {
        const reply = [];
        reply.push(string.stringFromId('catty.info.message.line1', message.client.user, info.version));
        if (devFlag === true) reply.push(string.stringFromId('catty.info.message.maintenance', message.client.user));
        reply.push(string.stringFromId('catty.info.message.line2', message.client.user));
        reply.push(string.stringFromId('catty.info.message.line3'));
        reply.push(string.stringFromId('catty.info.message.line4', info.repository.url));
        message.channel.send(reply);
    },
};
