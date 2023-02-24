export class MultifactorAuthenticationRequiredException extends Error {
    static #errorMessage = 'Multifactor authentication required!';
    mailAddress: string;
    cookieString: string;
    constructor(
        message: string = MultifactorAuthenticationRequiredException.#errorMessage,
        mailAddress: string,
        cookieString: string
    ) {
        super(message);
        this.mailAddress = mailAddress;
        this.cookieString = cookieString;
    }
}
