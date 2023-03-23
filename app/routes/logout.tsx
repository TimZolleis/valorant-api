import type { DataFunctionArgs } from '@vercel/remix';
import { redirect } from '@vercel/remix';
import { destroyClientSession, getClientSession } from '~/utils/session/session.server';

export const loader = async ({ request, params }: DataFunctionArgs) => {
    const session = await getClientSession(request);
    return redirect('/login', {
        headers: {
            'Set-Cookie': await destroyClientSession(session),
        },
    });
};
