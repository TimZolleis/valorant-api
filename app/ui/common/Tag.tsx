import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export interface TagProps extends VariantProps<typeof tag> {
    text: string;
}

const tag = cva('rounded-md px-3 py-1 border', {
    variants: {
        color: {
            green: 'bg-green-800/50 text-green-500 border-green-500',
            red: 'bg-red-800/50 text-red-500 border-red-500',
            amber: 'bg-amber-800/50 text-amber-500 border-amber-500',
            violet: 'bg-violet-800/50 text-violet-500 border-violet-500',
            fuchsia: 'bg-fuchsia-800/50 text-fuchsia-500 border-fuchsia-500',
            sky: 'bg-sky-800/50 text-sky-500 border-sky-500',
        },
    },
});

export const Tag = ({ text, color }: TagProps) => {
    return (
        <div className={tag({ color })}>
            <p className={'font-inter text-xs'}>{text}</p>
        </div>
    );
};
