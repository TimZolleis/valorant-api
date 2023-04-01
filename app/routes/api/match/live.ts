import type { DataFunctionArgs } from '@vercel/remix';
import { json } from '@vercel/remix';
import { requireUser } from '~/utils/session/session.server';
import { getRunningCoregameMatch, getRunningPregameMatch } from '~/utils/match/livematch.server';
import { NoPregameFoundException } from '~/exceptions/NoPregameFoundException';
import { NoCoregameFoundException } from '~/exceptions/NoCoregameFoundException';
import type { ValorantUser } from '~/models/user/ValorantUser';
import { get } from '@vercel/edge-config';
import type { ValorantPregameMatch } from '~/models/valorant/match/ValorantPregameMatch';
import type { ValorantCoregameMatch } from '~/models/valorant/match/ValorantCoregameMatch';
import { PREGAME_MATCH } from '~/test/TEST_PREGAME';
import { TEST_COREGAME } from '~/test/TEST_COREGAME';
import { DateTime } from 'luxon';
import { prisma } from '~/utils/db/db.server';

export type GameStatus = 'pregame' | 'coregame' | 'no-game';
export type LiveMatchRoute = Awaited<ReturnType<typeof loader>>;

export async function detectGame(
    user: ValorantUser,
    puuid: string
): Promise<{ status: GameStatus; match: ValorantPregameMatch | ValorantCoregameMatch | null }> {
    try {
        const mockPregame = await get('mockPregame');
        const pregame = mockPregame
            ? PREGAME_MATCH
            : await getRunningPregameMatch(user, user.userData.puuid);
        return {
            status: 'pregame',
            match: pregame,
        };
    } catch (e) {
        if (!(e instanceof NoPregameFoundException)) {
            throw e;
        }
    }
    try {
        const mockCoregame = await get('mockCoregame');
        const coregame = mockCoregame
            ? TEST_COREGAME
            : await getRunningCoregameMatch(user, user.userData.puuid);
        return {
            status: 'coregame',
            match: coregame,
        };
    } catch (e) {
        if (!(e instanceof NoCoregameFoundException)) {
            throw e;
        }
    }
    return {
        status: 'no-game',
        match: null,
    };
}

function isPregame(
    match: ValorantPregameMatch | ValorantCoregameMatch
): match is ValorantPregameMatch {
    return 'ID' in match ? match.ID !== undefined : false;
}

function isCoregame(
    match: ValorantPregameMatch | ValorantCoregameMatch
): match is ValorantCoregameMatch {
    return 'MatchID' in match ? match.MatchID !== undefined : false;
}

export const loader = async ({ request, params }: DataFunctionArgs) => {
    const user = await requireUser(request);
    const { status, match } = await detectGame(user, user.userData.puuid);
    if (status === 'coregame' && match && isCoregame(match)) {
        const matchStartTime = DateTime.fromMillis(match.Version);
        await prisma.matchAnalysisSchedule.upsert({
            where: {
                matchId: match.MatchID,
            },
            update: {},
            create: {
                matchId: match.MatchID,
                matchStartTime: matchStartTime.toJSDate(),
                puuid: user.userData.puuid,
            },
        });
    }
    return json({ status });
};
