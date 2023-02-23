import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { requireUser } from '~/utils/session/session.server';
import { Outlet } from '@remix-run/react';

export const loader: LoaderFunction = async ({ request }) => {
    const user = await requireUser(request);
    return redirect('/dashboard/history');
};
const IndexPage = ({ error }: { error: any }) => {
    return (
        <>
            <Outlet />
        </>
    );
};
