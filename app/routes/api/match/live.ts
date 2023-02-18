import { DataFunctionArgs } from '@remix-run/node';
import { requireUser } from '~/utils/session/session.server';
import { getRunningCoregameMatch, getRunningPregameMatch } from '~/utils/match/livematch.server';
import { NoPregameFoundException } from '~/exceptions/NoPregameFoundException';
import { NoCoregameFoundException } from '~/exceptions/NoCoregameFoundException';
import { getCharacterByUUid, getMatchMap } from '~/utils/match/match.server';
import { getPlayerRank } from '~/utils/player/rank.server';
import { PregamePlayer, ValorantPregameMatch } from '~/models/valorant/match/ValorantPregameMatch';
import { ValorantApiCharacter } from '~/models/valorant-api/ValorantApiCharacter';
import { TEST_COREGAME } from '~/test/TEST_COREGAME';
import {
    CoregamePlayer,
    ValorantCoregameMatch,
} from '~/models/valorant/match/ValorantCoregameMatch';
import { Simulate } from 'react-dom/test-utils';
import play = Simulate.play;

export type LiveMatchRoute = Awaited<ReturnType<typeof loader>>;
export type GameStatus = 'pregame' | 'coregame';
export type InterpolatedPregamePlayer = PregamePlayer & {
    character: ValorantApiCharacter | null;
} & {
    rank: Awaited<ReturnType<typeof getPlayerRank>>;
};
export type InterpolatedCoregamePlayer = CoregamePlayer & {
    character: ValorantApiCharacter | null;
} & {
    rank: Awaited<ReturnType<typeof getPlayerRank>>;
};

export type InterpolatedPregame = ValorantPregameMatch & {
    players: InterpolatedPregamePlayer[];
} & {
    map: Awaited<ReturnType<typeof getMatchMap>>;
};
export type InterpolatedCoregame = ValorantCoregameMatch & {
    players: {
        allyTeam: InterpolatedCoregamePlayer[];
        enemyTeam: InterpolatedCoregamePlayer[];
    };
} & {
    map: Awaited<ReturnType<typeof getMatchMap>>;
};

export const loader = async ({ request, params }: DataFunctionArgs) => {
    const user = await requireUser(request);
    try {
        const pregame = await getRunningPregameMatch(user, user.userData.puuid);
        const playerDetails = await Promise.all(
            pregame.AllyTeam.Players.map(async (player) => {
                const character = player.CharacterID
                    ? await getCharacterByUUid(player.CharacterID)
                    : null;
                const rank = await getPlayerRank(user, player.PlayerIdentity.Subject);
                return { ...player, character, rank };
            })
        );
        const map = await getMatchMap(pregame.MapID);
        const match: InterpolatedPregame = {
            ...pregame,
            map,
            players: playerDetails,
        };
        return {
            status: 'pregame',
            match: match,
        };
    } catch (e) {
        if (!(e instanceof NoPregameFoundException)) {
            throw e;
        }
    }
    try {
        const coregame = await getRunningCoregameMatch(user, user.userData.puuid);
        const playerDetails = await Promise.all(
            coregame.Players.map(async (player) => {
                const character = player.CharacterID
                    ? await getCharacterByUUid(player.CharacterID)
                    : null;
                const rank = await getPlayerRank(user, player.PlayerIdentity.Subject);
                return { ...player, character, rank };
            })
        );
        const userAsPlayer = playerDetails.find((player) => {
            return player.Subject === user.userData.puuid;
        });
        const allyTeam = playerDetails.filter((player) => {
            return player.TeamID === userAsPlayer?.TeamID;
        });
        const enemyTeam = playerDetails.filter((player) => {
            return player.TeamID !== userAsPlayer?.TeamID;
        });

        const map = await getMatchMap(coregame.MapID);
        const match: InterpolatedCoregame = {
            ...coregame,
            map,
            players: {
                enemyTeam,
                allyTeam,
            },
        };
        return {
            status: 'coregame',
            match: match,
        };
    } catch (e) {
        if (!(e instanceof NoCoregameFoundException)) {
            throw e;
        }
    }
    return {
        error: 'No game found',
    };
};
