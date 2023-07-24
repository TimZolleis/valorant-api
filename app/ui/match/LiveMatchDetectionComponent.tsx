import type { FetcherWithComponents } from '@remix-run/react';
import { useFetcher } from '@remix-run/react';
import { useEffect, useState } from 'react';
import type { loader } from '~/routes/api.match.live';
import { useNavigate } from 'react-router';
import { Button } from '~/components/ui/Button';
import { Loader } from '~/components/ui/Loader';
import { RefreshCw } from 'lucide-react';

function checkForGame(fetcher: FetcherWithComponents<unknown>) {
    fetcher.load('/api/match/live');
}

export const LiveMatchDetectionComponent = () => {
    const fetcher = useFetcher<typeof loader>();
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
        if (fetcher.data?.status === 'pregame' && !window.location.pathname.includes('/live')) {
            return navigate('/live');
        }
        if (fetcher.data?.status === 'coregame' && !window.location.pathname.includes('/live')) {
            return navigate('/live');
        }
    }, [fetcher.data?.status]);

    return (
        <>
            <Button size={'sm'} onClick={() => checkForGame(fetcher)}>
                {isLoading && <Loader size={20} />}
                {!isLoading && <RefreshCw className={'h-4 w-4'} />}
            </Button>
        </>
    );
};
