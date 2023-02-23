import type { DataFunctionArgs } from '@remix-run/node';
import { defer } from '@remix-run/node';
import { requireUser } from '~/utils/session/session.server';
import { getPlayerStatistics } from '~/utils/player/statistics.server';
import { getPlayerRank } from '~/utils/player/rank.server';
import { Await, Outlet, useLoaderData } from '@remix-run/react';
import { Container } from '~/ui/container/Container';
import { PlayerStatisticsComponent } from '~/ui/player/PlayerStatisticsComponent';
import { Suspense, useMemo } from 'react';
import { LoadingContainer } from '~/ui/container/LoadingContainer';
import { DefaultButton } from '~/ui/common/DefaultButton';
import type { ValorantUser } from '~/models/user/ValorantUser';

type LoaderData = {
    statisticsPromise: ReturnType<typeof getPlayerStatistics>;
    user: ValorantUser;
    rankPromise: ReturnType<typeof getPlayerRank>;
};

export const loader = async ({ request }: DataFunctionArgs) => {
    const user = await requireUser(request);

    const statisticsPromise = getPlayerStatistics(user, user.userData.puuid);
    const rankPromise = getPlayerRank(user, user.userData.puuid);
    return defer({
        user,
        statisticsPromise,
        rankPromise,
    });
};

const DashboardPage = () => {
    const { user, rankPromise, statisticsPromise } = useLoaderData() as LoaderData;
    const promises = useMemo(
        () => Promise.all([rankPromise, statisticsPromise]),
        [rankPromise, statisticsPromise]
    );

    return (
        <>
            <div className={'flex gap-2 items-center mb-5'}>
                <p className={'font-inter font-medium text-headline-small text-white'}>
                    Hello, {user.userData.gameName}
                </p>
                <DefaultButton onClick={() => void 0}>
                    <p className={'text-label-medium font-medium'}>Check for live game</p>
                </DefaultButton>
            </div>
            <Container>
                <p className={'font-inter font-semibold text-white text-title-large py-2'}>
                    Personal Statistics
                </p>
                <div className={'flex gap-2 text-white w-full '}>
                    <Suspense fallback={<LoadingContainer />}>
                        <Await
                            resolve={promises}
                            errorElement={<div className={'text-white'}>An Error occurred</div>}>
                            {([rank, statistics]) => (
                                <PlayerStatisticsComponent
                                    statistics={statistics}
                                    rank={rank}></PlayerStatisticsComponent>
                            )}
                        </Await>
                    </Suspense>
                </div>
            </Container>
            <div className={'mt-5'}>
                <Outlet></Outlet>
            </div>
        </>
    );
};
export default DashboardPage;
