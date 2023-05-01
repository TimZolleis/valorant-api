import { Link, NavLink, useMatches } from '@remix-run/react';
import { useOptionalUser } from '~/utils/hooks/matchesData';
import type { Ref } from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const NavBar = ({ ref }: { ref?: Ref<any> }) => {
    const user = useOptionalUser();
    const [showNavbar, setShowNavbar] = useState(false);

    return (
        <div className={'w-full border-b border-zinc-800 bg-black'}>
            <div ref={ref} className={'flex justify-between px-8 py-3'}>
                <div className='flex w-full items-center justify-between'>
                    <span className={'flex w-full min-w-0 items-center truncate pr-5'}>
                        <Link className={' text-title-medium '} to={'/'}>
                            GunBuddy
                        </Link>
                        <p className={'pl-1 text-xs uppercase text-amber-600'}>Beta</p>
                        <img src='/resources/icons/slash-icon.svg' alt='' />
                        <BreadcrumbNavigation />
                    </span>
                    <img
                        onClick={() => setShowNavbar(!showNavbar)}
                        className={'block h-8 hover:cursor-pointer md:hidden'}
                        src='/resources/icons/menu-icon.svg'
                        alt=''
                    />
                    <motion.div
                        className={`fixed bottom-0 left-0 right-0 top-0 z-50 w-full p-3 backdrop-blur md:relative md:backdrop-blur-none ${
                            showNavbar ? 'flex' : 'hidden'
                        } flex-col items-center justify-center md:flex`}
                        onClick={() => setShowNavbar(!showNavbar)}>
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className={
                                'group fixed inset-x-0 bottom-0 z-40 w-full cursor-grab justify-end md:relative md:flex'
                            }>
                            <div className='flex flex-col gap-5 border-t border-white/20 bg-black p-5 md:border-none md:p-0   '>
                                <div
                                    className={'flex w-full items-center justify-center md:hidden'}>
                                    <div
                                        className={'h-2 w-20 rounded-full bg-neutral-800'}
                                        onClick={() => setShowNavbar(!showNavbar)}></div>
                                </div>
                                <div
                                    className={'flex flex-col gap-5 p-5 md:flex-row md:p-0'}
                                    onClick={() => setShowNavbar(!showNavbar)}>
                                    <NavigationLink
                                        icon={'/resources/icons/chart-icon.svg'}
                                        to={'/insights '}
                                        text={'Insights'}
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
                        </div>
                    </motion.div>
                </div>
            </div>
            <HorizontalNavigation />
        </div>
    );
};

const NavigationLink = ({ icon, to, text }: { icon: string; to: string; text: string }) => {
    return (
        <Link to={to} className={'flex items-center gap-2'}>
            <img className={'h-5'} src={icon} alt='' />
            <p className={'  text-sm'}>{text}</p>
        </Link>
    );
};

export const HorizontalNavigation = () => {
    const matches = useMatches();
    const filteredMatches = matches.filter((match) => match.handle && match.handle.navbar);
    return (
        <nav className={'w-full'}>
            {filteredMatches.map((match) => (
                <div key={match.id} className={'flex w-full gap-2 border-b border-white/20 px-5'}>
                    {match.handle?.navbar.links.map((link: { href: string; name: string }) => (
                        <NavLink
                            className={'  text-sm '}
                            key={link.href}
                            to={
                                link.href.startsWith('/')
                                    ? link.href
                                    : `${match.pathname}/${link.href}`
                            }
                            prefetch={'intent'}>
                            {({ isActive }) => (
                                <div
                                    className={
                                        isActive
                                            ? 'border-b-2 border-white p-1'
                                            : 'border-b-2 border-transparent p-1'
                                    }>
                                    <div
                                        className={`rounded-md px-3 py-2 transition-all duration-75 hover:bg-neutral-800 ${
                                            isActive ? 'font-medium ' : 'text-neutral-400'
                                        }`}>
                                        {link.name}
                                    </div>
                                </div>
                            )}
                        </NavLink>
                    ))}
                </div>
            ))}
        </nav>
    );
};

const BreadcrumbNavigation = () => {
    const matches = useMatches();
    const filteredMatches = matches.filter((match) => match.handle && match.handle.breadcrumb);
    return (
        <nav className={'flex min-w-0 gap-1 '}>
            {filteredMatches.map((match, index) => (
                <div className={'flex min-w-0  items-center'} key={index}>
                    <p className={' flex min-w-0 '}>{match.handle?.breadcrumb(match)}</p>
                    {index < filteredMatches.length - 1 && (
                        <img src='/resources/icons/slash-icon.svg' alt='' />
                    )}
                </div>
            ))}
        </nav>
    );
};
export default NavBar;
