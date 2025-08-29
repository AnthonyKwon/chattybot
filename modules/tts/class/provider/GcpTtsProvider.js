const GcpTtsExt = require('@google-cloud/text-to-speech');
const path = require('node:path');
const bufferToStream = require('./GcpTtsProvider/bufferToStream.js');
const getKeyByValue = require('./GcpTtsProvider/getKeybyValue.js');
const GcpTtsParamBuilder = require('./GcpTtsProvider/ParameterBuilder.js');
const localeMap = require('./GcpTtsProvider/locale.json');
const TTSProvider = require('../TTSProvider.js');
const i18n = require('../../../i18n/main.mod.js');

// Google Cloud Text-to-Speech Engine Class
class GcpTts extends TTSProvider {
    constructor(params) {
        super();
        const ttsOptions = {
            projectId: undefined,
            keyFilename: undefined
        };
        // fill required options when Service Account Key method is used
        if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            ttsOptions.projectId = require('../../../../configs/gcp-credentials.json').project_id;
            ttsOptions.keyFilename = path.join(path.dirname(require.main.filename), 'configs/gcp-credentials.json');
        }
        this._client = new GcpTtsExt.TextToSpeechClient(ttsOptions);
        this._request = params;
    }

    // (static) parameter builder for gcp-tts
    static get ParameterBuilder() { return GcpTtsParamBuilder }

    async speakPrefix(author) {
        this._request.input = {
            ssml: '<speak><prosody pitch="-4st">' + i18n.get(getKeyByValue(localeMap, this._request.voice.languageCode), 'tts.speak.prefix')
                .format(author.name) + '</prosody></speak>'
        };

        const [response] = await this._client.synthesizeSpeech(this._request);
        // Google sends response as buffer. We need to convert it as ReadableStream.
        const stream = bufferToStream(response.audioContent);
        return stream;
    }

    async speak(message) {
        this._request.input = { text: message.content };

        const [response] = await this._client.synthesizeSpeech(this._request);
        // Google sends response as buffer. We need to convert it as ReadableStream.
        const stream = bufferToStream(response.audioContent);
        return stream;
    }
}

module.exports = { GcpTts };