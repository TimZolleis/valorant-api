import type { LoaderArgs } from '@vercel/remix';
import { defer } from '@vercel/remix';
import { requireParam, requireUser } from '~/utils/session/session.server';
import { getCharacterByUUid, getMatchDetails } from '~/utils/match/match.server';
import { getPlayerRank } from '~/utils/player/rank.server';
import { getPlayerNameService } from '~/utils/player/nameservice.server';
import type { RouteMatch } from '@remix-run/react';
import { Await, Link, useLoaderData } from '@remix-run/react';
import { Suspense } from 'react';
import type { Player } from '~/models/valorant/match/ValorantMatchDetails';
import type { ValorantUser } from '~/models/user/ValorantUser';
import { PlayerComponent } from '~/ui/player/PlayerComponent';
import { LoadingContainer } from '~/ui/container/LoadingContainer';
import { getCompetitiveUpdates } from '~/utils/player/competitiveupdate.server';

type LoaderData = ReturnType<typeof loader>;

type PlayerData = ReturnType<typeof getPlayerData>;

export const handle = {
    breadcrumb: (match: RouteMatch) => <Link to={`${match.pathname}`}>Players</Link>,
};

function getPlayerData(user: ValorantUser, player: Player) {
    const rank = getPlayerRank(user, player.subject);
    const competitiveUpdate = getCompetitiveUpdates(user, player.subject);
    const character = getCharacterByUUid(player.characterId);
    const nameservice = getPlayerNameService(user, player.subject);
    return { rank, character, nameservice, competitiveUpdate };
}

export const loader = async ({ request, params }: LoaderArgs) => {
    const user = await requireUser(request);
    const matchId = requireParam('matchId', params);
    const details = await getMatchDetails(user, matchId);
    const playerTeamId = details.players.find((player) => {
        return player.subject === user.userData.puuid;
    })?.teamId;

    const playerTeam = details.players.filter((player) => {
        return player.teamId === playerTeamId;
    });
    const enemyTeam = details.players.filter((player) => {
        return player.teamId !== playerTeamId;
    });

    const playerTeamPlayerDetails = playerTeam.map((player) => {
        return getPlayerData(user, player);
    });

    const enemyTeamPlayerDetails = enemyTeam.map((player) => {
        return getPlayerData(user, player);
    });

    const playerTeamDetailsPromise = Promise.all(
        playerTeamPlayerDetails.map((details) =>
            Promise.all([
                details.rank,
                details.nameservice,
                details.character,
                details.competitiveUpdate,
            ])
        )
    );

    const enemyTeamDetailsPromise = Promise.all(
        enemyTeamPlayerDetails.map((details) =>
            Promise.all([
                details.rank,
                details.nameservice,
                details.character,
                details.competitiveUpdate,
            ])
        )
    );

    return defer({ playerTeamDetailsPromise, enemyTeamDetailsPromise, matchId });
};

const MatchPlayersPage = () => {
    const { enemyTeamDetailsPromise, playerTeamDetailsPromise, matchId } =
        useLoaderData<LoaderData>();
    return (
        <div className={''}>
            <section className={'mt-5 grid gap-2 md:grid-cols-2'}>
                <section>
                    <p className={'  text-title-medium font-semibold py-2'}>Ally team</p>
                    <div>
                        <Suspense fallback={<LoadingContainer />}>
                            <div className={'space-y-2'}>
                                <Await resolve={playerTeamDetailsPromise}>
                                    {(value) =>
                                        value.map(
                                            ([rank, nameservice, character, competitiveUpdate]) => (
                                                <PlayerComponent
                                                    key={nameservice.Subject}
                                                    rank={rank}
                                                    character={character}
                                                    nameservice={nameservice}
                                                    competitiveUpdate={competitiveUpdate}
                                                    matchId={matchId}
                                                />
                                            )
                                        )
                                    }
                                </Await>
                            </div>
                        </Suspense>
                    </div>
                </section>
                <section>
                    <p className={'  text-title-medium font-semibold py-2'}>Enemy team</p>
                    <Suspense fallback={<LoadingContainer />}>
                        <div className={'space-y-2'}>
                            <Await resolve={enemyTeamDetailsPromise}>
                                {(value) =>
                                    value.map(
                                        ([rank, nameservice, character, competitiveUpdate]) => (
                                            <PlayerComponent
                                                key={nameservice.Subject}
                                                rank={rank}
                                                character={character}
                                                nameservice={nameservice}
                                                competitiveUpdate={competitiveUpdate}
                                                matchId={matchId}
                                            />
                                        )
                                    )
                                }
                            </Await>
                        </div>
                    </Suspense>
                </section>
            </section>
        </div>
    );
};

export default MatchPlayersPage;
