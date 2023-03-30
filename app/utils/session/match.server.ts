import type { Session } from '@vercel/remix';
import { createCookieSessionStorage } from '@vercel/remix';

if (!process.env.SECRET) {
    throw new Error('Session secret missing from ENV');
}
const { getSession, commitSession, destroySession } = createCookieSessionStorage({
    cookie: {
        name: 'gunbuddy-matches',
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 90,
        secrets: [process.env.SECRET],
    },
});

export async function getMatchSession(request: Request) {
    return await getSession(request.headers.get('Cookie'));
}

export async function commitMatchSession(session: Session) {
    return await commitSession(session);
}

export async function destroyMatchSession(session: Session) {
    return await destroySession(session);
}

export async function getCurrentMatch(request: Request) {
    return await getMatchSession(request).then((session) => session.get('current-match'));
}

export async function setCurrentMatch(request: Request, matchId: string) {
    const session = await getMatchSession(request);
    session.set('current-match', matchId);
    return session;
}

export async function unsetCurrentMatch(request: Request) {
    const session = await getMatchSession(request);
    session.unset('current-match');
    return session;
}

export async function getLastMatch(request: Request) {
    const session = await getMatchSession(request);
    return session.get('last-match');
}

export async function setLastMatch(request: Request, matchId: string) {
    const session = await getMatchSession(request);
    session.set('last-match', matchId);
    return session;
}

export async function unsetLastMatch(request: Request) {
    const session = await getMatchSession(request);
    session.unset('last-match');
    return session;
}
