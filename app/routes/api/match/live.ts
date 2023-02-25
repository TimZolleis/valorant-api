import type { DataFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireUser } from '~/utils/session/session.server';
import { getRunningCoregameMatch, getRunningPregameMatch } from '~/utils/match/livematch.server';
import { NoPregameFoundException } from '~/exceptions/NoPregameFoundException';
import { NoCoregameFoundException } from '~/exceptions/NoCoregameFoundException';
import type { ValorantUser } from '~/models/user/ValorantUser';
import { PREGAME_MATCH } from '~/test/TEST_PREGAME';

export type LiveMatchRoute = Awaited<LoaderData>;
export type GameStatus = 'pregame' | 'coregame' | 'not in game';
type LoaderData = {
    status: GameStatus;
};

async function detectGame(user: ValorantUser, puuid: string) {
    try {
        const pregame = await getRunningPregameMatch(user, user.userData.puuid);
        return json<LoaderData>({
            status: 'pregame',
        });
    } catch (e) {
        if (!(e instanceof NoPregameFoundException)) {
            throw e;
        }
    }
    try {
        const coregame = await getRunningCoregameMatch(user, user.userData.puuid);
        return json<LoaderData>({
            status: 'coregame',
        });
    } catch (e) {
        if (!(e instanceof NoCoregameFoundException)) {
            throw e;
        }
    }
    return json<LoaderData>({
        status: 'pregame',
    });
}
export const loader = async ({ request, params }: DataFunctionArgs) => {
    const user = await requireUser(request);
    return await detectGame(user, user.userData.puuid);
};
