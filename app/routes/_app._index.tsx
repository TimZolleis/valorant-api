import type { DataFunctionArgs } from '@vercel/remix';
import { defer } from '@vercel/remix';
import { requireUser } from '~/utils/session/session.server';
import { getPlayerStatistics } from '~/utils/player/statistics.server';
import { getPlayerRank } from '~/utils/player/rank.server';
import { Await, Outlet, useLoaderData } from '@remix-run/react';
import {
    DailyStatisticsComponent,
    PlayerStatisticsComponent,
} from '~/ui/player/PlayerStatisticsComponent';
import { Suspense, useMemo } from 'react';
import { LoadingContainer } from '~/ui/container/LoadingContainer';
import { LiveMatchDetectionComponent } from '~/ui/match/LiveMatchDetectionComponent';
import { getCompetitiveUpdates } from '~/utils/player/competitiveupdate.server';
import { PageHeader } from '~/components/ui/PageHeader';

export const loader = async ({ request }: DataFunctionArgs) => {
    const user = await requireUser(request);
    const statisticsPromise = getPlayerStatistics(user, user.userData.puuid);
    const competitiveUpdatePromise = getCompetitiveUpdates(user, user.userData.puuid);
    const rankPromise = getPlayerRank(user, user.userData.puuid);
    return defer({
        user,
        statisticsPromise,
        rankPromise,
        competitiveUpdatePromise,
    });
};

const IndexPage = () => {
    const { user, rankPromise, statisticsPromise, competitiveUpdatePromise } =
        useLoaderData<typeof loader>();
    const promises = useMemo(
        () => Promise.all([rankPromise, statisticsPromise, competitiveUpdatePromise]),
        [rankPromise, statisticsPromise, competitiveUpdatePromise]
    );

    return (
        <>
            <div className={'flex gap-2 items-center mb-5'}>
                <PageHeader>{user.userData.gameName}</PageHeader>
                <LiveMatchDetectionComponent />
            </div>

            <p className={' font-semibold  text-title-large py-2'}>Personal Statistics</p>
            <div className={'flex gap-2  w-full '}>
                <Suspense fallback={<LoadingContainer />}>
                    <Await
                        resolve={promises}
                        errorElement={<div className={''}>An Error occurred</div>}>
                        {([rank, statistics, competitiveUpdate]) => (
                            <PlayerStatisticsComponent statistics={statistics} rank={rank} />
                        )}
                    </Await>
                </Suspense>
            </div>
            <p className={' font-semibold  text-title-large py-2'}>Daily Summary</p>
            <div className={'flex gap-2 w-full '}>
                <Suspense fallback={<LoadingContainer />}>
                    <Await
                        resolve={promises}
                        errorElement={<div className={''}>An Error occurred</div>}>
                        {([rank, statistics, competitiveUpdate, dailyRoundPerformance]) => (
                            <DailyStatisticsComponent competitiveUpdate={competitiveUpdate} />
                        )}
                    </Await>
                </Suspense>
            </div>
            <div className={'mt-5'}>
                <Outlet></Outlet>
            </div>
        </>
    );
};

export default IndexPage;
