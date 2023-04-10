import type { DataFunctionArgs } from '@vercel/remix';
import { defer, redirect } from '@vercel/remix';
import { requireUser } from '~/utils/session/session.server';
import { getPlayerRank } from '~/utils/player/rank.server';
import { getCompetitiveUpdates } from '~/utils/player/competitiveupdate.server';
import { Await, useLoaderData } from '@remix-run/react';
import { Suspense, useMemo } from 'react';
import { UnofficialValorantApi } from '~/utils/unofficial-valorant-api/client.server';
import type { UnofficalValorantApiAccountDetails } from '~/models/unofficial-valorant-api/AccountDetails';
import { unofficalValorantApiEndpoints } from '~/config/unofficialValorantApiEndpoints';
import {
    PlayerStatisticsComponent,
    StatisticsContainer,
} from '~/ui/player/PlayerStatisticsComponent';
import { getPlayerStatistics } from '~/utils/player/statistics.server';
import { Tag } from '~/ui/common/Tag';
import { LoadingContainer } from '~/ui/container/LoadingContainer';

async function getAccountDetailsByPuuid(puuid: string) {
    return await new UnofficialValorantApi().getCached<UnofficalValorantApiAccountDetails>(
        unofficalValorantApiEndpoints.getAccountByPuuid(puuid),
        {
            key: `account-details-${puuid}`,
            expiration: 86400,
        }
    );
}

export const loader = async ({ request, params }: DataFunctionArgs) => {
    const user = await requireUser(request);
    const playerId = params.playerId;
    if (!playerId) {
        throw redirect('/search');
    }
    const details = getAccountDetailsByPuuid(playerId);
    const statistics = getPlayerStatistics(user, playerId);
    const rank = getPlayerRank(user, playerId);
    const competitiveUpdate = getCompetitiveUpdates(user, playerId);
    return defer({ details, rank, competitiveUpdate, statistics });
};

const SearchedPlayerDetailsPage = () => {
    const { details, rank, competitiveUpdate, statistics } = useLoaderData<typeof loader>();
    const statisticPromises = useMemo(
        () => Promise.all([rank, competitiveUpdate, statistics]),
        [rank, competitiveUpdate, statistics]
    );

    return (
        <div>
            <p>Player Details</p>
            <Suspense fallback={<LoadingContainer />}>
                <Await resolve={details}>
                    {(details) => (
                        <div>
                            <span className={'flex items-center'}>
                                <p className={'text-headline-medium font-bold'}>{details.name}</p>
                                <p className={'text-headline-medium text-gray-400'}>
                                    #{details.tag}
                                </p>
                                <img
                                    className={'ml-2 w-12 rounded-full '}
                                    src={details.card.small}
                                    alt=''
                                />
                            </span>
                        </div>
                    )}
                </Await>
            </Suspense>

            <div>
                <p className={'text-title-medium'}>Player statistics</p>
                <Suspense fallback={<LoadingContainer />}>
                    <Await resolve={statisticPromises}>
                        {([rank, competitiveUpdate, statistics]) => (
                            <div className={'mt-2'}>
                                <PlayerStatisticsComponent
                                    statistics={statistics}
                                    rank={rank}
                                    competitiveUpdate={competitiveUpdate}
                                />
                            </div>
                        )}
                    </Await>
                </Suspense>
                <Suspense fallback={<LoadingContainer />}>
                    <div className={'mt-2'}>
                        <Await resolve={competitiveUpdate}>
                            {(competitiveUpdate) => (
                                <StatisticsContainer title={'Competitive history'}>
                                    <div className={'mt-2 space-y-2'}>
                                        {competitiveUpdate.Matches.map((match) => (
                                            <Tag
                                                text={match.RankedRatingEarned.toString()}
                                                key={match.MatchID}
                                                color={
                                                    match.RankedRatingEarned < 0
                                                        ? 'red'
                                                        : match.RankedRatingEarned < 2
                                                        ? 'sky'
                                                        : 'green'
                                                }></Tag>
                                        ))}
                                    </div>
                                </StatisticsContainer>
                            )}
                        </Await>
                    </div>
                </Suspense>
            </div>
        </div>
    );
};

export default SearchedPlayerDetailsPage;
