module.exports = {
    name: 'info',
    argsRequired: false,
    aliases: ['정보'],
    description: 'Catty에 대한 정보를 알려줍니다.',
    execute(message, args) {
        message.channel.send('정보: 현재 내용이 없습니다.');
    },
};
