export class InvalidProviderError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = 'InvalidProviderError';
    }
}