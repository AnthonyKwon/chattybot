import { Readable } from 'node:stream';
import { IRequestBuilderOptions } from './IRequestBuilderOptions';

/** Represents upstream Text-to-Speech provider service. */
export default abstract class TTSProvider {
    /**
     * Reports if Text-to-speech provider is available.<br/>
     * Must return {@link true} for valid TTS provider.
     */
    static get available() {
        return false;
    }

    /** Create new provider instance. */
    static create(options?: IRequestBuilderOptions): Promise<TTSProvider> {
        throw new Error('Method "create()" must be implemented.');
    }

    /**
     * Synthesize the name of the author.
     * @param name Name of the author.
     */
    abstract speakName(name: string): Promise<Readable>;

    /**
     * Synthesize the requested content.
     * @param text Content to synthesize.
     */
    abstract speak(text: string): Promise<Readable>;
}