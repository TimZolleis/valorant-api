export class NoCoregameFoundException extends Error {
    static #errorMessage = 'No running core game detected!';
    constructor(message: string = NoCoregameFoundException.#errorMessage) {
        super(message);
    }
}
