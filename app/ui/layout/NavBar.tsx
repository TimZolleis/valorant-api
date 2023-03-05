import { Link, useMatches } from '@remix-run/react';
import { DefaultButton } from '~/ui/common/DefaultButton';
import { useOptionalUser } from '~/utils/hooks/matchesData';

const NavBar = () => {
    const user = useOptionalUser();
    return (
        <div className={'w-full py-3 px-5 justify-between flex border-b border-zinc-800 '}>
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
    );
};

export default NavBar;
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
