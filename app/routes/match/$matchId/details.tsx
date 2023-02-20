import { DataFunctionArgs } from '@remix-run/node';
import {
    getUserFromSession,
    requireParam,
    requirePlayerUuidAsParam,
    requireUser,
} from '~/utils/session/session.server';
import { getMatchDetails, getMatchMap } from '~/utils/match/match.server';
import { useLoaderData } from '@remix-run/react';
import { getServerRegion } from '~/utils/match/servername';
import { getRelevantMatchData } from '~/routes/api/player/$playerId/history';
import { PlayerComponent } from '~/ui/player/PlayerComponent';

export const loader = async ({ request, params }: DataFunctionArgs) => {
    const user = await requireUser(request);
    const matchId = await requireParam('matchId', params);
    const details = await getMatchDetails(user, matchId);
    const map = await getMatchMap(details.matchInfo.mapId);
    const relevant = await getRelevantMatchData(user.userData.puuid, details, map);
    return {
        match: {
            ...relevant,
            players: details.players,
        },
    };
};

const MatchDetailsPage = () => {
    const { match } = useLoaderData<ReturnType<typeof loader>>();
    const playerTeamPlayers = match.players.filter((player) => {
        return player.teamId === match.details.playerTeam.teamId;
    });
    const enemyTeamPlayers = match.players.filter((player) => {
        return player.teamId === match.details.enemyTeam.teamId;
    });

    return (
        <div className={'text-white'}>
            <div className={'border-b border-zinc-800 py-2'}>
                <h1 className={'font-medium text-headline-medium font-inter'}>Match details</h1>
                <div className={'flex items-center gap-2'}>
                    <div className={'bg-amber-800/50 border border-amber-500 px-3 py-1 rounded-md'}>
                        <p className={'font-inter text-label-small text-amber-500'}>
                            {getServerRegion(match.details.matchInfo.gamePodId)}
                        </p>
                    </div>
                    <div
                        className={
                            'bg-purple-800/50 border border-purple-500 px-3 py-1 rounded-md'
                        }>
                        <p className={'font-inter text-label-small text-purple-500 capitalize'}>
                            {match.map.displayName}
                        </p>
                    </div>
                    <div className={'bg-rose-800/50 border border-rose-500 px-3 py-1 rounded-md'}>
                        <p className={'font-inter text-label-small text-rose-500 capitalize'}>
                            {match.details.matchInfo.queueID}
                        </p>
                    </div>
                </div>
            </div>
            <section className={'mt-5 grid gap-2 md:grid-cols-2'}>
                <section>
                    <p className={'text-white font-inter text-title-medium font-semibold py-2'}>
                        Ally team
                    </p>
                    <div className={'space-y-2'}>
                        {playerTeamPlayers.map((player) => (
                            <PlayerComponent key={player.subject} player={player}></PlayerComponent>
                        ))}
                    </div>
                </section>

                <section>
                    <p className={'text-white font-inter text-title-medium font-semibold py-2'}>
                        Enemy team
                    </p>
                    <div className={'space-y-2'}>
                        {enemyTeamPlayers.map((player) => (
                            <PlayerComponent key={player.subject} player={player}></PlayerComponent>
                        ))}
                    </div>
                </section>
            </section>
        </div>
    );
};

export default MatchDetailsPage;
