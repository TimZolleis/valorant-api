export const unofficalValorantApiEndpoints = {
    getAccountByNameAndTag: (name: string, tag: string) => `/v1/account/${name}/${tag}`,
    getAccountByPuuid: (puuid: string) => `/v1/by-puuid/account/${puuid}`,
};
