export class InvalidReauthenticationCookiesException extends Error {
    static #errorMessage = 'Invalid reauthenticaton cookies!';
    constructor(message: string = InvalidReauthenticationCookiesException.#errorMessage) {
        super(message);
    }
}
