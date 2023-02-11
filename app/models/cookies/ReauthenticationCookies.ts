import { CookieJar } from "tough-cookie";
import {InvalidReauthenticationCookiesException} from "~/exceptions/InvalidReauthenticationCookiesException";

export class ReauthenticationCookies {
  sub: string;
  ssid: string;
  clid: string;
  csid: string;

  async init(jar: CookieJar) {
    const cookieStrings = await jar.getSetCookieStrings(
      "https://auth.riotgames.com"
    );
    cookieStrings.forEach((cookieString) => {
      this.setCookie(cookieString);
    });
    this.verify();
    return this;
  }

  private setCookie(cookieString: string) {
    if (cookieString.includes("sub")) {
      this.sub = cookieString;
    }
    if (cookieString.includes("ssid")) {
      this.ssid = cookieString;
    }

    if (cookieString.includes("clid")) {
      this.clid = cookieString;
    }
    if (cookieString.includes("csid")) {
      this.csid = cookieString;
    }
  }

  private verify() {
    if (!this.sub) {
      throw new InvalidReauthenticationCookiesException();
    }
    if (!this.ssid) {
      throw new InvalidReauthenticationCookiesException();
    }
    if (!this.clid) {
      throw new InvalidReauthenticationCookiesException();
    }
    if (!this.csid) {
      throw new InvalidReauthenticationCookiesException();
    }
  }

  get() {
    return this;
  }
}
