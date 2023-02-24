import type { LoaderFunction, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
    Links,
    LiveReload,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
    useMatches,
    useTransition,
} from '@remix-run/react';
import styles from './styles/app.css';
import DefaultLayout from '~/ui/layout/DefaultLayout';
import { getUserFromSession } from '~/utils/session/session.server';

export function links() {
    return [{ rel: 'stylesheet', href: styles }];
}

export const meta: MetaFunction = () => ({
    charset: 'utf-8',
    title: 'GunBuddy',
    viewport: 'width=device-width,initial-scale=1',
});

export const loader: LoaderFunction = async ({ request }) => {
    const user = await getUserFromSession(request);
    return json({
        user,
    });
};

export default function App() {
    const { user } = useLoaderData();
    const transition = useTransition();

    return (
        <html lang='en'>
            <head>
                <Meta />
                <Links />
            </head>
            <body>
                <DefaultLayout>
                    <Outlet />
                </DefaultLayout>
                <ScrollRestoration />
                <Scripts />
                <LiveReload />
            </body>
        </html>
    );
}
