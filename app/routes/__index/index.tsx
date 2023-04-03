import type { DataFunctionArgs } from '@vercel/remix';
import { defer, json } from '@vercel/remix';
import { requireUser } from '~/utils/session/session.server';
import { Await, useFetcher, useLoaderData } from '@remix-run/react';
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
import {
    commitPreferencesSession,
    getPreferencesSession,
} from '~/utils/session/preferences.server';
import { Select } from '~/ui/common/Select';

type LoaderData = {
    history: Promise<MatchHistory[]>;
    selectedQueue: string | null;
    competitiveUpdate: ValorantCompetitiveUpdate;
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
    const preferencesSession = await getPreferencesSession(request);
    const selectedQueue = preferencesSession.get<string>('historyQueue') || null;
    const riotRequest = new RiotRequest(user.userData.region).buildBaseUrl(
        endpoints.match.history(user.userData.puuid)
    );
    const matchHistory = await new RiotGamesApiClient(
        user.accessToken,
        user.entitlement
    ).getCached<ValorantMatchHistory>(
        riotRequest,
        {
            key: `match-history-${selectedQueue?.toLowerCase()}`,
            expiration: 300,
        },
        {
            params: {
                queue: selectedQueue?.toLowerCase(),
            },
        }
    );
    const competitiveUpdate = await getCompetitiveUpdates(user, user.userData.puuid);
    const history = Promise.all(
        matchHistory.History.map((match) => {
            return getHistory(user, match, competitiveUpdate);
        })
    );
    return defer<LoaderData>({ history, selectedQueue, competitiveUpdate });
};

export const action = async ({ request }: DataFunctionArgs) => {
    const formData = await request.formData();
    const preferencesSession = await getPreferencesSession(request);
    const selectedQueue = await formData.get('queue');
    if (selectedQueue === 'All') {
        preferencesSession.set('historyQueue', null);
    } else {
        preferencesSession.set('historyQueue', selectedQueue);
    }

    return json(
        {},
        {
            headers: {
                'Set-Cookie': await commitPreferencesSession(preferencesSession),
            },
        }
    );
};

const HistoryPage = () => {
    const { history, selectedQueue, competitiveUpdate } = useLoaderData() as unknown as LoaderData;
    return (
        <div className={''}>
            <span className={'flex gap-2 items-center'}>
                <p className={' font-semibold text-title-large py-2'}>Match history</p>
                <QueueSelector selectedQueue={selectedQueue} />
            </span>
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

const QueueSelector = ({ selectedQueue }: { selectedQueue: string | null }) => {
    const options = ['All', 'Deathmatch', 'Unrated', 'Competitive', 'Swiftplay'];
    const fetcher = useFetcher<typeof action>();
    const setQueue = (queue: string) => {
        fetcher.submit({ queue: queue }, { method: 'post' });
    };
    return (
        <Select
            options={options}
            preselect={selectedQueue ? selectedQueue : 'All'}
            onChange={(queue) => setQueue(queue)}
        />
    );
};

export default HistoryPage;
