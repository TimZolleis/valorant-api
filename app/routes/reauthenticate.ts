import type { DataFunctionArgs } from '@vercel/remix';
import { redirect } from '@vercel/remix';
import {
    commitSession,
    destroySession,
    getSession,
    requireUser,
} from '~/utils/session/session.server';
import { RiotReauthenticationClient } from '~/utils/auth/RiotReauthenticationClient';
import { updateUser } from '~/utils/session/reauthentication.server';
export const loader = async ({ request }: DataFunctionArgs) => {
    const user = await requireUser(request, false);
    const session = await getSession(request);
    const origin = request.headers.get('X-Remix-Redirect');
    try {
        const reauthenticatedUser = await new RiotReauthenticationClient()
            .init(user)
            .then((client) => client.reauthenticate());

        updateUser(reauthenticatedUser).then(() => console.log('User updated'));
        session.set('user', reauthenticatedUser);
        session.set('reauthenticated-at', Date.now());
        return redirect(origin ? origin : '/', {
            headers: {
                'Set-Cookie': await commitSession(session),
            },
        });
    } catch (e) {
        console.log(e);
        return redirect('/login', {
            headers: {
                'Set-Cookie': await destroySession(session),
            },
        });
    }
};
