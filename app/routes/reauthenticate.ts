import { DataFunctionArgs, json, redirect } from '@remix-run/node';
import { commitClientSession, getClientSession, requireUser } from '~/utils/session/session.server';
import { RiotReauthenticationClient } from '~/utils/auth/RiotReauthenticationClient';

export const loader = async ({ request, params }: DataFunctionArgs) => {
    const user = await requireUser(request);
    try {
        const reauthenticatedUser = await new RiotReauthenticationClient()
            .init(user)
            .then((client) => client.reauthenticate());
        const session = await getClientSession(request);
        session.set('user', reauthenticatedUser);
        return redirect('/', {
            headers: {
                'Set-Cookie': await commitClientSession(session),
            },
        });
    } catch (e) {}
};
