import { Readable } from 'node:stream';
import { IRequestBuilderOptions } from './IRequestBuilderOptions';
import {TextToSpeechClient} from "@google-cloud/text-to-speech";

/** Represents upstream Text-to-Speech provider service. */
export default abstract class TTSProvider {
    /**
     * Reports if Text-to-speech provider is available.<br/>
     * Must return {@link true} for valid TTS provider.
     */
    static get available() {
        return false;
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