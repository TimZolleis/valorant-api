import type { RouteMatch } from '@remix-run/react';
import { Outlet } from '@remix-run/react';
import { BreadCrumbLink } from '~/ui/common/BreadCrumbLink';
import { HorizontalNavBar } from '~/ui/nav/HorizontalNavBar';

export const handle = {
    breadcrumb: (match: RouteMatch) => <BreadCrumbLink to={match.pathname}>Store</BreadCrumbLink>,
};

const links = [
    {
        name: 'Offers',
        href: '/store/offers',
    },
    {
        name: 'Reminders',
        href: '/store/reminders',
    },
];

const StorePage = () => {
    return (
        <div className={'text-white'}>
            <HorizontalNavBar links={links}></HorizontalNavBar>
            <Outlet />
        </div>
    );
};

export default StorePage;
