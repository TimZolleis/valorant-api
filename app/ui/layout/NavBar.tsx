import { Link, useMatches } from '@remix-run/react';

const NavBar = () => {
    return (
        <div className={'w-full p-3 flex border-b border-zinc-800 '}>
            <Link className={'font-inter text-title-medium text-white'} to={'/'}>
                GunBuddy
            </Link>
            <img src='/resources/icons/slash-icon.svg' alt='' />
            <BreadcrumbNavigation />
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
