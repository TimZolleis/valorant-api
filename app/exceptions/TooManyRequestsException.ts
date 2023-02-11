export class TooManyRequestsException extends Error {
    static #errorMessage = 'You are sending too many requests to Riot API. Please slow down';
    constructor(message: string = TooManyRequestsException.#errorMessage) {
        super(message);
    }
}
