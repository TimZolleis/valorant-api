import type { AxiosInstance } from 'axios';
import type { ValorantUser } from '~/models/user/ValorantUser';
import { CookieJar } from 'tough-cookie';
import { getAuthorizationHeader, getLoginClient } from '~/utils/axios/client.server';
import { ENDPOINTS } from '~/models/Endpoint';
import { parseTokenData } from '~/utils/token/token';
import { ReauthenticationCookies } from '~/models/cookies/ReauthenticationCookies';

export class RiotReauthenticationClient {
    client: AxiosInstance;
    user: ValorantUser;
    jar: CookieJar;

    async init(user: ValorantUser) {
        const jar = await this.getReauthenticationCookieJar(user);
        const { cookieJar, client } = getLoginClient(jar);
        this.user = user;
        this.jar = cookieJar;
        this.client = client;
        return this;
    }

    private async getReauthenticationCookieJar(user: ValorantUser) {
        const jar = new CookieJar();
        const domain = ENDPOINTS.AUTH;
        await Promise.all([
            jar.setCookie(user.reauthenticationCookies.sub, domain),
            jar.setCookie(user.reauthenticationCookies.csid, domain),
            jar.setCookie(user.reauthenticationCookies.clid, domain),
            jar.setCookie(user.reauthenticationCookies.ssid, domain),
        ]);
        return jar;
    }

    private async requestAccessToken() {
        return await this.client
            .get(ENDPOINTS.REAUTH)
            .then((response) => {
                return parseTokenData(response.request.res.responseUrl);
            })
            .catch((error) => {
                try {
                    return parseTokenData(error.response.request.res.responseUrl);
                } catch (error) {
                    throw new Error('No access token present in response!');
                }
            });
    }
    private async requestEntitlementsToken(accessToken: string) {
        return await this.client
            .post(
                `${ENDPOINTS.ENTITLEMENTS}/api/token/v1`,
                {},
                { headers: { ...getAuthorizationHeader(accessToken) } }
            )
            .then((response) => response.data.entitlements_token)
            .catch(() => {
                throw new Error('No entitlement token present in response!');
            });
    }
    async reauthenticate() {
        const { accessToken } = await this.requestAccessToken();
        const entitlement = await this.requestEntitlementsToken(accessToken);
        const reauthenticationCookies = await new ReauthenticationCookies().init(this.jar);
        this.user.accessToken = accessToken;
        this.user.entitlement = entitlement;
        this.user.reauthenticationCookies = reauthenticationCookies;
        return this.user;
    }
}
