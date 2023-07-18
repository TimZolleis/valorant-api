import type { ActionFunction, DataFunctionArgs } from '@vercel/remix';
import { json, redirect } from '@vercel/remix';
import { requireLoginData } from '~/utils/auth/authrequest.server';
import { RiotAuthenticationClient } from '~/utils/auth/RiotAuthenticationClient';
import { commitSession, getSession } from '~/utils/session/session.server';
import { Form, useActionData, useLoaderData, useNavigation, useTransition } from '@remix-run/react';
import base64url from 'base64url';
import { decode } from 'url-safe-base64';
import type { AuthenticationCookies } from '~/models/cookies/MultifactorCookies';

export const action: ActionFunction = async ({ request, params }) => {
    const formData = await request.formData();
    const url = new URL(request.url);
    const multifactorCode = formData.get('multifactor')?.toString();

    if (!multifactorCode) {
        return json({
            error: 'Please provide a multifactor code',
        });
    }
    const cookieString = url.searchParams.get('cookies');
    if (!cookieString) {
        return redirect('/login');
    }
    const decodedCookies: AuthenticationCookies = JSON.parse(
        Buffer.from(cookieString, 'base64').toString('utf-8')
    );
    console.log(decodedCookies);
    try {
        const user = await new RiotAuthenticationClient().authorizeWithMultifactor(
            multifactorCode,
            decodedCookies
        );
        const session = await getSession(request);
        session.set('user', user);
        session.set('reauthenticated-at', Date.now());
        return redirect('/', {
            headers: {
                'Set-Cookie': await commitSession(session),
            },
        });
    } catch (e) {
        console.log(e);
        return json({
            error: 'Authentication failed. The code has expired',
        });
    }
};

export const loader = async ({ request }: DataFunctionArgs) => {
    const url = await new URL(request.url);
    const email = url.searchParams.get('mail') || 'unknown_email';
    const cookieString = url.searchParams.get('cookies');
    if (!cookieString) {
        return redirect('/login');
    }

    return json({
        email,
    });
};

const LoginPage = () => {
    const actionData = useActionData();
    const navigation = useNavigation();
    const { email } = useLoaderData<typeof loader>();
    return (
        <Form method={'post'}>
            <div className={'w-full flex flex-col items-center py-20'}>
                <p
                    className={
                        ' font-bold  text-center text-headline-small md:text-headline-medium'
                    }>
                    Multifactor authentication
                </p>
                <p className={' text-gray-400/50 text-label-small text-center md:w-4/12 '}>
                    Please provide the 2fa code that has been sent to{' '}
                    <span className={'font-bold '}>{email}</span>
                </p>
                <div className={'mt-5 lg:w-4/12 space-y-2 '}>
                    <input
                        name={'multifactor'}
                        className={
                            'bg-transparent focus:outline-none focus:border-blue-500 placeholder: border rounded-md border-zinc-800 px-3 py-2 w-full'
                        }
                        placeholder={'Code'}
                        type='text'
                    />
                    {actionData?.error !== undefined && (
                        <div
                            className={
                                'bg-red-800/20 mt-5 ring ring-red-800 ring-1 text-center text-red-500 rounded-md px-3 py-2'
                            }>
                            {actionData?.error}
                        </div>
                    )}
                    <button
                        className={
                            'text-label-medium bg-blue-600 rounded-md flex items-center justify-center transition ease-in-out hover:bg-transparent hover:border-blue-500 hover:text-blue-500 hover:border gap-2 px-3 py-2   font-medium text-center w-full'
                        }>
                        {navigation.state === 'idle' && <p>Continue</p>}
                        {navigation.state === 'submitting' && (
                            <img
                                className={'h-8 animate animate-pulse'}
                                src='/resources/icons/ellipsis-horizontal.svg'
                                alt=''
                            />
                        )}
                    </button>
                </div>
            </div>
        </Form>
    );
};

export default LoginPage;
