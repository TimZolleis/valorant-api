import { Link, NavLink, Path, useMatches } from '@remix-run/react';
import { DefaultButton } from '~/ui/common/DefaultButton';
import { useOptionalUser } from '~/utils/hooks/matchesData';
import type { Ref } from 'react';

const NavBar = ({ ref }: { ref?: Ref<any> }) => {
    const user = useOptionalUser();
    return (
        <div className={'w-full border-b border-zinc-800 bg-black'}>
            <div ref={ref} className={'justify-between flex px-8 py-3'}>
                <div className={'flex items-center min-w-0 truncate pr-5'}>
                    <Link className={'font-inter text-title-medium text-white'} to={'/'}>
                        GunBuddy
                    </Link>
                    <img src='/resources/icons/slash-icon.svg' alt='' />
                    <BreadcrumbNavigation />
                </div>
                <div className={'flex items-center font-inter text-white text-sm'}>
                    <div className={'flex items-center pr-10 gap-5'}>
                        <Link to={'/dashboard/history '}>Dashboard</Link>
                        <Link to={'/store/offers '}>Store</Link>
                    </div>
                    <Link to={user ? '/logout' : '/login'}>
                        <DefaultButton>
                            <p className={'text-sm px-2 text-black'}>{user ? 'Logout' : 'Login'}</p>
                        </DefaultButton>
                    </Link>
                </div>
            </div>
            <HorizontalNavigation />
        </div>
    );
};

export default NavBar;

const HorizontalNavigation = () => {
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
                            to={link.href}
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
