/** This {@link Error} is thrown when requested channel is not valid. */
export class InvalidChannelError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidChannelError";
    }
}