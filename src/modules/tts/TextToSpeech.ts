import config from "../config/ConfigLoader";
import {IQueueableSpeech} from "./IQueueableSpeech";
import TTSProvider from "./provider/TTSProvider";
import getProvider from "./provider/GetProvider";
import {InvalidProviderError} from "./error/InvalidProviderError";

/**
 *
 * @alpha
 * @todo Complete JSDocs
 */
export default class TextToSpeech {
    protected _last: IQueueableSpeech | undefined;
    protected _provider: TTSProvider | undefined;
    protected _queue: Array<IQueueableSpeech> | undefined;

    protected constructor(provider: TTSProvider, queue?: Array<IQueueableSpeech>, last?: IQueueableSpeech) {
         this._provider = provider;
         this._queue = queue;
         this._last = last;
    }

    static async create(locale?: string): Promise<TextToSpeech> {
        // create provider based on config
        const provider = await getProvider(config.tts.provider, locale);
        const queue = new Array<IQueueableSpeech>();

        // throw error when provider not found
        if (!provider)
            throw new InvalidProviderError(`Provider ${provider} is not valid.`);

        // create new object and return it
        return new TextToSpeech(provider, queue);
    }

    async addQueue(speech: IQueueableSpeech): Promise<void> {
        // ignore when queue is not initialized
        if (!this._queue) return;

        // add speech to queue
        this._queue.push(speech);
    }

    async speak(callback: Function): Promise<void> {
        // ignore when queue or provider not initialized
        if (!this._queue || !this._provider) return;

        // ignore when queue already full (prevent simultaneous execution)
        if (this._queue.length > 1) return;

        // repeat until queue becomes empty
        do {
            // synthesize name when author of previous and current speech does not match
            if (!this._last || (this._queue[0].author.id !== this._last.author.id))
                await callback(await this._provider.speakName(this._queue[0].author.displayName));

            // synthesize text and pipe it to callback
            await callback(await this._provider.speak(this._queue[0].text));

            // shift the queue and save previous one to last key
            this._last = this._queue.shift();
        } while (this._queue.length > 0);
    }
}