import type { AxiosInstance } from 'axios';
import { CookieJar } from 'tough-cookie';
import { ReauthenticationCookies } from '~/models/cookies/ReauthenticationCookies';
import { getAuthorizationHeader, getLoginClient } from '~/utils/axios/client.server';
import { ENDPOINTS } from '~/models/Endpoint';
import type { RSOUserInfo } from '~/models/user/authentication/RSOUserInfo';
import { ValorantUser } from '~/models/user/ValorantUser';
import { parseTokenData } from '~/utils/token/token';
import type { ValorantAuthenticationTokenResponse } from '~/models/valorant/auth/ValorantAuthenticationTokenResponse';
import type { ValorantAuthenticationMultifactorResponse } from '~/models/valorant/auth/ValorantAuthenticationMultifactorResponse';
import { MultifactorAuthenticationRequiredException } from '~/exceptions/MultifactorAuthenticationRequiredException';
import type { AuthenticationCookies } from '~/models/cookies/MultifactorCookies';
import { MultifactorCookies } from '~/models/cookies/MultifactorCookies';

export class RiotAuthenticationClient {
    client: AxiosInstance;
    jar: CookieJar;

    constructor() {
        const { cookieJar, client } = getLoginClient();
        this.jar = cookieJar;
        this.client = client;
        return this;
    }

    async authorize(username: string, password: string) {
        await this.requestCookies();
        const { accessToken } = await this.requestAccessToken(username, password);
        const entitlementsToken = await this.requestEntitlementsToken(accessToken);
        const reauthenticationCookies = await new ReauthenticationCookies().init(this.jar);
        const userData = await this.requestUserData(accessToken);
        return new ValorantUser(accessToken, entitlementsToken, reauthenticationCookies, userData);
    }

    async authorizeWithMultifactor(
        multifactorCode: string,
        authenticationCookies: AuthenticationCookies
    ) {
        const { accessToken } = await this.requestMultifactorAccessToken(
            multifactorCode,
            authenticationCookies
        );
        const entitlementsToken = await this.requestEntitlementsToken(accessToken);
        const reauthenticationCookies = await new ReauthenticationCookies().init(this.jar);
        const userData = await this.requestUserData(accessToken);
        return new ValorantUser(accessToken, entitlementsToken, reauthenticationCookies, userData);
    }

    private async requestCookies() {
        return await this.client
            .post(`${ENDPOINTS.AUTH}/api/v1/authorization`, {
                ...AUTHORIZATION_BODY,
            })
            .catch((error) => {
                console.log('There was an error requesting cookies', error);
            });
    }

    private async requestAccessToken(username: string, password: string) {
        return await this.client
            .put<ValorantAuthenticationTokenResponse>(`${ENDPOINTS.AUTH}/api/v1/authorization`, {
                type: 'auth',
                username: username,
                password: password,
                remember: true,
                language: 'en_US',
            })
            .then(async (response) => {
                if (isMultifactorResponse(response.data)) {
                    const multifactorCookies = await new MultifactorCookies().init(this.jar);
                    throw new MultifactorAuthenticationRequiredException(
                        'Multi factor authentication required',
                        response.data.multifactor.email,
                        multifactorCookies.getJson()
                    );
                }
                return parseTokenData(response.data.response.parameters.uri);
            })
            .catch((error) => {
                if (error instanceof MultifactorAuthenticationRequiredException) {
                    throw error;
                }
                throw new Error('No access token present in response!');
            });
    }

    private async requestEntitlementsToken(accessToken: string) {
        return await this.client
            .post(
                `${ENDPOINTS.ENTITLEMENTS}/api/token/v1`,
                {},
                { headers: { ...getAuthorizationHeader(accessToken) } }
            )
            .then((response) => response.data.entitlements_token);
    }

    private async requestUserData(accessToken: string): Promise<RSOUserInfo> {
        return await this.client
            .get(`${ENDPOINTS.AUTH}/userinfo`, {
                headers: {
                    ...getAuthorizationHeader(accessToken),
                },
            })
            .then((response) => response.data);
    }

    private async requestMultifactorAccessToken(
        multifactorCode: string,
        authenticationCookies: AuthenticationCookies
    ) {
        const jar = new CookieJar(undefined, { rejectPublicSuffixes: false });
        const domain = ENDPOINTS.AUTH;
        await Promise.all([
            jar.setCookie(authenticationCookies.clid, domain),
            jar.setCookie(authenticationCookies.asid, domain),
        ]);
        const { cookieJar, client } = getLoginClient(jar);
        this.jar = cookieJar;
        this.client = client;
        return await this.client
            .put<ValorantAuthenticationTokenResponse>(
                'https://auth.riotgames.com/api/v1/authorization',
                {
                    type: 'multifactor',
                    code: multifactorCode,
                    rememberDevice: true,
                }
            )
            .then((response) => {
                return parseTokenData(response.data.response.parameters.uri);
            })
            .catch((error) => {
                console.log(error);
                throw new Error(`Invalid code: ${error.message}`);
            });
    }
}

function isMultifactorResponse(
    response: ValorantAuthenticationTokenResponse | ValorantAuthenticationMultifactorResponse
): response is ValorantAuthenticationMultifactorResponse {
    return response.type === 'multifactor';
}

const AUTHORIZATION_BODY = {
    client_id: 'play-valorant-web-prod',
    nonce: 1,
    redirect_uri: 'https://playvalorant.com/opt_in',
    response_type: 'token id_token',
    scope: 'account openid',
};
