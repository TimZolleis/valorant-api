import type { DataFunctionArgs } from '@vercel/remix';
import { prisma } from '~/utils/db/db.server';
import { getReauthenticatedUser } from '~/utils/session/reauthentication.server';
import { analyzeMatch } from '~/utils/match/match.server';
import { json } from '@vercel/remix';
import { DateTime } from 'luxon';

export const loader = async ({ request }: DataFunctionArgs) => {
    // Check for queued matches
    const queuedMatchIds = await prisma.matchAnalysisSchedule.findMany();
    //filter for matches that are not completed yet
    const filteredMatchIds = queuedMatchIds.filter((matchID) => {
        const matchStartTimeDiff = DateTime.now().diff(
            DateTime.fromJSDate(matchID.matchStartTime),
            'minutes'
        );
        return matchStartTimeDiff.get('minutes') > 20;
    });
    const successfulMatches: Awaited<ReturnType<typeof analyzeMatch>> = [];
    const failedMatches: string[] = [];

    try {
        await Promise.all(
            filteredMatchIds.map(async (queuedMatch) => {
                try {
                    const matchId = queuedMatch.matchId;
                    const user = await prisma.user.findUnique({
                        where: { puuid: queuedMatch.puuid },
                    });
                    if (!user) {
                        throw new Error('The requested user is not available');
                    }
                    const reauthenticatedUser = await getReauthenticatedUser(user);
                    const playerPerformances = await analyzeMatch(reauthenticatedUser, matchId);
                    successfulMatches.push(...playerPerformances);
                } catch (e) {
                    failedMatches.push(queuedMatch.matchId);
                }
            })
        );
        const storedPerformances = await Promise.all(
            successfulMatches.map(async (playerPerformance) => {
                try {
                    await prisma.matchAnalysisSchedule.delete({
                        where: {
                            matchId: playerPerformance.matchId,
                        },
                    });
                } catch (e) {}
                return prisma.matchPerformance.upsert({
                    where: {
                        puuid_matchId: {
                            puuid: playerPerformance.puuid,
                            matchId: playerPerformance.matchId,
                        },
                    },
                    update: {},
                    create: { ...playerPerformance },
                });
            })
        );
        return json({ storedPerformances, failedMatches });
    } catch (e) {
        return json({ error: e }, { status: 500 });
    }
};
