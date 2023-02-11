export function parseTokenData(uri: string): {
    idToken: string;
    accessToken: string;
} {
    const url = new URL(uri);
    const params = new URLSearchParams(url.hash.substring(1));
    const accessToken = params.get('access_token');
    const idToken = params.get('id_token');

    if (!accessToken) {
        throw new Error("No access token present in response")
    }
    if (!idToken) {
        throw new Error("No id token present in response")
    }
    return {
        idToken,
        accessToken,
    };
}