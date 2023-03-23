import type { DataFunctionArgs } from '@vercel/remix';
import { defer } from '@vercel/remix';
import { requireUser } from '~/utils/session/session.server';
import { Await, useLoaderData } from '@remix-run/react';
import { RiotRequest } from '~/models/Request';
import { endpoints } from '~/config/endpoints';
import { RiotGamesApiClient } from '~/utils/riot/RiotGamesApiClient';
import type { History, ValorantMatchHistory } from '~/models/valorant/match/ValorantMatchHistory';
import { getMatchDetails, getMatchMap } from '~/utils/match/match.server';
import type { MatchHistory } from '~/routes/api/player/$playerId/history';
import { getRelevantMatchData } from '~/routes/api/player/$playerId/history';
import { Suspense } from 'react';
import { LoadingContainer } from '~/ui/container/LoadingContainer';
import type { ValorantUser } from '~/models/user/ValorantUser';
import { MatchHistoryComponent } from '~/ui/match/MatchHistoryComponent';

type LoaderData = {
    history: Promise<MatchHistory[]>;
};

async function getHistory(user: ValorantUser, match: History) {
    const details = await getMatchDetails(user, match.MatchID);
    const map = await getMatchMap(details.matchInfo.mapId);
    return await getRelevantMatchData(user.userData.puuid, details, map!);
}

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
    const history = Promise.all(
        matchHistory.History.map((match) => {
            return getHistory(user, match);
        })
    );
    return defer<LoaderData>({ history });
};

const HistoryPage = () => {
    const { history } = useLoaderData() as unknown as LoaderData;
    return (
        <div className={'text-white'}>
            <p className={'font-inter font-semibold text-title-large py-2'}>Match history</p>
            <div className={'flex gap-2'}>
                <Suspense fallback={<LoadingContainer />}>
                    <Await resolve={history}>
                        {(resolvedHistory) => (
                            <MatchHistoryComponent
                                history={resolvedHistory}></MatchHistoryComponent>
                        )}
                    </Await>
                </Suspense>
            </div>
        </div>
    );
};

export default HistoryPage;
