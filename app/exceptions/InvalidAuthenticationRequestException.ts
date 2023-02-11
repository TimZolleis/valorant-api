export class InvalidAuthenticationRequestException extends Error {
    static #errorMessage = 'Please provide a valid authentication body';
    constructor(message: string = InvalidAuthenticationRequestException.#errorMessage) {
        super(message);
    }
}
