import type { getPlayerStatistics } from '~/utils/player/statistics.server';
import type { getPlayerRank } from '~/utils/player/rank.server';
import { PlayerStatisticsComponent } from '~/ui/player/PlayerStatisticsComponent';
import type { ValorantNameService } from '~/models/valorant/player/ValorantNameService';

type PlayerRank = Awaited<ReturnType<typeof getPlayerRank>>;

export type PlayerStatistics = Awaited<ReturnType<typeof getPlayerStatistics>>;

export const PlayerDetailsComponent = ({
    nameservice,
    rank,
    statistics,
}: {
    nameservice: ValorantNameService;
    rank: PlayerRank;
    statistics: PlayerStatistics;
}) => {
    return (
        <>
            <main className={'p-3'}>
                <p className={' py-2  text-title-large font-semibold'}>
                    {nameservice.GameName}{' '}
                    <span className={'text-gray-400'}>#{nameservice.TagLine}</span>
                </p>
                <div className={'flex w-full  gap-2 '}>
                    <PlayerStatisticsComponent
                        statistics={statistics}
                        rank={rank}></PlayerStatisticsComponent>
                </div>
            </main>
        </>
    );
};
