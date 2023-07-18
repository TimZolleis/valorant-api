import type { DataFunctionArgs } from '@vercel/remix';
import { json } from '@vercel/remix';
import { prisma } from '~/utils/db/db.server';
import { getReauthenticatedUser } from '~/utils/session/reauthentication.server';
import { analyzeMatch } from '~/utils/match/match.server';

async function getRandomUser() {
    const users = await prisma.user.findMany();
    const randomIndex = Math.floor(Math.random() * users.length);
    return users[randomIndex];
}

export const loader = async ({ request }: DataFunctionArgs) => {
    const successfullyAnalyzedMatches: Awaited<ReturnType<typeof analyzeMatch>> = [];
    const failedMatches: string[] = [];
    //Get all the queued matches that have a waiting status
    const queuedMatches = await prisma.matchAnalysisSchedule
        .findMany({
            where: { status: 'QUEUED' },
        })
        .then((arr) => arr.slice(0, 2));
    //We do not analyze more than 2 matches at a time because otherwise riot limit will kick in and the function would run too long
    //Loop all through the matches, pick a random user to use the api and then store the analysis

    for (const queuedMatch of queuedMatches) {
        try {
            const randomUser = await getRandomUser();
            const reauthenticatedUser = await getReauthenticatedUser(randomUser);
            const playerPerformances = await analyzeMatch(reauthenticatedUser, queuedMatch.matchId);
            successfullyAnalyzedMatches.push(...playerPerformances);
        } catch (e) {
            console.log('Failed because of', e);
            failedMatches.push(queuedMatch.matchId);
        }
    }
    //Now that we have successfully analyzed the matches and logged the failed ones, we can store them in the database
    for (const successfullyAnalyzedMatch of successfullyAnalyzedMatches) {
        //Store the players performance
        try {
            await prisma.matchPerformance.create({
                data: {
                    ...successfullyAnalyzedMatch,
                },
            });
            // Set the queued match to status "complete"
            await prisma.matchAnalysisSchedule.update({
                where: {
                    matchId: successfullyAnalyzedMatch.matchId,
                },
                data: {
                    status: 'COMPLETE',
                },
            });
        } catch (e) {
            console.log('Error with storing player performance', e);
        }
    }
    return json({
        message: 'Successfully ran analysis on matches',
        successfullyAnalyzedMatches,
        failedMatches,
    });
};
