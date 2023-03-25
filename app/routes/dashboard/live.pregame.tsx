import type { DataFunctionArgs } from '@vercel/remix';
import { defer, redirect } from '@vercel/remix';
import { requireUser } from '~/utils/session/session.server';
import { getCharacterByUUid, getMatchMap } from '~/utils/match/match.server';
import { getPlayerRank } from '~/utils/player/rank.server';
import { NoPregameFoundException } from '~/exceptions/NoPregameFoundException';
import { PREGAME_MATCH } from '~/test/TEST_PREGAME';
import type { RouteMatch } from '@remix-run/react';
import { Await, Link, Outlet, useLoaderData, useRevalidator } from '@remix-run/react';
import { Suspense, useEffect, useState } from 'react';
import { LoadingContainer } from '~/ui/container/LoadingContainer';
import { getPlayerNameService } from '~/utils/player/nameservice.server';
import { PlayerInGameComponent } from '~/ui/player/PlayerInGameComponent';
import { getServerRegion } from '~/utils/match/servername';
import { Tag } from '~/ui/common/Tag';
import { BreadCrumbLink } from '~/ui/common/BreadCrumbLink';
import { get } from '@vercel/edge-config';
import { getRunningPregameMatch } from '~/utils/match/livematch.server';

export const handle = {
    breadcrumb: (match: RouteMatch) => (
        <BreadCrumbLink to={match.pathname}>Live Pregame</BreadCrumbLink>
    ),
};

export const loader = async ({ request }: DataFunctionArgs) => {
    const user = await requireUser(request);
    try {
        const mockPregame = await get('mockPregame');
        const pregame = mockPregame
            ? PREGAME_MATCH
            : await getRunningPregameMatch(user, user.userData.puuid);
        const players = Promise.all(
            pregame.AllyTeam.Players.map((player) => {
                const nameService = getPlayerNameService(user, player.PlayerIdentity.Subject);
                const character = getCharacterByUUid(player.CharacterID);
                const rank = getPlayerRank(user, player.PlayerIdentity.Subject);
                return Promise.all([player, rank, character, nameService]);
            })
        );
        const map = getMatchMap(pregame.MapID);
        return defer({
            status: 'pregame',
            pregame,
            map,
            players,
        });
    } catch (e) {
        if (!(e instanceof NoPregameFoundException)) {
            throw e;
        }
        throw redirect('/');
    }
};

const LiveMatchPage = () => {
    const { players, map, pregame } = useLoaderData<typeof loader>();
    const [remainingTime, setRemainingTime] = useState(5);
    const revalidator = useRevalidator();
    useEffect(() => {
        const interval = setInterval(() => {
            if (remainingTime > 0) {
                setRemainingTime(remainingTime - 1);
            } else {
                revalidator.revalidate();
                setRemainingTime(5);
            }
        }, 1000);
        return () => clearInterval(interval);
    });

    return (
        <div className={'text-white'}>
            <div className={'flex items-center gap-2'}>
                <p className={'font-inter text-title-medium font-semibold'}>Pregame</p>
                <Suspense>
                    <Await resolve={pregame}>
                        {(pregame) => (
                            <Tag text={getServerRegion(pregame.GamePodID)} color={'fuchsia'}></Tag>
                        )}
                    </Await>
                </Suspense>
                <Suspense>
                    <Await resolve={map}>
                        {(map) => <Tag text={map.displayName} color={'amber'}></Tag>}
                    </Await>
                </Suspense>
            </div>
            <Suspense fallback={<LoadingContainer />}>
                <Await resolve={players}>
                    {(players) => (
                        <div>
                            <p
                                className={
                                    'font-inter text-white font-semibold text-title-small py-3'
                                }>
                                Ally Players
                            </p>
                            <div
                                className={
                                    'grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                                }>
                                {players.map(([player, rank, character, nameService]) => (
                                    <Link
                                        prefetch={'intent'}
                                        to={`playerdetails/${player.Subject}`}
                                        key={player.Subject}>
                                        <PlayerInGameComponent
                                            player={player}
                                            character={character}
                                            rank={rank}
                                            nameService={nameService}></PlayerInGameComponent>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </Await>
            </Suspense>
            <Outlet />
        </div>
    );
};

export default LiveMatchPage;
