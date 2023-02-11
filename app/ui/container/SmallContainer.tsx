import { ReactNode } from 'react';

export const SmallContainer = ({ children }: { children: ReactNode }) => {
    return (
        <div
            className={'bg-neutral-900/50 font-inter border border-zinc-800 rounded-md p-3 w-full'}>
            {children}
        </div>
    );
};
