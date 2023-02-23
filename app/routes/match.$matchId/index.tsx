import type { DataFunctionArgs } from '@remix-run/node';
import { defer } from '@remix-run/node';
import { requireParam, requireUser } from '~/utils/session/session.server';
import { getMatchDetails } from '~/utils/match/match.server';
import { Await, Link, Outlet, RouteMatch, useLoaderData, useMatches } from '@remix-run/react';
import { Suspense } from 'react';
import { getServerRegion } from '~/utils/match/servername';
import { LoadingContainer } from '~/ui/container/LoadingContainer';
import { HorizontalNavBar } from '~/ui/nav/HorizontalNavBar';

export const loader = async ({ request, params }: DataFunctionArgs) => {
    const user = await requireUser(request);
    const matchId = requireParam('matchId', params);
    const detailsPromise = getMatchDetails(user, matchId);
    return defer({ detailsPromise });
};

const links = [
    {
        name: 'Players',
        href: 'players',
    },
    {
        name: 'Details',
        href: 'details',
    },
];

export const handle = {
    breadcrumb: (match: RouteMatch) => <Link to={`${match.pathname}`}>Match</Link>,
};

const MatchPage = () => {
    const { detailsPromise } = useLoaderData<typeof loader>();
    return (
        <>
            <div className={'text-white'}>
                <Suspense fallback={<LoadingContainer />}>
                    <Await resolve={detailsPromise}>
                        {(details) => (
                            <div className={'border-b border-zinc-800 py-2'}>
                                <h1 className={'font-medium text-headline-medium font-inter'}>
                                    Match details
                                </h1>
                                <div className={'flex items-center gap-2'}>
                                    <div
                                        className={
                                            'bg-amber-800/50 border border-amber-500 px-3 py-1 rounded-md'
                                        }>
                                        <p className={'font-inter text-label-small text-amber-500'}>
                                            {getServerRegion(details.matchInfo.gamePodId)}
                                        </p>
                                    </div>
                                    <div
                                        className={
                                            'bg-rose-800/50 border border-rose-500 px-3 py-1 rounded-md'
                                        }>
                                        <p
                                            className={
                                                'font-inter text-label-small text-rose-500 capitalize'
                                            }>
                                            {details.matchInfo.queueID}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Await>
                </Suspense>
                <HorizontalNavBar links={links}></HorizontalNavBar>
            </div>
            <Outlet />
        </>
    );
};

export default MatchPage;
