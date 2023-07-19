import type { ReactNode } from 'react';
import NavBar from '~/ui/layout/NavBar';
import { useNavigation } from '@remix-run/react';
import { Loading } from '@geist-ui/core';

const DefaultLayout = ({ children }: { children: ReactNode }) => {
    const navigation = useNavigation();
    console.log(navigation.state);
    return (
        <>
            <div className={'relative'}>
                <div>
                    <NavBar />
                </div>
                <main className={`select-text min-h-full selection:bg-fuchsia-500`}>
                    <div className={'p-5 md:px-10'}>{children}</div>
                </main>
            </div>
        </>
    );
};

export default DefaultLayout;
