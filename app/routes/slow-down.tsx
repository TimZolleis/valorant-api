import { Container } from '~/ui/container/Container';
import type { DataFunctionArgs } from '@vercel/remix';
import { json, redirect } from '@vercel/remix';
import { commitClientSession, getClientSession } from '~/utils/session/session.server';
import { of } from 'rxjs';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { useEffect, useState } from 'react';
import * as crypto from 'crypto';
import { useNavigate } from 'react-router';

type Timer = {
    id: string;
    issuedAt: number;
    validUntil: number;
};

function issueTimer(offenses: number): Timer {
    const id = crypto.randomUUID();
    const issuedAt = Date.now();
    const validUntil = issuedAt + offenses * 10000;
    return {
        id,
        issuedAt,
        validUntil,
    };
}

function hasTimerExpired(timer: Timer) {
    return timer.validUntil - Date.now() < 0;
}

export const loader = async ({ request }: DataFunctionArgs) => {
    const session = await getClientSession(request);

    if (session.has('timer')) {
        const timer: Timer = session.get('timer');
        if (timer.validUntil - Date.now() <= 0) {
            session.unset('timer');
            return redirect('/', {
                headers: {
                    'Set-Cookie': await commitClientSession(session),
                },
            });
        }
    }

    if (session.has('timer')) {
        const timer: Timer = session.get('timer');
        if (timer.validUntil - Date.now() < 0) {
            session.unset('timer');
        }
        return json({ timer: timer });
    } else {
        const timer = issueTimer(1);
        session.set('timer', timer);
        return json(
            {
                timer,
            },
            {
                headers: {
                    'Set-Cookie': await commitClientSession(session),
                },
            }
        );
    }
};

const SlowDownPage = () => {
    const { timer } = useLoaderData<typeof loader>();
    const [timeRemaining, setTimeRemaining] = useState<number>(timer.validUntil - timer.issuedAt);

    useEffect(() => {
        const interval = setInterval(() => {
            if (timeRemaining <= 0) {
                window.location.reload();
            }
            setTimeRemaining(timer.validUntil - Date.now());
        }, 100);
        return () => clearInterval(interval);
    });
    return (
        <div>
            <Container>
                <div className={'flex flex-col font-inter w-full items-center text-center'}>
                    <p className={'text-white font-semibold text-title-large'}>
                        Oh boi, youre too fast!
                    </p>
                    <p className={'text-gray-300 font-light text-label-medium'}>
                        It looks like you wanna get a lot of information! Sadly Riot Games doesnt
                        like that. A timer has been issued to when you can request data again to
                        protect agains permanent blocks.
                    </p>
                    <p className={'text-white font-bold text-title-large'}>
                        {timeRemaining / 1000}
                    </p>
                </div>
            </Container>
        </div>
    );
};

export default SlowDownPage;
