export const endpoints = {
    match: {
        history: (puuid: string) => `/match-history/v1/history/${puuid}`,
        details: (matchId: string) => `/match-details/v1/matches/${matchId}`,
        core: {
            getMatchId: (puuid: string) => `/core-game/v1/players/${puuid}`,
            getMatch: (matchId: string) => `/core-game/v1/matches/${matchId}`,
        },
        pre: {
            getMatchId: (puuid: string) => `/pregame/v1/players/${puuid}`,
            getMatch: (matchId: string) => `/pregame/v1/matches/${matchId}`,
        },
    },
    player: {
        competitiveupdate: (puuid: string) => `/mmr/v1/players/${puuid}/competitiveupdates`,
        mmr: (puuid: string) => `/mmr/v1/players/${puuid}`,
        nameservice: '/name-service/v2/players',
        loadout: (puuid: string) => `/personalization/v2/players/${puuid}/playerloadout`,
    },
    party: {
        player: (puuid: string) => `/parties/v1/players/${puuid}`,
    },
    store: {
        storefront: (puuid: string) => `/store/v2/storefront/${puuid}`,
        offers: '/store/v1/offers',
    },
};
