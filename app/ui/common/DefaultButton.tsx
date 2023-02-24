import { ReactNode } from 'react';
import { useTransition } from '@remix-run/react';

export const DefaultButton = ({
    children,
    onClick,
}: {
    children: ReactNode;
    onClick?: () => void;
}) => {
    const transition = useTransition();

    return (
        <button
            onClick={onClick}
            className={
                'px-3 flex items-center gap-1 select-none rounded-md py-2 bg-white font-inter active:scale-95 transition ease-in-out'
            }>
            {transition.state === 'loading' && (
                <img
                    className={'h-5'}
                    src='/resources/icons/ellipsis-horizontal-black.svg'
                    alt=''
                />
            )}
            <div className={'w-full'}>{children}</div>
        </button>
    );
};
