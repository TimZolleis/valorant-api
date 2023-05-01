import type { getPlayerStatistics } from '~/utils/player/statistics.server';
import type { getPlayerRank } from '~/utils/player/rank.server';
import { PlayerStatisticsComponent } from '~/ui/player/PlayerStatisticsComponent';
import type { ValorantNameService } from '~/models/valorant/player/ValorantNameService';

type PlayerRank = Awaited<ReturnType<typeof getPlayerRank>>;

type PlayerStatistics = Awaited<ReturnType<typeof getPlayerStatistics>>;

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
                <p className={' font-semibold  text-title-large py-2'}>
                    {nameservice.GameName}{' '}
                    <span className={'text-gray-400'}>#{nameservice.TagLine}</span>
                </p>
                <div className={'flex gap-2  w-full '}>
                    <PlayerStatisticsComponent
                        statistics={statistics}
                        rank={rank}></PlayerStatisticsComponent>
                </div>
            </main>
        </>
    );
};
