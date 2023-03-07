import { SmallContainer } from '~/ui/container/SmallContainer';

export const LoadingContainer = () => {
    return (
        <div className={'w-full space-y-2 flex flex-col justify-start'}>
            <LoadingElement className={'h-8'}></LoadingElement>
            <LoadingElement className={'h-10'}></LoadingElement>
            <LoadingElement className={'h-20'}></LoadingElement>
        </div>
    );
};

const LoadingElement = ({ className }: { className?: string }) => {
    return <div className={`bg-neutral-800 rounded-md animate-pulse ${className}`}></div>;
};
