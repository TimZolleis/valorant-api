import type { ActionFunction, DataFunctionArgs } from '@vercel/remix';
import { json, redirect } from '@vercel/remix';
import { RiotAuthenticationClient } from '~/utils/auth/RiotAuthenticationClient';
import { commitSession, getSession } from '~/utils/session/session.server';
import { Form, Link, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import type { AuthenticationCookies } from '~/models/cookies/MultifactorCookies';
import { Label } from '~/components/ui/Label';
import { Input } from '~/components/ui/Input';
import { Button } from '~/components/ui/Button';
import { Loader } from '~/components/ui/Loader';
import { zfd } from 'zod-form-data';
import {
    getSafeISOString,
    handleActionError,
    raise,
    transformValidationErrors,
} from '~/utils/general-utils';
import { DateTime } from 'luxon';
import type { ActionDataWithValidationErrors } from '~/models/general-types';
import type { z } from 'zod';

const multifactorSchema = zfd.formData({
    code: zfd.text(),
});

export const action: ActionFunction = async ({ request, params }) => {
    const url = new URL(request.url);
    try {
        const cookieString = url.searchParams.get('cookies') ?? raise('Invalid URL');
        const { code } = multifactorSchema.parse(await request.formData());
        const cookies: AuthenticationCookies = JSON.parse(
            Buffer.from(cookieString, 'base64').toString('utf-8')
        );
        const user = await new RiotAuthenticationClient().authorizeWithMultifactor(code, cookies);
        const session = await getSession(request);
        session.set('user', user);
        session.set('reauthenticated-at', getSafeISOString(DateTime.now()));
        return redirect('/', {
            headers: {
                'Set-Cookie': await commitSession(session),
            },
        });
    } catch (error) {
        return handleActionError(error);
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
    const navigation = useNavigation();
    const { email } = useLoaderData<typeof loader>();
    const actionData =
        useActionData<ActionDataWithValidationErrors<z.infer<typeof multifactorSchema>>>();
    const transformedErrors = actionData?.formValidationErrors
        ? transformValidationErrors(actionData.formValidationErrors)
        : undefined;

    return (
        <div className='container flex h-screen w-screen flex-col items-center justify-center'>
            <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
                <div className='flex flex-col space-y-2 text-center'>
                    <div className={'flex justify-center'}>
                        <img
                            className={'h-24 w-24'}
                            src='/favicons/android-chrome-256x256.png'
                            alt=''
                        />
                    </div>
                    <h1 className='text-2xl font-semibold tracking-tight'>Welcome back</h1>
                    <p className='text-sm text-muted-foreground'>
                        Please provide the 2fa code that has been sent to{' '}
                        <span className={'font-bold '}>{email}</span>
                    </p>
                </div>
                <Form method={'post'} className={'grid gap-2 w-full'}>
                    <div className={'grid gap-2'}>
                        <Label>Code</Label>
                        <Input name={'code'} />
                        <p className={'text-muted-foreground text-xs'}>
                            {transformedErrors?.code || actionData?.error}
                        </p>
                    </div>
                    <Button>{navigation.state === 'idle' ? 'Sign in' : <Loader />}</Button>
                </Form>
                <p className='px-8 text-center text-sm text-muted-foreground'>
                    <Link to='/login' className='hover:text-brand underline underline-offset-4'>
                        Back to login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
