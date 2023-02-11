import { ValorantUser } from '~/models/user/ValorantUser';

export class ReauthenticationRequiredException extends Error {
    static #errorMessage = 'Reauthentication required!';
    constructor(message: string = ReauthenticationRequiredException.#errorMessage) {
        super(message);
    }
}
