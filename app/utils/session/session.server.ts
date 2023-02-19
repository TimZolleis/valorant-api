import { v4 as uuidv4 } from 'uuid';
import { createCookieSessionStorage, json, redirect, Session } from '@remix-run/node';
import { ValorantUser } from '~/models/user/ValorantUser';
import { Params } from '@remix-run/react';

if (!process.env.SECRET) {
    throw new Error('Session secret missing from ENV');
}

const { getSession, commitSession, destroySession } = createCookieSessionStorage({
    cookie: {
        name: '__valorant-api-session',
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 24 * 90,
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

export async function requireUser(request: Request) {
    const user = await getUserFromSession(request);
    if (!user) {
        throw json(
            {
                error: 'Unauthorized',
            },
            {
                status: 403,
            }
        );
    }
    return user;
}

export async function requireFrontendUser(request: Request) {
    try {
        return await requireUser(request);
    } catch (e) {
        throw redirect('/login');
    }
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

export async function commitClientSession(session: Session) {
    return await commitSession(session);
}
