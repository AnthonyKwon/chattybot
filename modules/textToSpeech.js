const TTS = require('@google-cloud/text-to-speech');
const string = require('./stringResolver');
const { Readable } = require('stream');

const client = new TTS.TextToSpeechClient();
let lastAuthor, lastChannel;
let ssmlGender = 'FEMALE', speed = '1.0', pitch = '0.0', volumeGain = '0.0';

const requestSample = {
    input: { text: 'This is a sample text.' },
    voice: { languageCode: string.get('ttsLocale'), ssmlGender: ssmlGender },
    audioConfig: { audioEncoding: 'OGG_OPUS', speakingRate: speed, pitch: pitch, volumeGainDb: volumeGain }
};

/*
 * @param binary Buffer
 * returns readableInstanceStream Readable
 * https://stackoverflow.com/a/54136803
 */
const bufferToStream = (binary) => {
    const readableInstanceStream = new Readable({
        read() {
            this.push(binary);
            this.push(null);
        }
    });
    return readableInstanceStream;
}

const getUsername = (message) => {
    const username = message.client.guilds.cache.get(message.guild.id).member(message.author).displayName;
    return username.split('_').join(' ');
}

const tts_speak = async (connection, message, text) => {
    let request = requestSample;
    if ((message.author !== lastAuthor) || (connection.channel.id !== lastChannel)) {
        request.input = { ssml: '<speak>' + string.get('ttsPrefix').format(getUsername(message)) + '<break time="0.5s"/>' + text + '</speak>' };
    } else {
        request.input = { text: text }
    }
    console.log(request); /* debug */
    lastAuthor = message.author;
    lastChannel = connection.channel.id;
    const [response] = await client.synthesizeSpeech(request);
    const stream = bufferToStream(response.audioContent);
    connection.play(stream, { type: 'ogg/opus' });
}

module.exports = {
    speak: tts_speak
}
