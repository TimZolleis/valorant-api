import type { PlayerStatisticsRoute } from '~/routes/api/player/$playerId/competitive/statistics';
import type { ReactNode } from 'react';
import { SmallContainer } from '~/ui/container/SmallContainer';
import type { PlayerRank } from '~/utils/player/rank.server';
import type { ValorantCompetitiveUpdate } from '~/models/valorant/competitive/ValorantCompetitiveUpdate';

export const PlayerStatisticsComponent = ({
    statistics,
    rank,
    competitiveUpdate,
}: {
    statistics: PlayerStatisticsRoute['statistics'];
    rank: PlayerRank;
    competitiveUpdate: ValorantCompetitiveUpdate;
}) => {
    const lostMatches = competitiveUpdate.Matches?.filter((match) => match.RankedRatingEarned < 0);
    const wonMatches = competitiveUpdate.Matches?.filter((match) => match.RankedRatingEarned > 0);
    const RRGained = wonMatches.reduce((total, match) => {
        return total + match.RankedRatingEarned;
    }, 0);
    const RRLost = lostMatches.reduce((total, match) => {
        return total + match.RankedRatingEarned;
    }, 0);

    return (
        <div className={'grid md:grid-cols-2 lg:grid-cols-3 gap-2 w-full'}>
            <StatisticsContainer title={'Total Winrate'}>
                <p className={'font-semibold text-title-large p-2'}>
                    {statistics.totalStatistics.winrate.toFixed(2)}%
                </p>
            </StatisticsContainer>
            <StatisticsContainer title={'Top Rank'}>
                <div className={'flex items-center py-2'}>
                    <img
                        className={'h-10'}
                        src={statistics.totalStatistics.topRank?.smallIcon}
                        alt=''
                    />
                    <p className={'font-semibold text-title-large p-2 capitalize'}>
                        {statistics.totalStatistics?.topRank?.tierName.toLowerCase()}
                    </p>
                </div>
            </StatisticsContainer>
            <StatisticsContainer title={'Current Rank'}>
                <div className={'flex items-center py-2'}>
                    <img className={'h-10'} src={rank?.tier?.smallIcon} alt='' />
                    <div className={'flex flex-col p-2'}>
                        <p className={'font-semibold  text-title-large capitalize'}>
                            {rank?.tier?.tierName.toLowerCase()}
                        </p>
                        <div className={'flex items-center gap-2'}>
                            <p className={'text-label-medium leading-none text-neutral-400'}>
                                {rank?.latestRR}RR
                            </p>
                            <span className={'text-label-medium text-neutral-400 flex gap-2'}>
                                |
                                <p className={'text-red-500'}>
                                    ({RRLost} / {(RRLost / lostMatches.length).toFixed(2)}avg)
                                </p>
                                <p className={'text-green-500'}>
                                    ({RRGained} / {(RRGained / wonMatches.length).toFixed(2)}avg)
                                </p>
                            </span>
                        </div>
                    </div>
                </div>
            </StatisticsContainer>
        </div>
    );
};

const StatisticsContainer = ({ title, children }: { title: string; children: ReactNode }) => {
    return (
        <SmallContainer>
            <p className={'pb-2 text-label-medium border-b border-white/20'}>{title}</p>
            {children}
        </SmallContainer>
    );
};

export const WinrateComponent = ({
    statistics,
}: {
    statistics: PlayerStatisticsRoute['statistics'];
}) => {
    return (
        <SmallContainer>
            <p className={'pb-2 text-label-medium border-b border-white/20'}>Total Winrate</p>
            <p className={'font-semibold text-title-large p-2'}>
                {statistics.totalStatistics.winrate.toFixed(2)}%
            </p>
        </SmallContainer>
    );
};

export const TopRankComponent = ({
    statistics,
}: {
    statistics: PlayerStatisticsRoute['statistics'];
}) => {
    return (
        <SmallContainer>
            <p className={'pb-2 text-label-medium border-b border-white/20'}>Top Rank</p>
            <div className={'flex items-center py-2'}>
                <img
                    className={'h-10'}
                    src={statistics.totalStatistics.topRank?.smallIcon}
                    alt=''
                />
                <p className={'font-semibold text-title-large p-2 capitalize'}>
                    {statistics.totalStatistics?.topRank?.tierName.toLowerCase()}
                </p>
            </div>
        </SmallContainer>
    );
};
