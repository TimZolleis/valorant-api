import { json } from '@remix-run/node';

type LoginRequest = {
    username?: string;
    password?: string;
};

export async function requireLoginData(request: Request) {
    const body = (await request.json()) as LoginRequest;
    const username = body.username;
    const password = body.password;
    if (!username) {
        throw json(
            {
                error: 'Please provide a username',
            },
            {
                status: 400,
            }
        );
    }
    if (!password) {
        throw json(
            {
                error: 'Please provide a password',
            },
            {
                status: 400,
            }
        );
    }

    return { username, password };
}
