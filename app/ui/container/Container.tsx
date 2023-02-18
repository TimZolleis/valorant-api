import { ReactNode } from 'react';

export const Container = ({ children }: { children: ReactNode }) => {
    return <div className={'rounded-lg px-5 pt-3 pb-5 border border-zinc-800'}>{children}</div>;
};
