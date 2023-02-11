import { useMatches } from '@remix-run/react';
import { useMemo } from 'react';
import { ValorantUser } from '~/models/user/ValorantUser';

export function useMatchesData(id: string): Record<string, unknown> | undefined {
    const matchingRoutes = useMatches();
    const route = useMemo(
        () => matchingRoutes.find((route) => route.id === id),
        [matchingRoutes, id]
    );
    return route?.data;
}
export function useOptionalUser(): ValorantUser | undefined {
    const data = useMatchesData('root');
    return data?.user as ValorantUser | undefined;
}
