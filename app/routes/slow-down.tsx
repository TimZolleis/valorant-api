import { Container } from '~/ui/container/Container';
import { DataFunctionArgs, json, redirect } from '@remix-run/node';
import { commitClientSession, getClientSession } from '~/utils/session/session.server';
import { of } from 'rxjs';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { useEffect } from 'react';

type Timer = {
    issuedAt: number;
    validUntil: number;
};

function issueTimer(offenses: number): Timer {
    const issuedAt = Date.now();
    const validUntil = issuedAt + offenses * 2000;
    return {
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
        if (timer.validUntil - Date.now() < 0) {
            session.unset('timer');
            return redirect('/', {
                headers: {
                    'Set-Cookie': await commitClientSession(session),
                },
            });
        }
        return json({ timer: timer });
    } else {
        let offenses = session.get('offenses');
        if (!offenses) {
            offenses = 1;
        }
        session.set('offenses', offenses);
        const timer = issueTimer(offenses);
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
    useEffect(() => {
        const interval = setInterval(() => {
            if (hasTimerExpired(timer)) {
                window.location.reload();
            }
        }, 1000);

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
                        {timer.validUntil - timer.issuedAt}
                    </p>
                </div>
            </Container>
        </div>
    );
};

export default SlowDownPage;
