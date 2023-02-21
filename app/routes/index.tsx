import type { LoaderFunction } from '@remix-run/node';
import { defer, json } from '@remix-run/node';
import { requireFrontendUser } from '~/utils/session/session.server';
import { Container } from '~/ui/container/Container';
import { PlayerStatisticsComponent } from '~/ui/player/PlayerStatisticsComponent';
import type { ValorantUser } from '~/models/user/ValorantUser';
import { Suspense, useState } from 'react';
import { DefaultButton } from '~/ui/common/DefaultButton';
import { StatusIndicator } from '~/ui/common/StatusIndicator';
import { MatchHistoryComponent } from '~/ui/match/MatchHistoryComponent';
import { checkForLiveGame, LivematchComponent } from '~/ui/match/LivematchComponent';
import type { FetcherWithComponents } from '@remix-run/react';
import { Await, Outlet, useFetcher, useLoaderData } from '@remix-run/react';
import type { LiveMatchRoute } from '~/routes/api/match/live';
import { getPlayerStatistics } from '~/utils/player/statistics.server';

export const loader: LoaderFunction = async ({ request }) => {
    const user = await requireFrontendUser(request);
    const statisticsPromise = getPlayerStatistics(user, user.userData.puuid);
    return json({ user, statisticsPromise });
};
const IndexPage = ({ error }: { error: any }) => {
    const { user, statisticsPromise } = useLoaderData<typeof loader>();
    const [isLive, setIsLive] = useState<boolean>(false);
    const checkForLiveGameFetcher =
        useFetcher() as unknown as FetcherWithComponents<LiveMatchRoute>;
    return (
        <>
            <div className={'flex gap-2 items-center'}>
                <p className={'font-inter font-medium text-headline-small text-white'}>
                    Hello, {user.userData.gameName}
                </p>
                <StatusIndicator live={isLive} />
                <DefaultButton onClick={() => checkForLiveGame(checkForLiveGameFetcher)}>
                    <p className={'text-label-medium font-medium'}>Check for live game</p>
                </DefaultButton>
            </div>
            <div className={'text-white mt-5 space-y-5'}>
                <Suspense fallback={<div>Loading...</div>}>
                    <Await resolve={statisticsPromise} errorElement={<div>An error occurred</div>}>
                        {(statistics) => <div>{JSON.stringify(statistics)}</div>}
                    </Await>
                </Suspense>

                <Outlet />
                {/*<Container>*/}
                {/*    <p className={'font-inter font-semibold text-title-large'}>Live match</p>*/}
                {/*    <LivematchComponent*/}
                {/*        onGameDetection={() => setIsLive(true)}*/}
                {/*        fetcher={checkForLiveGameFetcher}></LivematchComponent>*/}
                {/*</Container>*/}
            </div>
        </>
    );
};

export default IndexPage;
// export const ErrorBoundary = ({ error }: { error: any }) => {
//     const navigate = useNavigate();
//
//     const redirectToReauth = () => {
//         return navigate('/reauthenticate');
//     };
//
//     useEffect(() => {
//         if (error.message.includes('429')) {
//             return navigate('/slow-down');
//         }
//     }, []);
//
//     return (
//         <Container>
//             <div
//                 className={
//                     'w-full font-inter text-center flex flex-col leading-none gap-2 items-center'
//                 }>
//                 <p className={'font-bold text-title-large text-white'}>Oops!</p>
//                 <p className={'text-gray-400 text-label-medium leading-normal'}>
//                     It looks like something went wrong. But it doesnt look its your fault! You can
//                     try to reauthenticate your Riot session to fix this problem
//                 </p>
//                 <DefaultButton onClick={() => redirectToReauth()}>
//                     <p className={'text-black text-label-medium py-2'}>Reauthenticate</p>
//                 </DefaultButton>
//             </div>
//         </Container>
//     );
// };
