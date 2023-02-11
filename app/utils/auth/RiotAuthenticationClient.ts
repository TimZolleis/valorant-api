import type {AxiosInstance} from "axios";
import type {CookieJar} from "tough-cookie";
import {ReauthenticationCookies} from "~/models/cookies/ReauthenticationCookies";
import {getAuthorizationHeader, getLoginClient} from "~/utils/axios/client.server";
import {ENDPOINTS} from "~/models/Endpoint";
import type {RSOUserInfo} from "~/models/user/authentication/RSOUserInfo";
import {ValorantUser} from "~/models/user/ValorantUser";
import {parseTokenData} from "~/utils/token/token";

export class RiotAuthenticationClient {
    client: AxiosInstance;
    jar: CookieJar;

    constructor() {
        const { cookieJar, client } = getLoginClient();
        this.jar = cookieJar;
        this.client = client;
        return this;
    }

    async authorize(username: string, password: string){
        await this.requestCookies();
        const { idToken, accessToken } = await this.requestAccessToken(username, password);
        const entitlementsToken = await this.requestEntitlementsToken(accessToken);
        const reauthenticationCookies = await new ReauthenticationCookies().init(this.jar);
        const userData = await this.requestUserData(accessToken);
        return new ValorantUser(accessToken, entitlementsToken, reauthenticationCookies, userData)
    }

    private async requestCookies() {
        return await this.client
            .post(`${ENDPOINTS.AUTH}/api/v1/authorization`, {
                ...AUTHORIZATION_BODY,
            })
            .catch((error) => {});
    }

    private async requestAccessToken(username: string, password: string) {
        return await this.client
            .put(`${ENDPOINTS.AUTH}/api/v1/authorization`, {
                type: 'auth',
                username: username,
                password: password,
                remember: true,
                language: 'en_US',
            })
            .then((response) => {
                return parseTokenData(response.data.response.parameters.uri);
            }).catch(error => {
                throw new Error("No access token present in response!")
            })

    }

    private async requestEntitlementsToken(accessToken: string) {
        return await this.client
            .post(
                `${ENDPOINTS.ENTITLEMENTS}/api/token/v1`,
                {},
                { headers: { ...getAuthorizationHeader(accessToken) } }
            )
            .then((response) => response.data.entitlements_token)

    }

    private async requestUserData(accessToken: string): Promise<RSOUserInfo> {
        return await this.client
            .get(`${ENDPOINTS.AUTH}/userinfo`, {
                headers: {
                    ...getAuthorizationHeader(accessToken),
                },
            })
            .then((response) => response.data)
    }


}

const AUTHORIZATION_BODY = {
    client_id: 'play-valorant-web-prod',
    nonce: 1,
    redirect_uri: 'https://playvalorant.com/opt_in',
    response_type: 'token id_token',
    scope: 'account openid',
};