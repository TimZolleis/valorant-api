import { FetcherWithComponents } from '@remix-run/react';
import { InterpolatedCoregame, InterpolatedPregame, LiveMatchRoute } from '~/routes/api/match/live';
import { useEffect, useMemo, useState } from 'react';
import { ValorantCoregameMatch } from '~/models/valorant/match/ValorantCoregameMatch';
import { ValorantPregameMatch } from '~/models/valorant/match/ValorantPregameMatch';
import Login from '~/routes/login';
import { getServerRegion } from '~/utils/match/servername';
import { PlayerInGameComponent } from '~/ui/player/PlayerInGameComponent';
import { log } from '@remix-run/dev/dist/logging';
import { SmallContainer } from '~/ui/container/SmallContainer';

export function checkForLiveGame(fetcher: FetcherWithComponents<LiveMatchRoute>) {
    fetcher.load('/api/match/live');
}

function isPregame(
    match: ValorantPregameMatch | ValorantCoregameMatch
): match is InterpolatedPregame {
    return 'AllyTeam' in match;
}

function isCoregame(
    match: ValorantPregameMatch | ValorantCoregameMatch
): match is InterpolatedCoregame {
    return 'MatchmakingData' in match;
}

export const LivematchComponent = ({
    onGameDetection,
    fetcher,
}: {
    onGameDetection: () => void;
    fetcher: FetcherWithComponents<LiveMatchRoute>;
}) => {
    const [remainingTime, setRemainingTime] = useState<number>(10);
    useEffect(() => {
        const interval = setInterval(() => {
            if (remainingTime > 0) {
                setRemainingTime(remainingTime - 1);
            } else {
                checkForLiveGame(fetcher);
                setRemainingTime(10);
            }
        }, 1000);
        return () => clearInterval(interval);
    });

    const data = useMemo(() => fetcher.data, [fetcher]);

    if (data?.status === 'pregame' && isPregame(data.match)) {
        return <PregameMatchComponent pregame={data.match} />;
    }
    if (data?.status === 'coregame' && isCoregame(data.match)) {
        return <CoregameMatchComponent coregame={data.match} />;
    }
    return (
        <p className={'font-inter text-gray-400 text-label-medium'}>
            There was no live match detected.
        </p>
    );
};

export const PregameMatchComponent = ({ pregame }: { pregame: InterpolatedPregame }) => {
    useEffect(() => {
        console.log(pregame);
    }, []);
    return (
        <div>
            <div className={'flex items-center gap-2'}>
                <p className={'font-inter font-semibold'}>Pregame</p>
                <div className={'bg-fuchsia-800/50 rounded-md px-3 py-1 border border-fuchsia-500'}>
                    <p className={'text-fuchsia-500 font-inter text-xs'}>
                        {getServerRegion(pregame.GamePodID)}
                    </p>
                </div>
                <div className={'bg-amber-800/50 rounded-md px-3 py-1 border border-amber-500'}>
                    <p className={'text-amber-500 font-inter text-xs'}>{pregame.map.displayName}</p>
                </div>
            </div>
            <div className={' mt-5 grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}>
                {pregame.players.map((player) => (
                    <PlayerInGameComponent
                        player={player}
                        key={player.PlayerIdentity.Subject}></PlayerInGameComponent>
                ))}
            </div>
        </div>
    );
};

export const CoregameMatchComponent = ({ coregame }: { coregame: InterpolatedCoregame }) => {
    return (
        <div>
            <div className={'flex items-center gap-2'}>
                <p className={'font-inter font-semibold'}>Coregame</p>
                <div className={'bg-fuchsia-800/50 rounded-md px-3 py-1 border border-fuchsia-500'}>
                    <p className={'text-fuchsia-500 font-inter text-xs'}>
                        {getServerRegion(coregame.GamePodID)}
                    </p>
                </div>
                <div className={'bg-amber-800/50 rounded-md px-3 py-1 border border-amber-500'}>
                    <p className={'text-amber-500 font-inter text-xs'}>
                        {coregame.map.displayName}
                    </p>
                </div>
            </div>
            <div className={'mt-5 grid gap-2 md:grid-cols-2'}>
                <SmallContainer>
                    <p className={'font-bold font-inter pb-2 text-title-medium'}>Ally Team</p>
                    <div className={'space-y-2'}>
                        {coregame.players.allyTeam.map((player) => (
                            <PlayerInGameComponent
                                player={player}
                                key={player.PlayerIdentity.Subject}></PlayerInGameComponent>
                        ))}
                    </div>
                </SmallContainer>
                <SmallContainer>
                    <p className={'font-bold font-inter pb-2 text-title-medium'}>Enemy Team</p>
                    <div className={'space-y-2'}>
                        {coregame.players.enemyTeam.map((player) => (
                            <PlayerInGameComponent
                                player={player}
                                key={player.PlayerIdentity.Subject}></PlayerInGameComponent>
                        ))}
                    </div>
                </SmallContainer>
            </div>
        </div>
    );
};
