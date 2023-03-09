export const ITEM_TYPES = {
    SKINLEVEL: 'e7c63390-eda7-46e0-bb7a-a6abdacd2433',
    SKINCHROMA: '3ad1b2b2-acdb-4524-852f-954a76ddae0a',
    AGENT: '01bb38e1-da47-4e6a-9b3d-945fe4655707',
    CONTRACT: 'f85cb6f7-33e5-4dc8-b609-ec7212301948',
    BUDDY: 'dd3bf334-87f3-40bd-b043-682a57a8dc3a',
    SPRAY: 'd5f120f8-ff8c-4aac-92ea-f2b5acbe9475',
    PLAYER_CARD: '3f296c07-64c3-494c-923b-fe692a4fa1bd',
    PLAYER_TITLE: 'de7caa6b-adf7-4588-bbd1-143831e786c6',
};

export const itemTypeToValorantApiUrl: ItemTypeToValorantApiUrl = {
    'e7c63390-eda7-46e0-bb7a-a6abdacd2433': (itemId: string) => `/weapons/skinlevels/${itemId}`,
    '3ad1b2b2-acdb-4524-852f-954a76ddae0a': (itemId: string) => `/weapons/skinchromas/${itemId}`,
    '01bb38e1-da47-4e6a-9b3d-945fe4655707': (agentId: string) => `/agents/${agentId}`,
    'f85cb6f7-33e5-4dc8-b609-ec7212301948': (contractId: string) => `/contracts/${contractId}`,
    'dd3bf334-87f3-40bd-b043-682a57a8dc3a': (buddyId: string) => `buddies/levels/${buddyId}`,
    'd5f120f8-ff8c-4aac-92ea-f2b5acbe9475': (sprayId: string) => `/sprays/${sprayId}`,
    '3f296c07-64c3-494c-923b-fe692a4fa1bd': (playerCardId: string) =>
        `/playercards/${playerCardId}`,
    'de7caa6b-adf7-4588-bbd1-143831e786c6': (playerTitleId: string) =>
        `/playertitles/${playerTitleId}`,
};

interface ItemTypeToValorantApiUrl {
    [key: string]: (id: string) => string;
}
