//This endpoint checks the match history of each registered user against the queue and the analyzed matches and decides if there are new matches to analyze
//This only regards competitive matches since unrated or deathmatch would screw with the statistics that are only important for competitive play
import type { DataFunctionArgs } from '@vercel/remix';
import { json } from '@vercel/remix';
import { prisma } from '~/utils/db/db.server';
import { getReauthenticatedUser } from '~/utils/session/reauthentication.server';
import type { ValorantUser } from '~/models/user/ValorantUser';
import { RiotRequest } from '~/models/Request';
import { endpoints } from '~/config/endpoints';
import { RiotGamesApiClient } from '~/utils/riot/RiotGamesApiClient';
import type { ValorantMatchHistory } from '~/models/valorant/match/ValorantMatchHistory';
import { DateTime } from 'luxon';

async function getCompetitiveMatches(user: ValorantUser) {
    const request = new RiotRequest(user.userData.region).buildBaseUrl(
        endpoints.match.history(user.userData.puuid)
    );
    return await new RiotGamesApiClient(user.accessToken, user.entitlement)
        .getCached<ValorantMatchHistory>(
            request,
            {
                key: 'competitive-match-history',
                expiration: 300,
            },
            {
                params: {
                    queue: 'competitive',
                },
            }
        )
        .then((res) => res.History);
}

export const loader = async ({ request }: DataFunctionArgs) => {
    const users = await prisma.user.findMany();
    const reauthenticatedUsers = await Promise.all(
        users.map((user) => {
            return getReauthenticatedUser(user);
        })
    );
    //Now that we have the reauthenticated users, we can check the match history for each of them
    const matches = await Promise.all(
        reauthenticatedUsers.map(async (user) => {
            return await getCompetitiveMatches(user);
        })
    ).then((arr) => arr.flat());
    //Now that we have all the matches, we can filter out the duplicates
    const filteredMatches = await Promise.all(
        matches.filter(
            (match, index, array) => index === array.findIndex((m) => m.MatchID === match.MatchID)
        )
    );
    //The filtered matches will now be queued - we upsert here, so we do not add matches that do already exist in the queue
    const queuedMatches = await Promise.all(
        filteredMatches.map((match) => {
            return prisma.matchAnalysisSchedule.upsert({
                where: {
                    matchId: match.MatchID,
                },
                create: {
                    matchId: match.MatchID,
                    matchStartTime: DateTime.fromMillis(match.GameStartTime).toJSDate(),
                    status: 'QUEUED',
                },
                update: {},
            });
        })
    );
    return json({ message: 'Checked for new matches to be queued', queuedMatches });
};
