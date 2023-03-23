import type { DataFunctionArgs } from '@vercel/remix';
import { json } from '@vercel/remix';
import { requireUser } from '~/utils/session/session.server';
import { getRunningCoregameMatch, getRunningPregameMatch } from '~/utils/match/livematch.server';
import { NoPregameFoundException } from '~/exceptions/NoPregameFoundException';
import { NoCoregameFoundException } from '~/exceptions/NoCoregameFoundException';
import type { ValorantUser } from '~/models/user/ValorantUser';
import { get } from '@vercel/edge-config';

export type LiveMatchRoute = Awaited<LoaderData>;
export type GameStatus = 'pregame' | 'coregame' | 'not in game';
type LoaderData = {
    status: GameStatus;
};

async function detectGame(user: ValorantUser, puuid: string) {
    try {
        const mockPregame = await get('mockPregame');
        const pregame = mockPregame
            ? true
            : await getRunningPregameMatch(user, user.userData.puuid);
        return json<LoaderData>({
            status: 'pregame',
        });
    } catch (e) {
        if (!(e instanceof NoPregameFoundException)) {
            throw e;
        }
    }
    try {
        const mockCoregame = await get('mockCoregame');
        const coregame = mockCoregame
            ? true
            : await getRunningCoregameMatch(user, user.userData.puuid);
        return json<LoaderData>({
            status: 'coregame',
        });
    } catch (e) {
        if (!(e instanceof NoCoregameFoundException)) {
            throw e;
        }
    }
    return json<LoaderData>({
        status: 'not in game',
    });
}

export const loader = async ({ request, params }: DataFunctionArgs) => {
    const user = await requireUser(request);
    return await detectGame(user, user.userData.puuid);
};
