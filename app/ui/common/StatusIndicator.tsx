export const StatusIndicator = ({ live }: { live: boolean }) => {
    return (
        <span className='relative flex h-3 w-3'>
            <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    live ? 'bg-red-500' : 'bg-neutral-600'
                }`}></span>
            <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                    live ? 'bg-red-500' : 'bg-neutral-600'
                }`}></span>
        </span>
    );
};
