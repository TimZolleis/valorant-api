import { useFetcher } from '@remix-run/react';
import type {
    loader,
    PlayerStatisticsRoute,
} from '~/routes/api/player/$playerId/competitive/statistics';
import { useEffect } from 'react';
import { SmallContainer } from '~/ui/container/SmallContainer';
import { PlayerRankRoute } from '~/routes/api/player/$playerId/competitive/rank';
import { PlayerRankComponent } from '~/ui/player/PlayerRankComponent';
import { LoadingContainer } from '~/ui/container/LoadingContainer';
import { PlayerRank } from '~/utils/player/rank.server';

export const PlayerStatisticsComponent = ({
    statistics,
    rank,
}: {
    statistics: PlayerStatisticsRoute['statistics'];
    rank: PlayerRank;
}) => {
    return (
        <div className={'grid md:grid-cols-2 lg:grid-cols-3 gap-2 w-full'}>
            <WinrateComponent statistics={statistics}></WinrateComponent>
            <TopRankComponent statistics={statistics} />
            <PlayerRankComponent rank={rank}></PlayerRankComponent>
        </div>
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
            <div className={'flex items-center  py-2'}>
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
