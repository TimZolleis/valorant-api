import type { DataFunctionArgs } from '@remix-run/node';
import { defer, redirect } from '@remix-run/node';
import { requireUser } from '~/utils/session/session.server';
import { getCharacterByUUid, getMatchMap } from '~/utils/match/match.server';
import { getPlayerRank } from '~/utils/player/rank.server';
import { NoPregameFoundException } from '~/exceptions/NoPregameFoundException';
import { Await, Link, Outlet, RouteMatch, useLoaderData } from '@remix-run/react';
import { Suspense } from 'react';
import { LoadingContainer } from '~/ui/container/LoadingContainer';
import { getPlayerNameService } from '~/utils/player/nameservice.server';
import { PlayerInGameComponent } from '~/ui/player/PlayerInGameComponent';
import { getServerRegion } from '~/utils/match/servername';
import { Tag } from '~/ui/common/Tag';
import { TEST_COREGAME } from '~/test/TEST_COREGAME';
import { LoadingTag } from '~/ui/common/LoadingTag';
import { NoCoregameFoundException } from '~/exceptions/NoCoregameFoundException';
import { BreadCrumbLink } from '~/ui/common/BreadCrumbLink';
import { getRunningCoregameMatch } from '~/utils/match/livematch.server';

export const handle = {
    breadcrumb: (match: RouteMatch) => (
        <BreadCrumbLink to={match.pathname}>Live Coregame</BreadCrumbLink>
    ),
};

export const loader = async ({ request }: DataFunctionArgs) => {
    const user = await requireUser(request);
    try {
        const coregame = await getRunningCoregameMatch(user, user.userData.puuid);
        const playerTeamId = coregame.Players.find((player) => {
            return player.Subject === user.userData.puuid;
        })?.TeamID;

        const playerTeam = Promise.all(
            coregame.Players.filter((player) => player.TeamID === playerTeamId).map((player) => {
                const nameService = getPlayerNameService(user, player.PlayerIdentity.Subject);
                const character = getCharacterByUUid(player.CharacterID);
                const rank = getPlayerRank(user, player.PlayerIdentity.Subject);
                return Promise.all([player, rank, character, nameService]);
            })
        );
        const enemyTeam = Promise.all(
            coregame.Players.filter((player) => player.TeamID !== playerTeamId).map((player) => {
                const nameService = getPlayerNameService(user, player.PlayerIdentity.Subject);
                const character = getCharacterByUUid(player.CharacterID);
                const rank = getPlayerRank(user, player.PlayerIdentity.Subject);
                return Promise.all([player, rank, character, nameService]);
            })
        );
        const map = getMatchMap(coregame.MapID);
        return defer({
            status: 'coregame',
            coregame,
            map,
            playerTeam,
            enemyTeam,
        });
    } catch (e) {
        if (!(e instanceof NoCoregameFoundException)) {
            throw e;
        }
        throw redirect('/');
    }
};

const LiveMatchPage = () => {
    const { playerTeam, enemyTeam, map, coregame } = useLoaderData<typeof loader>();
    return (
        <div className={'text-white'}>
            <div className={'flex items-center gap-2'}>
                <p className={'font-inter text-title-medium font-semibold'}>Coregame</p>
                <Suspense fallback={<LoadingTag />}>
                    <Await resolve={coregame}>
                        {(pregame) => (
                            <Tag
                                text={getServerRegion(pregame.GamePodID)}
                                color={'bg-fuchsia-800/50'}
                                textColor={'text-fuchsia-500'}
                                borderColor={'border-fuchsia-500'}></Tag>
                        )}
                    </Await>
                </Suspense>
                <Suspense fallback={<LoadingTag />}>
                    <Await resolve={map}>
                        {(map) => (
                            <Tag
                                text={map.displayName}
                                color={'bg-amber-800/50'}
                                textColor={'text-amber-500'}
                                borderColor={'border-amber-500'}></Tag>
                        )}
                    </Await>
                </Suspense>
            </div>
            <div className={'grid md:grid-cols-2 gap-2'}>
                <div>
                    <p className={'font-inter text-white font-semibold text-title-small py-3'}>
                        Ally Players
                    </p>
                    <Suspense fallback={<LoadingContainer />}>
                        <Await resolve={playerTeam}>
                            {(players) => (
                                <div className={'grid gap-2'}>
                                    {players.map(([player, rank, character, nameService]) => (
                                        <Link
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
                            )}
                        </Await>
                    </Suspense>
                </div>
                <div>
                    <p className={'font-inter text-white font-semibold text-title-small py-3'}>
                        Enemy Players
                    </p>

                    <Suspense fallback={<LoadingContainer />}>
                        <Await resolve={enemyTeam}>
                            {(players) => (
                                <div className={'grid gap-2 '}>
                                    {players.map(([player, rank, character, nameService]) => (
                                        <Link
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
                            )}
                        </Await>
                    </Suspense>
                </div>
            </div>
            <Outlet />
        </div>
    );
};

export default LiveMatchPage;
