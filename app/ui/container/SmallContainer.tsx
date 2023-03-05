import type { ReactNode } from 'react';

export const SmallContainer = ({ children }: { children: ReactNode }) => {
    return (
        <div
            className={
                'bg-gradient-to-tl from-neutral-900/50 to-black font-inter border border-zinc-800 rounded-md p-3 w-full hover:bg-neutral-900 transition ease-in-out delay-150 duration-300'
            }>
            {children}
        </div>
    );
};
