export class ValorantApiNotAvailableException extends Error {
    static #errorMessage = 'The valorant-api is currently not available';
    constructor(message: string = ValorantApiNotAvailableException.#errorMessage) {
        super(message);
    }
}
