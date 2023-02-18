import type { ReactNode } from 'react';
import NavBar from '~/ui/layout/NavBar';

const DefaultLayout = ({ children }: { children: ReactNode }) => {
    return (
        <>
            <NavBar />
            <main className={'main select-text selection:bg-fuchsia-500'}>
                <div className={'p-5'}>{children}</div>
            </main>
        </>
    );
};

export default DefaultLayout;
