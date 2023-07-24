import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { SmallContainer } from '~/ui/container/SmallContainer';
import type { PlayerRank } from '~/utils/player/rank.server';
import type { ValorantCompetitiveUpdate } from '~/models/valorant/competitive/ValorantCompetitiveUpdate';
import { DateTime } from 'luxon';
import type { PlayerStatistics } from '~/ui/player/PlayerDetailsComponent';
import type { PlayerStatisticsRoute } from '~/routes/api.player.$playerId.statistics';

function getPercentage(total: number, fraction: number) {
    return (fraction / total) * 100;
}

export const PlayerStatisticsComponent = ({
    statistics,
    rank,
}: {
    statistics: PlayerStatistics;
    rank: PlayerRank;
}) => {
    return (
        <div className={'grid w-full gap-2 md:grid-cols-2 lg:grid-cols-3'}>
            <StatisticsContainer title={'Total Winrate'}>
                <p className={'p-2 text-2xl font-semibold'}>
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
                    <p className={'p-2 text-2xl font-semibold capitalize'}>
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

    const dailyWinrate = useMemo(() => {
        const playedGames = filteredCompetitiveUpdate.length;
        const wonGames = filteredCompetitiveUpdate.filter((match) => {
            return match.RankedRatingEarned >= 0;
        }).length;
        const lostGames = playedGames - wonGames;
        const winPercentage = getPercentage(playedGames, wonGames);
        const lossPercentage = getPercentage(playedGames, lostGames);
        return { playedGames, wonGames, lostGames, winPercentage, lossPercentage };
    }, [filteredCompetitiveUpdate]);

    const dailyRRGain = () => {
        let RR = 0;
        filteredCompetitiveUpdate.forEach((match) => {
            RR += match.RankedRatingEarned;
        });
        return RR;
    };

    return (
        <div className={'grid w-full gap-2 md:grid-cols-2 lg:grid-cols-3'}>
            <StatisticsContainer title={'Daily Winrate'}>
                <div className={'flex items-center gap-2 p-2 text-2xl font-semibold capitalize'}>
                    <p>{dailyWinrate.winPercentage ? dailyWinrate.winPercentage.toFixed(2) : 0}%</p>
                    <span className={'flex gap-2'}>
                        <p className={'text-green-800'}> {dailyWinrate.wonGames}</p> /{' '}
                        <p className={'text-red-800'}> {dailyWinrate.lostGames}</p>
                    </span>
                </div>
            </StatisticsContainer>
            <StatisticsContainer title={'Daily RR'}>
                <p className={'p-2 text-2xl font-semibold capitalize'}>{dailyRRGain()}RR</p>
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
            <p className={'border-b pb-2 text-lg'}>{title}</p>
            {children}
        </SmallContainer>
    );
};

export const PlayerRankComponent = ({ rank }: { rank: PlayerRank }) => {
    return (
        <div className={'flex items-center py-2'}>
            <img className={'h-10'} src={rank?.tier?.smallIcon} alt='' />
            <div className={'flex flex-col p-2'}>
                <p className={'text-2xl font-semibold capitalize'}>
                    {rank?.tier?.tierName.toLowerCase()}
                </p>
                <div className={'flex items-center gap-2'}>
                    <p className={'text-sm leading-none text-neutral-400'}>{rank?.latestRR}RR</p>
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
            <p className={'border-b border-white/20 pb-2 text-label-medium'}>Top Rank</p>
            <div className={'flex items-center py-2'}>
                <img
                    className={'h-10'}
                    src={statistics.totalStatistics.topRank?.smallIcon}
                    alt=''
                />
                <p className={'p-2 text-title-large font-semibold capitalize'}>
                    {statistics.totalStatistics?.topRank?.tierName.toLowerCase()}
                </p>
            </div>
        </SmallContainer>
    );
};
