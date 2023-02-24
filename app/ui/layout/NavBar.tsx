import { Link, useMatches } from '@remix-run/react';
import { DefaultButton } from '~/ui/common/DefaultButton';
import { useOptionalUser } from '~/utils/hooks/matchesData';
import { use } from 'ast-types';

const NavBar = () => {
    const user = useOptionalUser();
    return (
        <div className={'w-full py-3 px-5 justify-between flex border-b border-zinc-800 '}>
            <div className={'flex items-center'}>
                <Link className={'font-inter text-title-medium text-white'} to={'/'}>
                    GunBuddy
                </Link>
                <img src='/resources/icons/slash-icon.svg' alt='' />
                <BreadcrumbNavigation />
            </div>
            <Link to={user ? '/logout' : '/login'}>
                <DefaultButton>
                    <p className={'text-sm px-2'}>{user ? 'Logout' : 'Login'}</p>
                </DefaultButton>
            </Link>
        </div>
    );
};

export default NavBar;
const BreadcrumbNavigation = () => {
    const matches = useMatches();
    const filteredMatches = matches.filter((match) => match.handle && match.handle.breadcrumb);

    return (
        <nav className={'flex gap-1'}>
            {filteredMatches.map((match, index) => (
                <div className={'flex  items-center text-white'} key={index}>
                    <p className={'font-inter'}>{match.handle?.breadcrumb(match)}</p>
                    {index < filteredMatches.length - 1 && (
                        <img src='/resources/icons/slash-icon.svg' alt='' />
                    )}
                </div>
            ))}
        </nav>
    );
};
