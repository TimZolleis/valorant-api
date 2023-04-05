import { Loading } from '@geist-ui/core';

export const LoadingComponent = ({ text }: { text?: string }) => {
    return (
        <div
            className={
                'bg-black bg-opacity-40 p-3 z-50 fixed lg:px-32 left-0 top-0 right-0 bottom-0 flex flex-col items-center justify-center'
            }>
            <div className={'w-full flex flex-col items-center justify-center gap-2'}>
                <p>{text}</p>
                <Loading className={'w-20'} spaceRatio={1.5} color={'#FFFFFF'}></Loading>
            </div>
        </div>
    );
};
