import type { DataFunctionArgs } from '@vercel/remix';
import { redirect } from '@vercel/remix';
import { destroySession, getSession } from '~/utils/session/session.server';

export const loader = async ({ request, params }: DataFunctionArgs) => {
    const session = await getSession(request);
    return redirect('/login', {
        headers: {
            'Set-Cookie': await destroySession(session),
        },
    });
};
