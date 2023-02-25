import { ReactNode } from 'react';
import { Link } from '@remix-run/react';

export const BreadCrumbLink = ({
    className,
    to,
    children,
}: {
    className?: string;
    to: string;
    children: ReactNode;
}) => {
    return (
        <Link className={`truncate min-w-0 font-inter ${className}`} to={to}>
            {children}
        </Link>
    );
};
