import { DataFunctionArgs, defer } from '@remix-run/node';
import { requirePlayerUuidAsParam, requireUser } from '~/utils/session/session.server';
import { Await, useLoaderData } from '@remix-run/react';
import { Container } from '~/ui/container/Container';
import { MatchHistoryComponent } from '~/ui/match/MatchHistoryComponent';
import { RiotRequest } from '~/models/Request';
import { endpoints } from '~/config/endpoints';
import { RiotGamesApiClient } from '~/utils/riot/RiotGamesApiClient';
import { ValorantMatchHistory } from '~/models/valorant/match/ValorantMatchHistory';
import { getMatchDetails, getMatchMap } from '~/utils/match/match.server';
import { getRelevantMatchData, MatchHistoryRouteData } from '~/routes/api/player/$playerId/history';
import { Suspense } from 'react';
import { LoadingContainer } from '~/ui/container/LoadingContainer';

export const loader = async ({ request }: DataFunctionArgs) => {
    const user = await requireUser(request);
    const riotRequest = new RiotRequest(user.userData.region).buildBaseUrl(
        endpoints.match.history(user.userData.puuid)
    );
    const matchHistory = await new RiotGamesApiClient(
        user.accessToken,
        user.entitlement
    ).getCached<ValorantMatchHistory>(riotRequest, {
        key: 'match-history',
        expiration: 300,
    });
    const history = matchHistory.History.map(async (match) => {
        const details = await getMatchDetails(user, match.MatchID);
        const map = await getMatchMap(details.matchInfo.mapId);
        return await getRelevantMatchData(user.userData.puuid, details, map!);
    });
    return defer({ history });
};

const HistoryPage = () => {
    const { history } = useLoaderData<typeof loader>();
    return (
        <Container>
            <p className={'font-inter font-semibold text-title-large py-2'}>Match history</p>
            <div className={'flex gap-2'}>
                {/*<Suspense fallback={<LoadingContainer />}>*/}
                {/*    <Await resolve={history}>*/}
                {/*        {(resolvedHistory) => (*/}
                {/*            <MatchHistoryComponent*/}
                {/*                history={resolvedHistory}></MatchHistoryComponent>*/}
                {/*        )}*/}
                {/*    </Await>*/}
                {/*</Suspense>*/}
            </div>
        </Container>
    );
};

export default HistoryPage;
