import type { Session } from '@vercel/remix';
import { createCookieSessionStorage, json, redirect } from '@vercel/remix';
import type { ValorantUser } from '~/models/user/ValorantUser';
import type { Params } from '@remix-run/react';

if (!process.env.SECRET) {
    throw new Error('Session secret missing from ENV');
}

const { getSession, commitSession, destroySession } = createCookieSessionStorage({
    cookie: {
        name: 'gunbuddy-authentication',
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 90,
        secrets: [process.env.SECRET],
    },
});

export async function getClientSession(request: Request) {
    return await getSession(request.headers.get('Cookie'));
}

export async function getUserFromSession(request: Request): Promise<ValorantUser | undefined> {
    const session = await getClientSession(request);
    return session.get('user');
}

export async function requireUser(
    request: Request,
    verifyValidAuthentication = true,
    useApiResponse = false
) {
    const user = await getUserFromSession(request);
    const origin = new URL(request.url).pathname;
    if (!user) {
        if (useApiResponse) {
            throw json(
                {
                    error: 'Unauthorized',
                },
                {
                    status: 403,
                }
            );
        }
        throw redirect('/login');
    }
    if (verifyValidAuthentication) {
        const session = await getClientSession(request);
        const reauthenticatedAt = session.get('reauthenticated-at') / 1000;
        const currentTimeInSeconds = Date.now() / 1000;
        if (!reauthenticatedAt || currentTimeInSeconds - reauthenticatedAt > 3200) {
            throw redirect('/reauthenticate', {
                headers: {
                    'X-Remix-Redirect': origin,
                },
            });
        }
    }
    return user;
}

export async function requirePlayerUuid(request: Request) {
    const puuid = new URL(request.url).searchParams.get('puuid');
    if (!puuid) {
        throw json(
            {
                error: 'Please provide a player uuid as query param!',
            },
            400
        );
    }
    return puuid;
}

export async function requirePlayerUuidAsParam(params: Params) {
    const puuid = params.playerId;
    if (!puuid) {
        throw json(
            {
                error: 'Please provide a player uuid as param!',
            },
            400
        );
    }
    return puuid;
}

export function requireParam(param: string, params: Params) {
    const value = params[param];
    if (!value) {
        throw new Error(`Please provide the parameter ${param}`);
    }
    return value;
}

export async function commitClientSession(session: Session) {
    return await commitSession(session);
}

export async function destroyClientSession(session: Session) {
    return await destroySession(session);
}
