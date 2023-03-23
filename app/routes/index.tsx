import type { LoaderFunction } from '@vercel/remix';
import { redirect } from '@vercel/remix';
import { requireUser } from '~/utils/session/session.server';
import { Outlet } from '@remix-run/react';

export const loader: LoaderFunction = async ({ request }) => {
    const user = await requireUser(request);
    return redirect('/dashboard/history');
};
const IndexPage = () => {
    return (
        <>
            <Outlet />
        </>
    );
};

export default IndexPage;
