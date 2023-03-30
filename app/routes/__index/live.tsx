import type { DataFunctionArgs } from '@vercel/remix';
import { defer, redirect } from '@vercel/remix';
import { requireUser } from '~/utils/session/session.server';
import type { ValorantUser } from '~/models/user/ValorantUser';
import { TEST_COREGAME } from '~/test/TEST_COREGAME';
import { getRunningCoregameMatch, getRunningPregameMatch } from '~/utils/match/livematch.server';
import { getPlayerNameService } from '~/utils/player/nameservice.server';
import {
    getCharacterByUUid,
    getMatchMap,
    scheduleMatchForAnalysis,
} from '~/utils/match/match.server';
import { getPlayerRank } from '~/utils/player/rank.server';
import { get } from '@vercel/edge-config';
import { PREGAME_MATCH } from '~/test/TEST_PREGAME';
import { Await, Link, Outlet, useLoaderData, useRevalidator } from '@remix-run/react';
import { Suspense, useEffect, useState } from 'react';
import { LoadingTag } from '~/ui/common/LoadingTag';
import { Tag } from '~/ui/common/Tag';
import { getServerRegion } from '~/utils/match/servername';
import type { ValorantPregameMatch } from '~/models/valorant/match/ValorantPregameMatch';
import type { ValorantCoregameMatch } from '~/models/valorant/match/ValorantCoregameMatch';
import type { ValorantApiMap } from '~/models/valorant-api/ValorantApiMap';
import { LoadingContainer } from '~/ui/container/LoadingContainer';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { PlayerInGameComponent } from '~/ui/player/PlayerInGameComponent';
import { detectGame } from '~/routes/api/match/live';
import {
    commitMatchSession,
    getCurrentMatch,
    getLastMatch,
    setCurrentMatch,
    setLastMatch,
} from '~/utils/session/match.server';

type TeamType = 'playerTeam' | 'enemyTeam';

type Team<G extends MatchType, M extends keyof Match<G>> = Match<G>[M];
type PregameTeam = Team<'pregame', 'playerTeam'>;
type CoregameTeam<T extends TeamType> = Team<'coregame', T>;

type MatchType = 'coregame' | 'pregame' | undefined;
type Coregame = Awaited<ReturnType<typeof getCoregame>>;
type Pregame = Awaited<ReturnType<typeof getPregame>>;

type Match<T extends MatchType> = T extends 'coregame'
    ? Coregame
    : T extends 'pregame'
    ? Pregame
    : never;

type TeamName = 'Ally Team' | 'Enemy Team';

async function getPregame(user: ValorantUser) {
    const isMocked = await get('mockPregame');
    const match = isMocked
        ? PREGAME_MATCH
        : await getRunningPregameMatch(user, user.userData.puuid);
    const playerTeam = Promise.all(
        match.AllyTeam.Players.map((player) => {
            const nameService = getPlayerNameService(user, player.PlayerIdentity.Subject);
            const character = getCharacterByUUid(player.CharacterID);
            const rank = getPlayerRank(user, player.PlayerIdentity.Subject);
            return Promise.all([player, rank, character, nameService]);
        })
    );
    const map = getMatchMap(match.MapID);
    return { match, playerTeam, map };
}

async function getCoregame(user: ValorantUser) {
    const isMocked = await get('mockCoregame');
    const match = isMocked
        ? TEST_COREGAME
        : await getRunningCoregameMatch(user, user.userData.puuid);
    const playerTeamId = match.Players.find((player) => {
        return player.Subject === user.userData.puuid;
    })?.TeamID;

    const playerTeam = Promise.all(
        match.Players.filter((player) => player.TeamID === playerTeamId).map((player) => {
            const nameService = getPlayerNameService(user, player.PlayerIdentity.Subject);
            const character = getCharacterByUUid(player.CharacterID);
            const rank = getPlayerRank(user, player.PlayerIdentity.Subject);
            return Promise.all([player, rank, character, nameService]);
        })
    );
    const enemyTeam = Promise.all(
        match.Players.filter((player) => player.TeamID !== playerTeamId).map((player) => {
            const nameService = getPlayerNameService(user, player.PlayerIdentity.Subject);
            const character = getCharacterByUUid(player.CharacterID);
            const rank = getPlayerRank(user, player.PlayerIdentity.Subject);
            return Promise.all([player, rank, character, nameService]);
        })
    );
    const map = getMatchMap(match.MapID);
    return { match, playerTeam, enemyTeam, map };
}

export const loader = async ({ request }: DataFunctionArgs) => {
    const user = await requireUser(request);
    const matchType = await detectGame(user, user.userData.puuid).then((res) => res.status);
    if (matchType === 'coregame') {
        try {
            const { match, playerTeam, enemyTeam, map } = await getCoregame(user);
            const session = await setCurrentMatch(request, match.MatchID);
            return defer(
                { match, playerTeam, enemyTeam, map, type: matchType },
                {
                    headers: {
                        'Set-Cookie': await commitMatchSession(session),
                    },
                }
            );
        } catch (e) {
            const currentMatch = await getCurrentMatch(request);
            const session = await setLastMatch(request, currentMatch);
            throw redirect('/', {
                headers: {
                    'Set-Cookie': await commitMatchSession(session),
                },
            });
        }
    }
    if (matchType === 'pregame') {
        try {
            const { match, playerTeam, map } = await getPregame(user);
            const enemyTeam = null;
            const session = await setCurrentMatch(request, match.ID);
            return defer(
                { match, playerTeam, enemyTeam, map, type: matchType },
                {
                    headers: {
                        'Set-Cookie': await commitMatchSession(session),
                    },
                }
            );
        } catch (e) {
            const currentMatch = await getCurrentMatch(request);
            const session = await setLastMatch(request, currentMatch);
            throw redirect('/', {
                headers: {
                    'Set-Cookie': await commitMatchSession(session),
                },
            });
        }
    }
    const currentMatch = await getCurrentMatch(request);
    const session = await setLastMatch(request, currentMatch);
    if (currentMatch) {
        await scheduleMatchForAnalysis(user, currentMatch);
    }
    throw redirect('/', {
        headers: {
            'Set-Cookie': await commitMatchSession(session),
        },
    });
};

const LiveMatchPage = () => {
    const { match, playerTeam, map, enemyTeam, type } = useLoaderData<typeof loader>();
    const [remainingTime, setRemainingTime] = useState(5);
    const revalidator = useRevalidator();
    useEffect(() => {
        if (type === 'pregame') {
            const interval = setInterval(() => {
                if (remainingTime > 0) {
                    setRemainingTime(remainingTime - 1);
                } else {
                    revalidator.revalidate();
                    setRemainingTime(5);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    });
    return (
        <div className={''}>
            <MatchHeader match={match} map={map} type={type}></MatchHeader>
            {type === 'pregame' ? (
                <TeamComponent<'pregame', 'playerTeam'>
                    team={playerTeam}
                    teamName={'Ally Team'}
                    playerContainer={type}
                />
            ) : null}
            {type === 'coregame' ? (
                <div className={'grid md:grid-cols-2 gap-2 w-full'}>
                    <TeamComponent<'coregame', 'playerTeam'>
                        team={playerTeam}
                        teamName={'Enemy Team'}
                        playerContainer={type}
                    />
                    <TeamComponent<'coregame', 'enemyTeam'>
                        team={enemyTeam}
                        teamName={'Enemy Team'}
                        playerContainer={type}
                    />
                </div>
            ) : null}
        </div>
    );
};

const MatchHeader = ({
    match,
    map,
    type,
}: {
    match: ValorantCoregameMatch | ValorantPregameMatch;
    map: Promise<ValorantApiMap>;
    type: MatchType;
}) => {
    return (
        <section className={'flex items-center gap-2'}>
            <p className={' text-title-medium font-semibold capitalize'}>{type}</p>
            <Suspense fallback={<LoadingTag />}>
                <Await resolve={match}>
                    {(match) => (
                        <Tag text={getServerRegion(match.GamePodID)} color={'fuchsia'}></Tag>
                    )}
                </Await>
            </Suspense>
            <Suspense fallback={<LoadingTag />}>
                <Await resolve={map}>
                    {(map) => <Tag text={map.displayName} color={'amber'}></Tag>}
                </Await>
            </Suspense>
            <Outlet />
        </section>
    );
};

const teamComponent = cva('grid gap-2 w-full', {
    variants: {
        playerContainer: {
            pregame: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
            coregame: '',
        },
    },
});

interface TeamComponentProps<M extends MatchType, T extends TeamType>
    extends VariantProps<typeof teamComponent> {
    team: M extends 'coregame' ? CoregameTeam<T> : PregameTeam;
    teamName: TeamName;
}

const TeamComponent = <M extends MatchType, T extends TeamType>({
    team,
    teamName,
    playerContainer,
}: TeamComponentProps<M, T>) => {
    return (
        <div>
            <section>
                <p className={'  font-semibold text-title-small py-3'}>{teamName}</p>
                <Suspense fallback={<LoadingContainer />}>
                    <Await resolve={team}>
                        {(players) => (
                            <div className={teamComponent({ playerContainer })}>
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
                        )}
                    </Await>
                </Suspense>
            </section>
        </div>
    );
};

export default LiveMatchPage;
