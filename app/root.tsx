import type { LoaderFunction, MetaFunction } from '@vercel/remix';
import { json } from '@vercel/remix';
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import styles from './styles/app.css';
import DefaultLayout from '~/ui/layout/DefaultLayout';
import { getUserFromSession } from '~/utils/session/session.server';
import { GeistProvider } from '@geist-ui/core';

export function links() {
    return [
        { rel: 'stylesheet', href: styles },

        {
            rel: 'apple-touch-icon',
            sizes: '180x180',
            href: '/favicons/apple-touch-icon.png',
        },
        {
            rel: 'icon',
            type: 'image/png',
            sizes: '32x32',
            href: '/favicons/favicon-32x32.png',
        },
        {
            rel: 'icon',
            type: 'image/png',
            sizes: '16x16',
            href: '/favicons/favicon-16x16.png',
        },
        { rel: 'manifest', href: '/favicons/site.webmanifest' },
        { rel: 'icon', href: '/favicons/favicon.ico' },
    ];
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
    return (
        <html lang='en'>
            <head>
                <Meta />
                <Links />
            </head>
            <body className={'block relative bg-[#0a0a0a]'}>
                <GeistProvider themeType={'dark'}>
                    <DefaultLayout>
                        <Outlet />
                    </DefaultLayout>
                    <ScrollRestoration />
                    <Scripts />
                    <LiveReload />
                </GeistProvider>
            </body>
        </html>
    );
}
