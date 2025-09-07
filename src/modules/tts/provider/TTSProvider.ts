import { Readable } from 'node:stream';
import RequestBuilder from "./RequestBuilder";

/**
 * Represents upstream Text-to-Speech provider service.
 * @alpha
 * @todo Complete JSDocs
 */
export default abstract class TTSProvider {
    /**
     * Reports if Text-to-speech provider is available.<br/>
     * Must return {@link true} for valid TTS provider.
     */
    static get available() {
        return false;
    }

    /** Create request data from provided information. */
    get RequestBuilder(): typeof RequestBuilder {
        throw new Error('Method "RequestBuilder()" must be implemented.')
    }

    /**
     * Synthesize name of the message author.
     * @param name - Name of the author.
     */
    abstract speakName(name: string): Promise<Readable>;

    /**
     * Synthesize text from TTS provider.
     * @param text - Text to speak.
     */
    abstract speak(text: string): Promise<Readable>;
}