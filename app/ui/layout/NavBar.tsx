import { Link, NavLink, useMatches } from '@remix-run/react';
import { useOptionalUser } from '~/utils/hooks/matchesData';
import type { Ref } from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const NavBar = ({ ref }: { ref?: Ref<any> }) => {
    const user = useOptionalUser();
    const [showNavbar, setShowNavbar] = useState(false);

    return (
        <div className={'w-full border-b border-zinc-800 h-16'}>
            <div ref={ref} className={'justify-between flex px-8 py-3'}>
                <div className='flex items-center w-full justify-between'>
                    <span className={'flex items-center min-w-0 truncate pr-5 w-full'}>
                        <Link className={' text-title-medium '} to={'/'}>
                            GunBuddy
                        </Link>
                        <p className={'pl-1 uppercase text-xs text-amber-600'}>Beta</p>
                        <img src='/resources/icons/slash-icon.svg' alt='' />
                        <BreadcrumbNavigation />
                    </span>
                    <img
                        onClick={() => setShowNavbar(!showNavbar)}
                        className={'h-8 hover:cursor-pointer block md:hidden'}
                        src='/resources/icons/menu-icon.svg'
                        alt=''
                    />
                </div>
            </div>
            <HorizontalNavigation />
        </div>
    );
};

export const NavigationLink = ({ icon, to, text }: { icon: string; to: string; text: string }) => {
    return (
        <Link to={to} className={'flex items-center gap-2 p-2 hover:bg-accent/80 rounded-md'}>
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
                <div key={match.id} className={'flex gap-2 border-b border-white/20 px-5 w-full'}>
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
                                            ? 'border-b-2 p-1 border-white'
                                            : 'border-b-2 p-1 border-transparent'
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
        <nav className={'flex gap-1 min-w-0 '}>
            {filteredMatches.map((match, index) => (
                <div className={'flex items-center  min-w-0'} key={index}>
                    <p className={' min-w-0 flex '}>{match.handle?.breadcrumb(match)}</p>
                    {index < filteredMatches.length - 1 && (
                        <img src='/resources/icons/slash-icon.svg' alt='' />
                    )}
                </div>
            ))}
        </nav>
    );
};
export default NavBar;
