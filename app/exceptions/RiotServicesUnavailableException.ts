export class RiotServicesUnavailableException extends Error {
    static #errorMessage = 'Riot services are currently unavailable';
    constructor(message: string = RiotServicesUnavailableException.#errorMessage) {
        super(message);
    }
}
