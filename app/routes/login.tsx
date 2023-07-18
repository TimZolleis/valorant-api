import type { ActionFunction } from '@vercel/remix';
import { redirect } from '@vercel/remix';
import { RiotAuthenticationClient } from '~/utils/auth/RiotAuthenticationClient';
import { getSession } from '~/utils/session/session.server';
import { MultifactorAuthenticationRequiredException } from '~/exceptions/MultifactorAuthenticationRequiredException';
import { zfd } from 'zod-form-data';
import { handleActionError } from '~/utils/general-utils';
import { Input } from '~/components/ui/Input';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/Button';
import { Form, useNavigation } from '@remix-run/react';
import { Loader } from '~/components/ui/Loader';

const loginSchema = zfd.formData({
    username: zfd.text(),
    password: zfd.text(),
});

export const action: ActionFunction = async ({ request, params }) => {
    try {
        const { username, password } = loginSchema.parse(await request.formData());
        const session = await getSession(request);
        const user = await new RiotAuthenticationClient().authorize(username, password);
        session.set('user', user);
        return redirect('/');
    } catch (error) {
        if (error instanceof MultifactorAuthenticationRequiredException) {
            const cookiesToBase64 = Buffer.from(error.cookieString).toString('base64');
            return redirect(`/2fa?mail=${error.mailAddress}&cookies=${cookiesToBase64}`, {});
        }
        return handleActionError(error);
    }
};

const LoginPage = () => {
    const navigation = useNavigation();
    return (
        <>
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
                            Enter your email to sign in to your RiotGames account
                        </p>
                    </div>
                    <Form method={'post'} className={'grid gap-2 w-full'}>
                        <div className={'grid gap-2'}>
                            <Label>Username</Label>
                            <Input name={'username'} />
                        </div>
                        <div className={'grid gap-2'}>
                            <Label>Password</Label>
                            <Input type={'password'} name={'password'}></Input>
                        </div>
                        <Button>{navigation.state === 'idle' ? 'Sign in' : <Loader />}</Button>
                    </Form>
                </div>
            </div>
        </>
    );
};

export default LoginPage;
