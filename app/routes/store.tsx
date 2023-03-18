import type { RouteMatch } from '@remix-run/react';
import { Outlet } from '@remix-run/react';
import { BreadCrumbLink } from '~/ui/common/BreadCrumbLink';

const links = [
    {
        name: 'Offers',
        href: '/store/offers',
    },
    {
        name: 'Reminders',
        href: '/store/reminders',
    },
    {
        name: 'History',
        href: '/store/history',
    },
];

export const handle = {
    breadcrumb: (match: RouteMatch) => <BreadCrumbLink to={match.pathname}>Store</BreadCrumbLink>,
    navbar: {
        links: links,
    },
};

const StorePage = () => {
    return (
        <div className={'text-white'}>
            <Outlet />
        </div>
    );
};

export default StorePage;
