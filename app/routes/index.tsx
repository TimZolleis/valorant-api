import { json, LoaderFunction } from '@remix-run/node';
import { requireFrontendUser, requireUser } from '~/utils/session/session.server';
import { useOptionalUser } from '~/utils/hooks/matchesData';
import { Container } from '~/ui/container/Container';
import { PlayerStatisticsComponent } from '~/ui/player/PlayerStatisticsComponent';
import { useLoaderData } from 'react-router';
import { ValorantUser } from '~/models/user/ValorantUser';
import { PlayerRankComponent } from '~/ui/player/PlayerRankComponent';

type LoaderData = {
    user: ValorantUser;
};

export const loader: LoaderFunction = async ({ request }) => {
    const user = await requireFrontendUser(request);
    return json<LoaderData>({ user });
};

export default function Index() {
    const { user } = useLoaderData() as LoaderData;
    return (
        <>
            <p className={'font-inter font-medium text-headline-small text-white'}>
                Hello, {user.userData.gameName}
            </p>
            <div className={'text-white mt-5 space-y-5'}>
                <Container>
                    <p className={'font-inter font-semibold text-title-medium py-2'}>
                        Personal Statistics
                    </p>
                    <div className={'flex gap-2'}>
                        <PlayerStatisticsComponent
                            playerUuid={user.userData.puuid}></PlayerStatisticsComponent>
                    </div>
                </Container>
                <Container>
                    <p className={'font-inter font-semibold text-title-medium py-2'}>
                        Match history
                    </p>
                    <div className={'flex gap-2'}>
                        <PlayerStatisticsComponent
                            playerUuid={user.userData.puuid}></PlayerStatisticsComponent>
                    </div>
                </Container>
            </div>
        </>
    );
}
