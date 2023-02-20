import { FetcherWithComponents, useFetcher } from '@remix-run/react';
import { useEffect, useState } from 'react';

export function useFetcherData<T>(route: string) {
    const [fetcherData, setFetcherData] = useState<T | undefined>(undefined);
    const fetcher = useFetcher() as unknown as FetcherWithComponents<T>;
    useEffect(() => {
        if (fetcher.type === 'init') {
            try {
                fetcher.load(route);
            } catch (e) {
                console.log(e);
            }
        }
        if (fetcher.data) {
            setFetcherData(fetcher.data);
        }
    }, [fetcher]);
    return fetcherData;
}
