import type { LoaderFunction, MetaFunction } from '@remix-run/node';
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import styles from './styles/app.css';
import DefaultLayout from '~/ui/layout/DefaultLayout';
import { getUserFromSession } from '~/utils/session/session.server';
import { json } from '@remix-run/node';
import { ReauthenticationRequiredException } from '~/exceptions/ReauthenticationRequiredException';

export function links() {
    return [{ rel: 'stylesheet', href: styles }];
}

export const meta: MetaFunction = () => ({
    charset: 'utf-8',
    title: 'Gunbuddy',
    viewport: 'width=device-width,initial-scale=1',
});

export const loader: LoaderFunction = async ({ request }) => {
    const user = await getUserFromSession(request);
    return json({
        user,
    });
};

export default function App() {
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
