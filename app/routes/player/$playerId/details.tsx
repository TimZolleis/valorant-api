import { DataFunctionArgs, json } from '@remix-run/node';
import { requirePlayerUuidAsParam } from '~/utils/session/session.server';
import { Link, useLoaderData } from '@remix-run/react';
import { useFetcherData } from '~/utils/hooks/fetcher';
import { ValorantNameService } from '~/models/valorant/player/ValorantNameService';
import { Container } from '~/ui/container/Container';
import { PlayerStatisticsComponent } from '~/ui/player/PlayerStatisticsComponent';
import { checkForLiveGame, LivematchComponent } from '~/ui/match/LivematchComponent';
import { MatchHistoryComponent } from '~/ui/match/MatchHistoryComponent';
import { StatusIndicator } from '~/ui/common/StatusIndicator';
import { DefaultButton } from '~/ui/common/DefaultButton';

type LoaderData = Awaited<ReturnType<typeof loader>>;

export const loader = async ({ request, params }: DataFunctionArgs) => {
    const playerId = await requirePlayerUuidAsParam(params);

    return json({ playerId });
};

const PlayerDetailsPage = () => {
    const { playerId } = useLoaderData<typeof loader>();
    const nameService = useFetcherData<ValorantNameService>(`/api/player/${playerId}/nameservice`);
    return (
        <div className={'text-white mt-5 space-y-5'}>
            <div>
                <Link to={'/'}>
                    <span
                        className={
                            'flex items-center border-b border-gray-400 py-2 items-start flex-1'
                        }>
                        <img className={'h-4'} src='/resources/icons/chevron-lefts.svg' alt='' />
                        <p className={'font-inter text-label-medium'}>Back</p>
                    </span>
                </Link>
                <div className={'mt-5'}>
                    <p className={'font-inter font-light text-gray-400 text-label-medium'}>
                        Player details
                    </p>
                    <p className={'font-inter font-medium text-headline-small text-white'}>
                        {nameService?.GameName}{' '}
                        <span className={'text-gray-400'}>#{nameService?.TagLine}</span>
                    </p>
                </div>
            </div>
            <Container>
                <p className={'font-inter font-semibold text-title-large py-2'}>Statistics</p>
                <div className={'flex gap-2'}>
                    <PlayerStatisticsComponent playerUuid={playerId}></PlayerStatisticsComponent>
                </div>
            </Container>
            <Container>
                <p className={'font-inter font-semibold text-title-large py-2'}>Match history</p>
                <div className={'flex gap-2'}>
                    <MatchHistoryComponent puuid={playerId} />
                </div>
            </Container>
        </div>
    );
};

export default PlayerDetailsPage;
