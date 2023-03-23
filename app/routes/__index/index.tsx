import type { DataFunctionArgs } from '@vercel/remix';
import { defer } from '@vercel/remix';
import { requireUser } from '~/utils/session/session.server';
import { Await, useLoaderData } from '@remix-run/react';
import { RiotRequest } from '~/models/Request';
import { endpoints } from '~/config/endpoints';
import { RiotGamesApiClient } from '~/utils/riot/RiotGamesApiClient';
import type { History, ValorantMatchHistory } from '~/models/valorant/match/ValorantMatchHistory';
import type { MatchHistory } from '~/utils/match/match.server';
import { getMatchDetails, getMatchMap, getRelevantMatchData } from '~/utils/match/match.server';
import { Suspense } from 'react';
import { LoadingContainer } from '~/ui/container/LoadingContainer';
import type { ValorantUser } from '~/models/user/ValorantUser';
import { MatchHistoryComponent } from '~/ui/match/MatchHistoryComponent';
import type { ValorantCompetitiveUpdate } from '~/models/valorant/competitive/ValorantCompetitiveUpdate';
import { getCompetitiveUpdates } from '~/utils/player/competitiveupdate.server';

type LoaderData = {
    history: Promise<MatchHistory[]>;
};

export async function getHistory(
    user: ValorantUser,
    match: History,
    competitiveUpdates: ValorantCompetitiveUpdate
) {
    const details = await getMatchDetails(user, match.MatchID);
    const map = await getMatchMap(details.matchInfo.mapId);
    const competitiveUpdateMatch = competitiveUpdates.Matches.find((match) => {
        return match.MatchID === details.matchInfo.matchId;
    });
    return await getRelevantMatchData(user.userData.puuid, details, map!, competitiveUpdateMatch);
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
    const competitiveUpdates = await getCompetitiveUpdates(user, user.userData.puuid);
    const history = Promise.all(
        matchHistory.History.map((match) => {
            return getHistory(user, match, competitiveUpdates);
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
