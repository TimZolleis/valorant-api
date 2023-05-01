import type { DataFunctionArgs } from '@vercel/remix';
import { defer } from '@vercel/remix';
import { prisma } from '~/utils/db/db.server';
import { DateTime } from 'luxon';
import { requireUser } from '~/utils/session/session.server';
import { useLoaderData } from '@remix-run/react';
import type { MatchPerformance } from '.prisma/client';
import { AreaChart, BarChart, LineChart } from '@tremor/react';
import { Container } from '~/ui/container/Container';
import { getCharacterByUUid } from '~/utils/match/match.server';
import type { ValorantApiCharacter } from '~/models/valorant-api/ValorantApiCharacter';

interface MatchPerformanceWithCharacter extends MatchPerformance {
    character: ValorantApiCharacter | null;
}

function getLocaleDate(date: Date) {
    return DateTime.fromJSDate(date).setLocale('de-De').toLocaleString(DateTime.DATETIME_MED);
}

function getChartData(dailyMatches: MatchPerformanceWithCharacter[]) {
    const sortedMatches = dailyMatches.sort((a, b) => {
        return a.matchStartTime.getTime() - b.matchStartTime.getTime();
    });
    const scoreChartData = sortedMatches.map((match) => {
        return {
            matchStartTime: getLocaleDate(match.matchStartTime),
            character: match.character,
            score: match.score,
        };
    });
    const kdaChartData = sortedMatches.map((match) => {
        return {
            kills: match.kills,
            deaths: match.deaths,
            assists: match.assists,
            matchStartTime: getLocaleDate(match.matchStartTime),
        };
    });
    const accuracyChartData = sortedMatches.map((match) => {
        return {
            headShots: match.headShots,
            bodyShots: match.bodyShots,
            legShots: match.legShots,
            matchStartTime: getLocaleDate(match.matchStartTime),
        };
    });

    return { scoreChartData, kdaChartData, accuracyChartData };
}

export const loader = async ({ request, params }: DataFunctionArgs) => {
    const user = await requireUser(request);
    const dailyMatches = await prisma.matchPerformance.findMany({
        where: {
            puuid: user.userData.puuid,
            matchStartTime: {
                gte: DateTime.now().startOf('day').toJSDate(),
                lt: DateTime.now().endOf('day').toJSDate(),
            },
        },
    });
    const matchesWithCharacter = await Promise.all(
        dailyMatches.map(async (match) => {
            const character = await getCharacterByUUid(match.characterUuid);
            return { ...match, character };
        })
    );

    return defer({ matchesWithCharacter });
};
const InsightPage = () => {
    const { matchesWithCharacter } = useLoaderData<typeof loader>();
    const matches = matchesWithCharacter.map((match) => {
        return {
            ...match,
            matchStartTime: new Date(match.matchStartTime),
        };
    });
    const { scoreChartData, kdaChartData, accuracyChartData } = getChartData(matches);
    return (
        <main>
            <p className={'text-headline-medium'}>Daily Insights</p>
            <div className={'mt-2'}>
                <Container className={'bg-black'}>
                    <div className={'grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3'}>
                        <span>
                            <p>Combat score</p>
                            <BarChart
                                data={scoreChartData}
                                colors={['indigo']}
                                categories={['score']}
                                index={'matchStartTime'}></BarChart>
                        </span>
                        <span>
                            <p>KDA</p>
                            <AreaChart
                                data={kdaChartData}
                                colors={['green', 'red', 'yellow']}
                                categories={['kills', 'deaths', 'assists']}
                                index={'matchStartTime'}></AreaChart>
                        </span>
                        <span>
                            <p>Accuracy</p>
                            <LineChart
                                data={accuracyChartData}
                                colors={['amber', 'teal', 'fuchsia']}
                                categories={['headShots', 'bodyShots', 'legShots']}
                                index={'matchStartTime'}></LineChart>
                        </span>
                    </div>
                </Container>
            </div>
        </main>
    );
};

export default InsightPage;
