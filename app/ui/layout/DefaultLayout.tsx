import type { ReactNode } from 'react';
import NavBar from '~/ui/layout/NavBar';
import { useTransition } from '@remix-run/react';
import { Loading, Spinner } from '@geist-ui/core';
import { LoadingContainer } from '~/ui/container/LoadingContainer';

const DefaultLayout = ({ children }: { children: ReactNode }) => {
    const transition = useTransition();
    return (
        <>
            <NavBar />
            <main className={'main select-text selection:bg-fuchsia-500'}>
                {transition.state === 'loading' && <LoadingSpinner />}
                <div className={'p-5 md:px-10'}>{children}</div>
            </main>
        </>
    );
};

const LoadingSpinner = () => {
    return (
        <div
            className={
                'bg-black bg-opacity-40 p-3 z-50 fixed lg:px-32 left-0 top-0 right-0 bottom-0 flex flex-col items-center justify-center'
            }>
            <Loading className={'w-20'} spaceRatio={1.5} color={'#FFFFFF'}></Loading>
        </div>
    );
};

export default DefaultLayout;
