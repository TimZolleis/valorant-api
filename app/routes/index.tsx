import { json, LoaderFunction } from '@remix-run/node';
import { requireFrontendUser, requireUser } from '~/utils/session/session.server';
import { Container } from '~/ui/container/Container';
import { PlayerStatisticsComponent } from '~/ui/player/PlayerStatisticsComponent';
import { useLoaderData, useNavigate } from 'react-router';
import { ValorantUser } from '~/models/user/ValorantUser';
import { useEffect, useState } from 'react';
import { DefaultButton } from '~/ui/common/DefaultButton';
import { StatusIndicator } from '~/ui/common/StatusIndicator';
import { MatchHistoryComponent } from '~/ui/match/MatchHistoryComponent';
import { checkForLiveGame, LivematchComponent } from '~/ui/match/LivematchComponent';
import is from '@sindresorhus/is';
import { FetcherWithComponents, useFetcher } from '@remix-run/react';
import { LiveMatchRoute } from '~/routes/api/match/live';

type LoaderData = {
    user: ValorantUser;
};

export const loader: LoaderFunction = async ({ request }) => {
    const user = await requireFrontendUser(request);
    return json<LoaderData>({ user });
};

export default function Index() {
    const { user } = useLoaderData() as LoaderData;
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
                <Container>
                    <p className={'font-inter font-semibold text-title-large py-2'}>
                        Personal Statistics
                    </p>
                    <div className={'flex gap-2'}>
                        <PlayerStatisticsComponent
                            playerUuid={user.userData.puuid}></PlayerStatisticsComponent>
                    </div>
                </Container>
                <Container>
                    <p className={'font-inter font-semibold text-title-large'}>Live match</p>
                    <LivematchComponent
                        onGameDetection={() => setIsLive(true)}
                        fetcher={checkForLiveGameFetcher}></LivematchComponent>
                </Container>
                {!isLive && (
                    <Container>
                        <p className={'font-inter font-semibold text-title-large py-2'}>
                            Match history
                        </p>
                        <div className={'flex gap-2'}>
                            <MatchHistoryComponent puuid={user.userData.puuid} />
                        </div>
                    </Container>
                )}
            </div>
        </>
    );
}
export const ErrorBoundary = ({ error }: { error: any }) => {
    const navigate = useNavigate();

    const redirectToReauth = () => {
        return navigate('/reauthenticate');
    };

    useEffect(() => {
        if (error.message.includes('429')) {
            return navigate('/slow-down');
        }
    }, []);

    return (
        <Container>
            <div
                className={
                    'w-full font-inter text-center flex flex-col leading-none gap-2 items-center'
                }>
                <p className={'font-bold text-title-large text-white'}>Oops!</p>
                <p className={'text-gray-400 text-label-medium '}>
                    It looks like something went wrong. But it doesnt look its your fault! You can
                    try to reauthenticate your Riot session to fix this problem
                </p>
                <DefaultButton onClick={() => redirectToReauth()}>
                    <p className={'text-black text-label-medium py-2'}>Reauthenticate</p>
                </DefaultButton>
            </div>
        </Container>
    );
};
