import type { ReactNode } from 'react';
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
        <Link className={`truncate min-w-0  ${className}`} to={to}>
            {children}
        </Link>
    );
};
