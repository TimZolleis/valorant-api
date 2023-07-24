import type { ReactNode } from 'react';
import NavBar, { NavigationLink } from '~/ui/layout/NavBar';
import { useNavigation } from '@remix-run/react';
import { Loading } from '@geist-ui/core';
import { useOptionalUser } from '~/utils/hooks/matchesData';

const DefaultLayout = ({ children }: { children: ReactNode }) => {
    const user = useOptionalUser();
    return (
        <>
            <div className={'relative dark'}>
                <div className={'flex h-screen'}>
                    <div className={'fixed w-full'}>
                        <NavBar />
                    </div>
                    <aside className={'pt-16'}>
                        <div
                            className={
                                'transform -translate-x-full fixed z-10 flex h-full w-full flex-col justify-between border-r p-4 transition-all sm:w-60 sm:translate-x-0'
                            }>
                            <div className={'grid gap-4'}>
                                <NavigationLink
                                    icon={'/resources/icons/chart-icon.svg'}
                                    to={'/'}
                                    text={'Dashboard'}
                                />
                                <NavigationLink
                                    icon={'/resources/icons/shop-icon.svg'}
                                    to={'/store/offers'}
                                    text={'Store'}
                                />
                                <NavigationLink
                                    icon={'/resources/icons/search.svg'}
                                    to={'/search'}
                                    text={'Search Player'}
                                />
                                <NavigationLink
                                    icon={'/resources/icons/user-icon.svg'}
                                    to={user ? '/logout' : '/login'}
                                    text={user ? 'Logout' : 'Login'}
                                />
                            </div>
                        </div>
                    </aside>
                    <main
                        className={`w-full select-text min-h-full selection:bg-fuchsia-500 sm:pl-60 pt-16`}>
                        <div className={'p-5 md:px-10'}>{children}</div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default DefaultLayout;
