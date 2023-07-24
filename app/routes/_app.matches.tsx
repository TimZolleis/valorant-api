import { PageHeader } from '~/components/ui/PageHeader';
import type { DataFunctionArgs } from '@vercel/remix';
import { defer } from '@vercel/remix';
import { requireUser } from '~/utils/session/session.server';
import { getMatches } from '~/utils/match/match.server';
import { Await, useLoaderData } from '@remix-run/react';
import { Suspense } from 'react';

export const loader = async ({ request }: DataFunctionArgs) => {
    const user = await requireUser(request);
    const matches = getMatches(user);
    return defer({ matches });
};

const MatchPage = () => {
    const { matches } = useLoaderData<typeof loader>();
    return (
        <>
            <PageHeader>Matches</PageHeader>
            <Suspense>
                <Await resolve={matches}>
                    {(matches) => (
                        <>
                            {matches.map((match) => (
                                <div className={'rounded-md p-3 border'}></div>
                            ))}
                        </>
                    )}
                </Await>
            </Suspense>
        </>
    );
};

export default MatchPage;
