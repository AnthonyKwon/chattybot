const fs = require('fs');
let { getTtsConnection, setTtsConnection, getYtConnection, setYtConnection } = require('../common');
const string = require('../stringResolver');
const tts = require('../textToSpeech');

const leaveInternal = async (message, args) => {
    if (!getTtsConnection()) {
        return;
    }
    getTtsConnection().disconnect();
    getYtConnection().disconnect();
}

module.exports = {
    name: 'leave',
    description: string.get('leaveCommandDesc'),
    argsRequired: false,
    aliases: [string.get('leaveCommandAliases')],
    cooldown: 5,
    execute(message, args) {
        return leaveInternal(message, args);
    }
}
