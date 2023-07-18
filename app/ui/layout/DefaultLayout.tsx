import type { ReactNode } from 'react';
import NavBar from '~/ui/layout/NavBar';
import { useNavigation } from '@remix-run/react';
import { Loading } from '@geist-ui/core';

const DefaultLayout = ({ children }: { children: ReactNode }) => {
    const navigation = useNavigation();
    return (
        <>
            <div className={'relative'}>
                <div>
                    <NavBar />
                </div>
                <main className={`select-text min-h-full selection:bg-fuchsia-500`}>
                    {navigation.state === 'loading' && <LoadingSpinner />}
                    <div className={'p-5 md:px-10'}>{children}</div>
                </main>
            </div>
        </>
    );
};

const LoadingSpinner = () => {
    return (
        <div
            className={
                'bg-opacity-40 p-3 z-50 fixed lg:px-32 left-0 top-0 right-0 bottom-0 flex flex-col items-center justify-center'
            }>
            <Loading className={'w-20'} spaceRatio={1.5} color={'#FFFFFF'}></Loading>
        </div>
    );
};

export default DefaultLayout;
