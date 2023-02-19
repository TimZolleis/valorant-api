import { FetcherWithComponents, useFetcher } from '@remix-run/react';
import { MatchHistoryRouteData } from '~/routes/api/player/$playerId/history';
import { useEffect } from 'react';
import { LoadingContainer } from '~/ui/container/LoadingContainer';
import { SmallContainer } from '~/ui/container/SmallContainer';

type Match = MatchHistoryRouteData[number];
const uniqueId = (match: Match) => {
    return `${match.map.uuid.slice(0, 5)}${match.details.player.stats?.kills}`;
};
export const MatchHistoryComponent = ({ puuid }: { puuid: string }) => {
    const fetcher = useFetcher() as unknown as FetcherWithComponents<MatchHistoryRouteData>;
    useEffect(() => {
        if (fetcher.type === 'init') {
            fetcher.load(`/api/player/${puuid}/history`);
        }
    }, [fetcher]);

    if (fetcher.data) {
        return (
            <div className={'grid grid-cols-1 w-full md:grid-cols-2 xl:grid-cols-3 gap-2'}>
                {fetcher.data.map((match) => (
                    <MatchComponent key={uniqueId(match)} match={match} />
                ))}
            </div>
        );
    }
    return <LoadingContainer />;
};

export const MatchComponent = ({ match }: { match: Match }) => {
    console.log(match);
    return (
        <SmallContainer>
            <div
                className={
                    'flex items-center w-full border-b border-white/20 pb-2 gap-2 font-inter'
                }>
                <p className={'text-label-medium leading-none font-inter font-medium'}>
                    {match.map.displayName}
                </p>
                <div className={'rounded-md text-label-small'}>
                    {match.details.playerTeam.hasWon && (
                        <div
                            className={
                                'bg-green-800/50 rounded-md py-0.5 px-3 border border-green-500 text-label-small'
                            }>
                            <p className={'text-green-500'}>Won</p>
                        </div>
                    )}
                    {!match.details.playerTeam.hasWon && (
                        <div
                            className={
                                'bg-red-800/50 rounded-md py-0.5 px-3 border border-red-500 text-label-small'
                            }>
                            <p className={'text-red-500'}>Lost</p>
                        </div>
                    )}
                </div>
                <div className={'bg-amber-800/50 rounded-md px-3 py-1 border border-amber-500'}>
                    <p className={'text-amber-500 font-inter text-xs capitalize'}>
                        {match.details.matchInfo.queueID}
                    </p>
                </div>
            </div>
            <div className={'font-inter leading-1 text-end p-2 '}>
                <div className={'flex justify-between items-center'}>
                    <div className={'flex gap-3 items-center'}>
                        <img
                            className={'h-10 border-white/20 border rounded-md p-1'}
                            src={match.details.player.character?.displayIconSmall}
                            alt={'character'}
                        />
                        <div className={'text-start'}>
                            <p className={'font-medium'}>
                                {match.details.player.character?.displayName}
                            </p>
                            <p className={'font-light text-label-small text-gray-400'}>
                                {match.details.player.stats?.kills}/
                                {match.details.player.stats?.deaths}/
                                {match.details.player.stats?.assists}
                            </p>
                        </div>
                    </div>
                    <div className={'flex font-medium text-title-small'}>
                        {match.details.playerTeam.roundsWon} - {match.details.enemyTeam.roundsWon}
                    </div>
                </div>
            </div>
        </SmallContainer>
    );
};
