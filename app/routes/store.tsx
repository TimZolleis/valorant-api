import { Outlet, RouteMatch } from '@remix-run/react';
import { BreadCrumbLink } from '~/ui/common/BreadCrumbLink';

export const handle = {
    breadcrumb: (match: RouteMatch) => <BreadCrumbLink to={match.pathname}>Store</BreadCrumbLink>,
};

const StorePage = () => {
    return (
        <div className={'text-white'}>
            <Outlet />
        </div>
    );
};

export default StorePage;
