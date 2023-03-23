import { Link } from '@remix-run/react';
import { SmallContainer } from '~/ui/container/SmallContainer';
import type { MatchHistory } from '~/utils/match/match.server';
import { Match } from '~/models/valorant/competitive/ValorantCompetitiveUpdate';

type HistoryMatch = MatchHistory;
export const MatchHistoryComponent = ({ history }: { history: MatchHistory[] }) => {
    return (
        <div className={'grid grid-cols-1 w-full md:grid-cols-2 xl:grid-cols-3 gap-2'}>
            {history.map((match) => (
                <Link
                    key={match.details.matchInfo.matchId}
                    to={`/match/${match.details.matchInfo.matchId}/players`}>
                    <MatchComponent match={match} />
                </Link>
            ))}
        </div>
    );
};

export const MatchComponent = ({ match }: { match: HistoryMatch }) => {
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
                {!!match.details.competitiveMatchUpdate && (
                    <div
                        className={`${
                            match.details.competitiveMatchUpdate?.RankedRatingEarned > 0
                                ? 'bg-green-800/50 border-green-500 text-green-500'
                                : 'bg-red-800/50 border-red-500 text-red-500'
                        } rounded-md px-3 py-1 border`}>
                        <p className={'font-inter text-xs capitalize'}>
                            <span>
                                {match.details.competitiveMatchUpdate.RankedRatingEarned > 0
                                    ? '+'
                                    : ''}
                            </span>
                            <span>{match.details.competitiveMatchUpdate?.RankedRatingEarned}</span>
                            <span>RR</span>
                        </p>
                    </div>
                )}
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

export const ErrorBoundary = () => {
    return <div>This is an error!</div>;
};
