import { FetcherWithComponents, useFetcher } from '@remix-run/react';
import { MatchHistoryRouteData } from '~/routes/api/player/$playerId/history';
import { useEffect } from 'react';
import { LoadingContainer } from '~/ui/container/LoadingContainer';
import { Simulate } from 'react-dom/test-utils';

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
    return (
        <div className={'relative w-full'}>
            <img
                className={
                    'rounded-md w-full relative grayscale bg-neutral-500 opacity-10 hover:opacity-50 hover:grayscale-0 transition ease-in-out duration-300 border border-white/50'
                }
                src={match.map.listViewIcon}
                alt=''
            />
            <div
                className={
                    'absolute bottom-0 right-0 font-inter right-3 leading-1 text-end py-2 px-5'
                }>
                <div className={'flex gap-3 items-center'}>
                    <img
                        className={'h-8 md:h-12 border-white/20 border rounded-md p-1'}
                        src={match.details.player.character?.displayIconSmall}
                        alt=''
                    />
                    <p className={'font-semibold text-title-small md:text-headline-small'}>
                        {match.map.displayName}
                    </p>
                    <div>
                        {match.details.playerTeam.hasWon && (
                            <div
                                className={
                                    'bg-green-500 rounded-md py-1 px-3 border border-green-400 text-label-small'
                                }>
                                <p>Won</p>
                            </div>
                        )}
                        {!match.details.playerTeam.hasWon && (
                            <div
                                className={
                                    'bg-red-500 rounded-md py-1 px-3 border border-red-400 text-label-small'
                                }>
                                <p>Lost</p>
                            </div>
                        )}
                    </div>
                </div>
                <p className={'text-label-small font-inter'}>
                    {match.details.player.stats?.kills} / {match.details.player.stats?.deaths} /{' '}
                    {match.details.player.stats?.assists}
                </p>
            </div>
        </div>
    );
};
