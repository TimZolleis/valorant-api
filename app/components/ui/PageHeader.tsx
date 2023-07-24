import type { ReactNode } from 'react';

export const PageHeader = ({ children }: { children: ReactNode }) => {
    return <h1 className={'font-bold text-3xl'}>{children}</h1>;
};
