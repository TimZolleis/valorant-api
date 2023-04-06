import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import type { MouseEvent, ReactNode } from 'react';
import { useNavigation } from '@remix-run/react';
import React from 'react';

const button = cva(
    'rounded-md px-3 flex items-center gap-1 text-sm select-none rounded-md py-2 active:scale-95 transition ease-in-out',
    {
        variants: {
            color: {
                white: 'bg-white text-black',
                black: 'bg-black text-white',
                transparent: 'bg-transparent text-white',
            },
            loading: {
                true: '',
                false: '',
            },
            height: {
                auto: 'h-auto',
                normal: 'h-12 md:h-10',
            },
        },
        defaultVariants: {
            color: 'white',
            loading: false,
            height: 'auto',
        },
    }
);

interface ButtonProps extends VariantProps<typeof button> {
    children: ReactNode;
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => any;
}

export const Button = ({ children, color, height, loading, onClick, className }: ButtonProps) => {
    const navigation = useNavigation();
    return (
        <button
            onClick={onClick ? (e) => onClick(e) : () => void 0}
            className={`${button({ color, height })} ${className}`}>
            {loading ? (
                navigation.state === 'loading' ? (
                    <img
                        className={'h-5'}
                        src='/resources/icons/ellipsis-horizontal-black.svg'
                        alt=''
                    />
                ) : (
                    children
                )
            ) : (
                children
            )}
        </button>
    );
};
