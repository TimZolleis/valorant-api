import { DataFunctionArgs, redirect } from '@remix-run/node';
import { destroyClientSession, getClientSession } from '~/utils/session/session.server';

export const loader = async ({ request, params }: DataFunctionArgs) => {
    const session = await getClientSession(request);
    return redirect('/login', {
        headers: {
            'Set-Cookie': await destroyClientSession(session),
        },
    });
};
