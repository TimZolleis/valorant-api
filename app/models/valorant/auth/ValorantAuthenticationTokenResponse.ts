export interface Parameters {
    uri: string;
}

export interface Response {
    mode: string;
    parameters: Parameters;
}

export interface ValorantAuthenticationTokenResponse {
    type: AuthType;
    response: Response;
    country: string;
}

export type AuthType = 'multifactor' | 'response';
