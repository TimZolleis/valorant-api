import { SmallContainer } from '~/ui/container/SmallContainer';

export const LoadingContainer = () => {
    return (
        <div className={'w-full space-y-2 flex flex-col justify-start'}>
            <div className={'h-8 bg-neutral-900 rounded-md animate-pulse'}></div>
            <div className={'h-20 bg-neutral-900 rounded-md animate-pulse'}></div>
            <div className={'h-10 bg-neutral-900 rounded-md animate-pulse w-40'}></div>
        </div>
    );
};
