import type { ReactNode } from 'react';

export const SmallContainer = ({ children }: { children: ReactNode }) => {
    return (
        <div
            className={
                'bg-black  border border-zinc-800 rounded-md p-3 w-full transition ease-in-out delay-150 duration-300'
            }>
            {children}
        </div>
    );
};
