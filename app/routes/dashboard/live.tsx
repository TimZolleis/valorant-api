import { DataFunctionArgs, json } from '@remix-run/node';
import { requireUser } from '~/utils/session/session.server';
import { getRunningCoregameMatch, getRunningPregameMatch } from '~/utils/match/livematch.server';
import { getCharacterByUUid, getMatchMap } from '~/utils/match/match.server';
import { getPlayerRank } from '~/utils/player/rank.server';
import { NoPregameFoundException } from '~/exceptions/NoPregameFoundException';
import { NoCoregameFoundException } from '~/exceptions/NoCoregameFoundException';
import { InterpolatedCoregame, InterpolatedPregame } from '~/routes/api/match/live';

export const loader = async ({ request }: DataFunctionArgs) => {
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
        return json({
            status: 'pregame',
            match: match,
        });
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

const LiveMatchPage = () => {
    return <p className={'text-white'}>Live match page</p>;
};

export default LiveMatchPage;
