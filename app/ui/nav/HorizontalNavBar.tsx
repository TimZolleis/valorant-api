import { NavLink } from '@remix-run/react';

type HorizontalNavBarLink = {
    name: string;
    href: string;
};

export const HorizontalNavBar = ({ links }: { links: HorizontalNavBarLink[] }) => {
    return (
        <nav className={'w-full'}>
            <div className={'flex space-x-2 border-b border-white/20 w-full'}>
                {links.map((link) => (
                    <NavLink
                        className={'text-white font-inter font-semibold '}
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
                                    className={
                                        'rounded-md px-3 py-2 transition-all duration-75 hover:bg-neutral-800'
                                    }>
                                    {link.name}
                                </div>
                            </div>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};
