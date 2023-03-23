import type { ActionFunction } from '@vercel/remix';
import { json, redirect } from '@vercel/remix';
import { commitClientSession, getClientSession, requireUser } from '~/utils/session/session.server';
import { RiotReauthenticationClient } from '~/utils/auth/RiotReauthenticationClient';

export const loader: ActionFunction = async ({ request, params }) => {
    const origin = await request.headers.get('x-redirected-from');
    const user = await requireUser(request);
    try {
        const reauthenticatedUser = await new RiotReauthenticationClient()
            .init(user)
            .then((client) => client.reauthenticate());
        const session = await getClientSession(request);
        session.set('user', reauthenticatedUser);
        return json(
            { user: reauthenticatedUser },
            {
                headers: {
                    'Set-Cookie': await commitClientSession(session),
                },
            }
        );
    } catch (e) {
        throw json(
            {
                error: 'Reauthentication failed. Please try to login again',
            },
            {
                status: 403,
            }
        );
    }
};
