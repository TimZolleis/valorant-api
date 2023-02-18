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

export const PlayerStatisticsComponent = ({ playerUuid }: { playerUuid: string }) => {
    const statistics = useFetcher<PlayerStatisticsRoute>();
    const rank = useFetcher<PlayerRankRoute>();
    useEffect(() => {
        if (statistics.type == 'init') {
            statistics.load(`/api/player/${playerUuid}/competitive/statistics`);
        }
    }, [statistics]);

    useEffect(() => {
        if (rank.type == 'init') {
            rank.load(`/api/player/${playerUuid}/competitive/rank`);
        }
    }, [rank]);

    if (statistics.data && rank.data) {
        const statisticsData = statistics.data as unknown as PlayerStatisticsRoute;
        const rankData = rank.data as unknown as PlayerRankRoute;
        return (
            <div className={'grid md:grid-cols-2 lg:grid-cols-3 gap-2 w-full'}>
                <WinrateComponent data={statisticsData}></WinrateComponent>
                <TopRankComponent data={statisticsData} />
                <PlayerRankComponent data={rankData}></PlayerRankComponent>
            </div>
        );
    } else {
        return <LoadingContainer />;
    }
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
