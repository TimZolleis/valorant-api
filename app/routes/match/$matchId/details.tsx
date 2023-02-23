import type { DataFunctionArgs } from '@remix-run/node';
import { defer } from '@remix-run/node';
import { requireParam, requireUser } from '~/utils/session/session.server';
import { getMatchDetails, getMatchMap } from '~/utils/match/match.server';
import { Await, Link, useLoaderData } from '@remix-run/react';
import { getRelevantMatchData } from '~/routes/api/player/$playerId/history';
import { Suspense } from 'react';
import { LoadingContainer } from '~/ui/container/LoadingContainer';
import type { ValorantApiMap } from '~/models/valorant-api/ValorantApiMap';
import { Container } from '~/ui/container/Container';
import { DefaultButton } from '~/ui/common/DefaultButton';

export const loader = async ({ request, params }: DataFunctionArgs) => {
    const user = await requireUser(request);
    const matchId = requireParam('matchId', params);
    const details = await getMatchDetails(user, matchId);
    const map = await getMatchMap(details.matchInfo.mapId);
    const relevantMatchData = getRelevantMatchData(user.userData.puuid, details, map);

    return defer({
        matchDetailsPromise: relevantMatchData,
    });
};

const MatchDetailsPage = () => {
    const { matchDetailsPromise } = useLoaderData<ReturnType<typeof loader>>();

    return (
        <Suspense fallback={<LoadingContainer />}>
            <Await resolve={matchDetailsPromise}>
                {(value) => (
                    <div className={'text-white mt-5'}>
                        <NoDetailsComponent></NoDetailsComponent>
                    </div>
                )}
            </Await>
        </Suspense>
    );
};

const NoDetailsComponent = () => {
    return (
        <Container>
            <p className={'font-semibold text-center text-title-large'}>No details to show</p>
            <p className={'text-center font-inter text-label-medium text-gray-400'}>
                There are currently no match details to show.
            </p>
            <div className={'flex w-full items-center justify-center mt-3'}>
                <Link to={'/'}>
                    <DefaultButton>
                        <p className={'text-black'}>Go back</p>
                    </DefaultButton>
                </Link>
            </div>
        </Container>
    );
};

export default MatchDetailsPage;
