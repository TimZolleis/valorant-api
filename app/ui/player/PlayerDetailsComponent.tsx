import { getPlayerStatistics } from '~/utils/player/statistics.server';
import { getPlayerRank } from '~/utils/player/rank.server';
import { Container } from '~/ui/container/Container';
import { Suspense } from 'react';
import { LoadingContainer } from '~/ui/container/LoadingContainer';
import { Await } from '@remix-run/react';
import { PlayerStatisticsComponent } from '~/ui/player/PlayerStatisticsComponent';
import { ValorantNameService } from '~/models/valorant/player/ValorantNameService';

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
            <p className={'font-inter font-semibold text-white text-title-large py-2'}>
                {nameservice.GameName}{' '}
                <span className={'text-gray-400'}>#{nameservice.TagLine}</span>
            </p>
            <div className={'flex gap-2 text-white w-full '}>
                <PlayerStatisticsComponent
                    statistics={statistics}
                    rank={rank}></PlayerStatisticsComponent>
            </div>
        </>
    );
};
