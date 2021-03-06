const localize = require('../localization.js');
const info = require('../../package.json');

const devFlag = process.env.NODE_ENV === 'development' ? true : false;

module.exports = {
    name: 'info',
    cooldown: 15,
    execute(message) {
        const reply = [];
        message.channel.send(localize.get('message.info.maintenance', message.client.user));
        message.channel.send(localize.get('message.info', message.client.user, info.version, info.repository.url));
        return;
    },
};
