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
            <div ref={ref} className={'justify-between flex px-8 py-3'}>
                <div className='flex items-center w-full justify-between'>
                    <span className={'flex items-center min-w-0 truncate pr-5 w-full'}>
                        <Link className={'font-inter text-title-medium text-white'} to={'/'}>
                            GunBuddy
                        </Link>
                        <img src='/resources/icons/slash-icon.svg' alt='' />
                        <BreadcrumbNavigation />
                    </span>
                    <img
                        onClick={() => setShowNavbar(!showNavbar)}
                        className={'h-8 hover:cursor-pointer block md:hidden'}
                        src='/resources/icons/menu-icon.svg'
                        alt=''
                    />
                    <motion.div
                        className={`backdrop-blur md:backdrop-blur-none p-3 z-50 fixed left-0 top-0 right-0 bottom-0 md:relative w-full ${
                            showNavbar ? 'flex' : 'hidden'
                        } md:flex flex-col items-center justify-center`}
                        onClick={() => setShowNavbar(!showNavbar)}>
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className={
                                'group fixed md:relative inset-x-0 bottom-0 z-40 w-full cursor-grab md:flex justify-end'
                            }>
                            <div className='flex flex-col p-5 md:p-0 gap-5 bg-black border-t border-white/20 md:border-none text-white font-inter '>
                                <div
                                    className={'flex w-full items-center justify-center md:hidden'}>
                                    <div
                                        className={'h-2 w-20 bg-neutral-800 rounded-full'}
                                        onClick={() => setShowNavbar(!showNavbar)}></div>
                                </div>
                                <div
                                    className={'p-5 md:p-0 flex flex-col md:flex-row gap-5'}
                                    onClick={() => setShowNavbar(!showNavbar)}>
                                    <NavigationLink
                                        icon={'/resources/icons/chart-icon.svg'}
                                        to={'/dashboard/history'}
                                        text={'Dashboard'}
                                    />
                                    <NavigationLink
                                        icon={'/resources/icons/shop-icon.svg'}
                                        to={'/store/offers'}
                                        text={'Store'}
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
            <p className={'font-inter text-white text-sm'}>{text}</p>
        </Link>
    );
};

export default NavBar;

export const HorizontalNavigation = () => {
    const matches = useMatches();
    const filteredMatches = matches.filter((match) => match.handle && match.handle.navbar);
    return (
        <nav className={'w-full'}>
            {filteredMatches.map((match) => (
                <div key={match.id} className={'flex gap-2 border-b border-white/20 px-5 w-full'}>
                    {match.handle?.navbar.links.map((link: { href: string; name: string }) => (
                        <NavLink
                            className={'text-white font-inter text-sm '}
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
                                            ? 'border-b-2 p-1 border-white'
                                            : 'border-b-2 p-1 border-transparent'
                                    }>
                                    <div
                                        className={`rounded-md px-3 py-2 transition-all duration-75 hover:bg-neutral-800 ${
                                            isActive ? 'font-medium text-white' : 'text-neutral-400'
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
        <nav className={'flex gap-1 min-w-0 '}>
            {filteredMatches.map((match, index) => (
                <div className={'flex items-center text-white min-w-0'} key={index}>
                    <p className={'font-inter min-w-0 flex '}>{match.handle?.breadcrumb(match)}</p>
                    {index < filteredMatches.length - 1 && (
                        <img src='/resources/icons/slash-icon.svg' alt='' />
                    )}
                </div>
            ))}
        </nav>
    );
};
