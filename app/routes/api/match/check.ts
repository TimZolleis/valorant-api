import type { DataFunctionArgs } from '@vercel/remix';
import { prisma } from '~/utils/db/db.server';
import { getReauthenticatedUser } from '~/utils/session/reauthentication.server';
import { analyzeMatch } from '~/utils/match/match.server';
import { json } from '@vercel/remix';

export const loader = async ({ request }: DataFunctionArgs) => {
    // Check for queued matches
    const queuedMatchIds = await prisma.matchAnalysisSchedule.findMany();
    //For each match, run the analysis
    if (!queuedMatchIds) {
        return null;
    }
    try {
        const analyzedMatches = await Promise.all(
            queuedMatchIds.map(async (queuedMatch) => {
                const matchId = queuedMatch.matchId;
                const user = await prisma.user.findUnique({ where: { puuid: queuedMatch.puuid } });
                if (!user) {
                    throw new Error('The requested user is not available');
                }
                const reauthenticatedUser = await getReauthenticatedUser(user);
                return await analyzeMatch(reauthenticatedUser, matchId);
            })
        );
        const storedPerformances = await Promise.all(
            analyzedMatches.map(async (playerPerformances) => {
                return Promise.all(
                    playerPerformances.map((playerPerformance) => {
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
            })
        );
        return json({ storedPerformances });
    } catch (e) {
        return json({ error: e }, { status: 500 });
    }
};
