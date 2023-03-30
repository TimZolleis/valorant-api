import { ValorantApiClient } from '~/utils/valorant-api/ValorantApiClient';
import type { ValorantApiWeaponSkin } from '~/models/valorant-api/ValorantApiWeaponSkin';
import { valorantApiEndpoints } from '~/config/valorantApiEndpoints';
import MiniSearch from 'minisearch';

export type SkinInDictionary = {
    id: string;
    displayName: string;
    imageUrl: string;
};
export async function searchSkin(search: string) {
    await prepareSearch();
    return getSearch().search(search) as unknown as SkinInDictionary[];
}

async function prepareSearch() {
    await storeAllSkinlevels();
    weaponDictionary().forEach((skin, uuid) => {
        const item = {
            id: uuid,
            uuid,
            displayName: skin.displayName,
            imageUrl: skin.imageUrl,
        };
        if (!getSearch().has(uuid)) {
            getSearch().add(item);
        }
    });
}

async function storeAllSkinlevels() {
    if (!global.__weaponDictionary) {
        const allSkinlevels = await getAllSkinLevels();
        allSkinlevels.forEach((skinLevel) => {
            if (
                !skinLevel.displayName.toLowerCase().includes('level') &&
                skinLevel.levelItem === null
            ) {
                const value = {
                    id: skinLevel.uuid,
                    displayName: skinLevel.displayName,
                    imageUrl: skinLevel.displayIcon,
                };
                weaponDictionary().set(skinLevel.uuid, value);
            }
        });
    }
}

async function getAllSkinLevels() {
    return await new ValorantApiClient().getDatabaseCached<ValorantApiWeaponSkin[]>(
        valorantApiEndpoints.weapon.allSkinlevels,
        {
            key: 'skinlevel',
            expiration: 3600,
        }
    );
}

function weaponDictionary() {
    if (!global.__weaponDictionary) {
        global.__weaponDictionary = new Map();
    }
    return global.__weaponDictionary;
}

function getSearch() {
    if (!global.__minisearch) {
        global.__minisearch = new MiniSearch<SkinInDictionary>({
            fields: ['displayName'],
            storeFields: ['displayName', 'id', 'imageUrl'],
        });
    }
    return global.__minisearch;
}

declare global {
    var __weaponDictionary: Map<string, SkinInDictionary>;
    var __minisearch: MiniSearch<SkinInDictionary>;
}
