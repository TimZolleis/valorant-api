export const valorantApiEndpoints = {
    maps: '/maps',
    characterByUuid: (characterId: string) => `/agents/${characterId}`,
    competitiveSeasons: '/seasons/competitive',
    competitiveTierByUUid: (competitiveTierUUid: string) =>
        `/competitivetiers/${competitiveTierUUid}`,
    seasonByUuid: (seasonId: string) => `/seasons/${seasonId}`,
    weapon: {
        skinlevel: (skinlevelId: string) => `/weapons/skinlevels/${skinlevelId}`,
        allSkinlevels: `/weapons/skinlevels`,
        all: '/weapons',
        byUuid: (uuid: string) => `/weapons/${uuid}`,
    },
};
