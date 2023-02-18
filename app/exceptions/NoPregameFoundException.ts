export class NoPregameFoundException extends Error {
    static #errorMessage = 'No running pre game detected!';
    constructor(message: string = NoPregameFoundException.#errorMessage) {
        super(message);
    }
}
