export class InvalidChannelError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidChannelError";
    }
}