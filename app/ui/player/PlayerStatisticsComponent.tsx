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

export const PlayerStatisticsComponent = ({
    statistics,
    rank,
}: {
    statistics: PlayerStatisticsRoute;
    rank: PlayerRankRoute;
}) => {
    return (
        <div className={'grid md:grid-cols-2 lg:grid-cols-3 gap-2 w-full'}>
            <WinrateComponent data={statistics}></WinrateComponent>
            <TopRankComponent data={statistics} />
            <PlayerRankComponent data={rank}></PlayerRankComponent>
        </div>
    );
};

const WinrateComponent = ({ data }: { data: PlayerStatisticsRoute }) => {
    return (
        <SmallContainer>
            <p className={'pb-2 text-label-medium border-b border-white/20'}>Total Winrate</p>
            <p className={'font-semibold text-title-large p-2'}>
                {data.statistics.totalStatistics.winrate.toFixed(2)}%
            </p>
        </SmallContainer>
    );
};

const TopRankComponent = ({ data }: { data: PlayerStatisticsRoute }) => {
    return (
        <SmallContainer>
            <p className={'pb-2 text-label-medium border-b border-white/20'}>Top Rank</p>
            <div className={'flex items-center  py-2'}>
                <img
                    className={'h-10'}
                    src={data.statistics.totalStatistics.topRank?.smallIcon}
                    alt=''
                />
                <p className={'font-semibold text-title-large p-2 capitalize'}>
                    {data.statistics.totalStatistics?.topRank?.tierName.toLowerCase()}
                </p>
            </div>
        </SmallContainer>
    );
};
