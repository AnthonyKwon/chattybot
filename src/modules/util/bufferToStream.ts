const { Readable } = require('node:stream');

export function bufferToStream(binary: any): ReadableStream {
    /**
     * Convert Buffer to ReadableStream
     * see https://stackoverflow.com/a/54136803
     * 
     * @param binary - Buffer
     * @returns readableInstanceStream Readable
     */
    const readableInstanceStream: ReadableStream<any> = new Readable({
        read() {
            this.push(binary);
            this.push(null);
        }
    });
    return readableInstanceStream;
}