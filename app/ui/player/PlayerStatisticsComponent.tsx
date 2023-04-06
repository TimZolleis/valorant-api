import type { PlayerStatisticsRoute } from '~/routes/api/player/$playerId/competitive/statistics';
import type { ReactNode } from 'react';
import { SmallContainer } from '~/ui/container/SmallContainer';
import type { PlayerRank } from '~/utils/player/rank.server';
import type { ValorantCompetitiveUpdate } from '~/models/valorant/competitive/ValorantCompetitiveUpdate';
import { DateTime } from 'luxon';

export const PlayerStatisticsComponent = ({
    statistics,
    rank,
    competitiveUpdate,
}: {
    statistics: PlayerStatisticsRoute['statistics'];
    rank: PlayerRank;
    competitiveUpdate: ValorantCompetitiveUpdate;
}) => {
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
            <StatisticsContainer title={'Player Rank'}>
                <PlayerRankComponent rank={rank}></PlayerRankComponent>
            </StatisticsContainer>
        </div>
    );
};

export const DailyStatisticsComponent = ({
    competitiveUpdate,
}: {
    competitiveUpdate: ValorantCompetitiveUpdate;
}) => {
    const filteredCompetitiveUpdate = competitiveUpdate.Matches.filter((match) => {
        return DateTime.fromMillis(match.MatchStartTime).toISODate() === DateTime.now().toISODate();
    });

    const dailyWinrate = () => {
        const playedGames = filteredCompetitiveUpdate.length;
        const wonGames = filteredCompetitiveUpdate.filter((match) => {
            return match.RankedRatingEarned >= 0;
        }).length;
        const lostGames = playedGames - wonGames;
        const winPercentage = (wonGames / playedGames) * 100;
        const lossPercentage = (lostGames / playedGames) * 100;
        return { playedGames, wonGames, lostGames, winPercentage, lossPercentage };
    };

    const dailyRRGain = () => {
        let RR = 0;
        filteredCompetitiveUpdate.forEach((match) => {
            RR += match.RankedRatingEarned;
        });
        return RR;
    };

    return (
        <div className={'grid md:grid-cols-2 lg:grid-cols-3 gap-2 w-full'}>
            <StatisticsContainer title={'Daily Winrate'}>
                <div
                    className={
                        'flex gap-2 items-center font-semibold text-title-large p-2 capitalize'
                    }>
                    <p>{dailyWinrate().winPercentage || 0}%</p>
                    <span className={'flex gap-2'}>
                        <p className={'text-green-800'}> {dailyWinrate().wonGames}</p> /{' '}
                        <p className={'text-red-800'}> {dailyWinrate().lostGames}</p>
                    </span>
                </div>
            </StatisticsContainer>
            <StatisticsContainer title={'Daily RR'}>
                <p className={'font-semibold text-title-large p-2 capitalize'}>{dailyRRGain()}RR</p>
            </StatisticsContainer>
        </div>
    );
};

export const StatisticsContainer = ({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) => {
    return (
        <SmallContainer>
            <p className={'pb-2 text-label-medium border-b border-white/20'}>{title}</p>
            {children}
        </SmallContainer>
    );
};

export const PlayerRankComponent = ({ rank }: { rank: PlayerRank }) => {
    return (
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
                </div>
            </div>
        </div>
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
