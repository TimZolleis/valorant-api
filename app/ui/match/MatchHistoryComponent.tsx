import { Link } from '@remix-run/react';
import { SmallContainer } from '~/ui/container/SmallContainer';
import type { MatchHistory } from '~/utils/match/match.server';
import { Match } from '~/models/valorant/competitive/ValorantCompetitiveUpdate';
import { Tag } from '~/ui/common/Tag';

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
                    {match.details.playerTeam.hasWon ? <Tag text={'Won'} color={'green'} /> : null}
                    {match.details.enemyTeam.hasWon ? <Tag text={'Lost'} color={'red'} /> : null}
                    {!match.details.enemyTeam.hasWon && !match.details.playerTeam.hasWon ? (
                        <Tag text={'Draw'} color={'sky'} />
                    ) : null}
                </div>
                <div className={'bg-amber-800/50 rounded-md px-3 py-1 border border-amber-500'}>
                    <p className={'text-amber-500 font-inter text-xs capitalize'}>
                        {match.details.matchInfo.queueID}
                    </p>
                </div>
                {!!match.details.competitiveMatchUpdate && (
                    <Tag
                        text={`${
                            match.details.competitiveMatchUpdate.RankedRatingEarned >= 0 ? '+' : ''
                        }${match.details.competitiveMatchUpdate?.RankedRatingEarned}RR`}
                        color={
                            match.details.competitiveMatchUpdate.RankedRatingEarned === 0
                                ? 'sky'
                                : match.details.competitiveMatchUpdate.RankedRatingEarned < 0
                                ? 'red'
                                : 'green'
                        }></Tag>
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
