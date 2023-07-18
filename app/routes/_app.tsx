import DefaultLayout from '~/ui/layout/DefaultLayout';
import { Outlet } from '@remix-run/react';

const NewLayoutPage = () => {
    return (
        <DefaultLayout>
            <Outlet />
        </DefaultLayout>
    );
};

export default NewLayoutPage;
