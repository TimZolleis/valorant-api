import type { FetcherWithComponents } from '@remix-run/react';
import { useFetcher } from '@remix-run/react';
import { useEffect, useState } from 'react';
import type { LiveMatchRoute } from '~/routes/api/match/live';
import { useNavigate } from 'react-router';
import { Loading } from '@geist-ui/core';

function checkForGame(fetcher: FetcherWithComponents<LiveMatchRoute>) {
    fetcher.load('/api/match/live');
}

export const LiveMatchDetectionComponent = () => {
    const fetcher = useFetcher<LiveMatchRoute>();
    const [remainingTime, setRemainingTime] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        const interval = setInterval(() => {
            if (remainingTime > 0) {
                setRemainingTime(remainingTime - 1);
            } else {
                checkForGame(fetcher);
                setRemainingTime(10);
            }
        }, 1000);
        return () => clearInterval(interval);
    });
    useEffect(() => {
        if (fetcher.state === 'loading' || fetcher.state === 'submitting') {
            setIsLoading(true);
            setTimeout(() => setIsLoading(false), 1000);
        }
    }, [fetcher.state]);

    useEffect(() => {
        if (
            fetcher.data?.status === 'pregame' &&
            window.location.pathname !== '/dashboard/live/pregame'
        ) {
            return navigate('/dashboard/live/pregame');
        }
        if (
            fetcher.data?.status === 'coregame' &&
            window.location.pathname !== '/dashboard/live/coregame'
        ) {
            return navigate('/dashboard/live/coregame');
        }
    }, [fetcher.data?.status]);

    return (
        <>
            <button
                onClick={() => checkForGame(fetcher)}
                className={
                    'px-3 h-10 flex items-center gap-1 select-none rounded-md py-2 bg-white font-inter active:scale-95 transition ease-in-out'
                }>
                {isLoading && (
                    <div className={'w-10 flex items-center'}>
                        <Loading color={'#000000'} type='error' />
                    </div>
                )}
                {!isLoading && <p className={'text-sm'}>Check for live game</p>}
            </button>
        </>
    );
};
