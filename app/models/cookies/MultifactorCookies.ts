import type { CookieJar } from 'tough-cookie';
import { InvalidReauthenticationCookiesException } from '~/exceptions/InvalidReauthenticationCookiesException';

export type AuthenticationCookies = {
    asid: string;
    clid: string;
};

export class MultifactorCookies {
    asid: string;
    clid: string;

    async init(jar: CookieJar) {
        const cookieStrings = await jar.getSetCookieStrings('https://auth.riotgames.com');
        cookieStrings.forEach((cookieString) => {
            this.setCookie(cookieString);
        });
        this.verify();
        return this;
    }

    private setCookie(cookieString: string) {
        if (cookieString.includes('asid')) {
            this.asid = cookieString;
        }
        if (cookieString.includes('clid')) {
            this.clid = cookieString;
        }
    }

    private verify() {
        if (!this.asid) {
            throw new InvalidReauthenticationCookiesException();
        }
        if (!this.clid) {
            throw new InvalidReauthenticationCookiesException();
        }
    }

    get() {
        return this;
    }

    getJson() {
        return JSON.stringify(this);
    }
}
