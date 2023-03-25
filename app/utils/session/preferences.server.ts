import type { Session } from '@vercel/remix';
import { createCookieSessionStorage } from '@vercel/remix';

if (!process.env.SECRET) {
    throw new Error('Session secret missing from ENV');
}
const { getSession, commitSession, destroySession } = createCookieSessionStorage({
    cookie: {
        name: 'gunbuddy-preferences',
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 90,
        secrets: [process.env.SECRET],
    },
});

export async function getPreferencesSession(request: Request) {
    return await getSession(request.headers.get('Cookie'));
}

export async function commitPreferencesSession(session: Session) {
    return await commitSession(session);
}

export async function destroyPreferencesSession(session: Session) {
    return await destroySession(session);
}
