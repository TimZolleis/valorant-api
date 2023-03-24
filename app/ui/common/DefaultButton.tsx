import type { ReactNode } from 'react';
import { useNavigation, useTransition } from '@remix-run/react';

type ButtonType = 'primary' | 'secondary';

export const DefaultButton = ({
    children,
    onClick,
    className,
    buttonType = 'primary',
}: {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    buttonType?: ButtonType;
}) => {
    const navigation = useNavigation();

    return (
        <button
            onClick={onClick}
            className={`
               ${getButtonStyles(buttonType)} ${className}`}>
            {navigation.state === 'loading' && (
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

const getButtonStyles = (type: ButtonType) => {
    return ` px-3 flex items-center gap-1 select-none rounded-md py-2 font-inter active:scale-95 transition ease-in-out ${
        type === 'primary' ? 'bg-white' : 'border border-white/50'
    }`;
};
