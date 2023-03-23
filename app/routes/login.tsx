import type { ActionFunction } from '@vercel/remix';
import { json, redirect } from '@vercel/remix';
import { requireLoginData } from '~/utils/auth/authrequest.server';
import { v4 as uuidv4 } from 'uuid';
import { RiotAuthenticationClient } from '~/utils/auth/RiotAuthenticationClient';
import { commitClientSession, getClientSession } from '~/utils/session/session.server';
import { Form, useActionData, useTransition } from '@remix-run/react';
import { MultifactorAuthenticationRequiredException } from '~/exceptions/MultifactorAuthenticationRequiredException';
import base64url from 'base64url';
import { encode } from 'url-safe-base64';

export const action: ActionFunction = async ({ request, params }) => {
    const formData = await request.formData();
    const username = formData.get('username')?.toString();
    const password = formData.get('password')?.toString();
    if (!username) {
        return json({
            error: 'Please provide a username',
        });
    }
    if (!password) {
        return json({
            error: 'Please provide a password',
        });
    }
    try {
        const session = await getClientSession(request);
        const user = await new RiotAuthenticationClient().authorize(username, password);
        session.set('user', user);
        return redirect('/', {
            headers: {
                'Set-Cookie': await commitClientSession(session),
            },
        });
    } catch (e) {
        if (e instanceof MultifactorAuthenticationRequiredException) {
            const base64cookies = Buffer.from(e.cookieString).toString('base64');
            throw redirect(`/2fa?mail=${e.mailAddress}&cookies=${base64cookies}`, {});
        }

        return json({
            error: 'Authentication failed. Maybe wrong credentials?',
        });
    }
};

const LoginPage = () => {
    const actionData = useActionData();
    const transition = useTransition();
    return (
        <Form method={'post'}>
            <div className={'w-full flex flex-col items-center py-20'}>
                <p
                    className={
                        'text-white font-bold font-inter text-center text-headline-small md:text-headline-medium'
                    }>
                    Log in to GunBuddy
                </p>
                <p
                    className={
                        'font-inter text-gray-400/50 text-label-small text-center md:w-4/12 '
                    }>
                    Please login with your Riot games credentials in order to use this service. Your
                    sensitive data is not saved.
                </p>
                <div className={'mt-5 lg:w-4/12 space-y-2 text-white'}>
                    <input
                        name={'username'}
                        className={
                            'bg-transparent focus:outline-none focus:border-blue-500 placeholder:font-inter border rounded-md border-zinc-800 px-3 py-2 w-full'
                        }
                        placeholder={'Riot Username'}
                        type='text'
                    />
                    <input
                        name={'password'}
                        className={
                            'bg-transparent focus:outline-none focus:border-blue-500 placeholder:font-inter border rounded-md border-zinc-800 px-3 py-2 w-full'
                        }
                        placeholder={'Password'}
                        type='password'
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
                            'text-label-medium bg-blue-600 rounded-md flex items-center justify-center transition ease-in-out hover:bg-transparent hover:border-blue-500 hover:text-blue-500 hover:border gap-2 px-3 py-2 text-white font-inter font-medium text-center w-full'
                        }>
                        {transition.state === 'idle' && <p>Continue</p>}
                        {transition.state === 'submitting' && (
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
