import type { ValorantUser } from '~/models/user/ValorantUser';
import { RiotRequest } from '~/models/Request';
import { endpoints } from '~/config/endpoints';
import { ValorantApiClient } from '~/utils/valorant-api/ValorantApiClient';
import { RiotGamesApiClient } from '~/utils/riot/RiotGamesApiClient';
import type { MatchHistoryResponse } from 'valorant-api-types';
import { getMatchDetails } from '~/utils/match/match.server';
import type { Damage, ValorantMatchDetails } from '~/models/valorant/match/ValorantMatchDetails';
import { valorantApiEndpoints } from '~/config/valorantApiEndpoints';
import type { WeaponStats } from '~/models/valorant-api/ValorantApiWeapon';
import type { ValorantApiWeapons } from '~/models/valorant-api/ValorantApiWeapons';

async function getWeapons() {
    const weaponDataMap = new Map<string, WeaponStats>();
    const weapons = await new ValorantApiClient().get<ValorantApiWeapons[]>(
        valorantApiEndpoints.weapon.all
    );
    weapons.forEach((weapon) => {
        weaponDataMap.set(weapon.uuid, weapon.weaponStats);
    });
    return weaponDataMap;
}

export async function analyzeSampleMatches(user: ValorantUser) {
    const request = new RiotRequest(user.userData.region).buildBaseUrl(
        endpoints.match.history(user.userData.puuid)
    );
    const history = await new RiotGamesApiClient(
        user.accessToken,
        user.entitlement
    ).getCached<MatchHistoryResponse>(
        request,
        {
            key: 'test-match-history',
            expiration: 3600,
        },
        {
            params: {
                queue: 'competitive',
            },
        }
    );
    const matches = await Promise.all(
        history.History.map((history) => {
            return getMatchDetails(user, history.MatchID);
        })
    );
    const weapons = await getWeapons();

    const totalDamageOccurences: DamageData[] = [];
    const totalDamagesWithKill: DamageData[] = [];
    const totalDamagesWithWeapon: DamageData[] = [];
    const totalDamagesWithoutMatch: DamageData[] = [];

    const matchAnalysis = await Promise.all(matches.map((match) => analyseMatch(match, weapons)));
    matchAnalysis.forEach((analysis) => {
        analysis.forEach((occurence) => {
            totalDamageOccurences.push(occurence);
            if (occurence.hasKill) {
                totalDamagesWithKill.push(occurence);
            }
            if (occurence.hasMatchedWeapon && !occurence.hasKill) {
                totalDamagesWithWeapon.push(occurence);
            }
            if (!occurence.hasKill && !occurence.hasMatchedWeapon) {
                totalDamagesWithoutMatch.push(occurence);
            }
        });
    });

    console.log('Total analyzed matches', matches.length);
    console.log('Total damages', totalDamageOccurences.length);
    console.log('Total damages with related kill', totalDamagesWithKill.length);
    console.log('Total damages with start weapon', totalDamagesWithWeapon.length);
    console.log('Total damages without any match', totalDamagesWithoutMatch.length);
    const unmatchedDamageValues: number[] = [];

    totalDamagesWithoutMatch.forEach((damage) => {
        unmatchedDamageValues.push(damage.damage.damage);
    });
    console.log(unmatchedDamageValues);
}

function findDamageByWeaponUuid(
    damage: Damage,
    weaponUuid: string,
    weapons: Map<string, WeaponStats>
) {
    try {
        const weaponStats = weapons.get(weaponUuid.toLowerCase());
        const damageDoesMatch = weaponStats?.damageRanges.find((range) => {
            const assumedBodyDamage = range.bodyDamage * damage.bodyshots;
            const assumedHeadDamage = range.headDamage * damage.headshots;
            const assumedLegDamage = range.legDamage * damage.legshots;
            const combinedDamage = assumedHeadDamage + assumedBodyDamage + assumedLegDamage;
            return damage.damage > combinedDamage - 5 && damage.damage < combinedDamage + 5;
        });
        return !!damageDoesMatch;
    } catch (e) {
        return false;
    }
}

type DamageData = {
    damage: Damage;
    hasKill: boolean;
    guessedWeapon: string | null;
    hasMatchedWeapon: boolean;
};

async function analyseMatch(match: ValorantMatchDetails, weapons: Map<string, WeaponStats>) {
    const damageArray: DamageData[] = [];

    const damageByRound = await Promise.all(
        match.roundResults.map(async (round) => {
            const value = await Promise.all(
                round.playerStats.map(async (player) => {
                    const weapon = player.economy.weapon;
                    const damageOccurences = await Promise.all(
                        player.damage.map(async (damage) => {
                            let guessedWeapon = null;
                            const kill = player.kills.find(
                                (kill) => kill.victim === damage.receiver
                            );
                            if (kill) {
                                guessedWeapon = kill.finishingDamage.damageItem;
                            } else {
                                if (findDamageByWeaponUuid(damage, weapon, weapons)) {
                                    guessedWeapon = weapon;
                                } else {
                                    weapons.forEach((value, key) => {
                                        const matches = findDamageByWeaponUuid(
                                            damage,
                                            key,
                                            weapons
                                        );
                                        if (matches) {
                                            guessedWeapon = key;
                                        }
                                    });
                                }
                            }
                            return {
                                damage,
                                hasKill: !!kill,
                                guessedWeapon,
                                hasMatchedWeapon: !!guessedWeapon,
                            };
                        })
                    );
                    damageArray.push(...damageOccurences);

                    // damageOccurences.forEach((occurence) => {
                    //     totalDamageOccurences++;
                    //     if (occurence.hasKill) {
                    //         totalDamagesWithKills++;
                    //     }
                    //     if (occurence.guessedWeapon && !occurence.hasKill) {
                    //         totalDamagesWithMatchedWeapon++;
                    //     }
                    //     if (!occurence.hasMatchedWeapon && !occurence.hasKill) {
                    //         totalUnmatchedOccurences++;
                    //     }
                    // });
                    // return damageOccurences;
                })
            );
        })
    );

    return damageArray;
}
