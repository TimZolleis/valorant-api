import React, { ReactNode, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export const Modal = ({
    showModal,
    toggleModal,
    children,
}: {
    showModal: boolean;
    toggleModal: any;
    children: ReactNode;
}) => {
    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [showModal]);

    return (
        <>
            <AnimatePresence>
                {showModal ? (
                    <motion.div
                        key={showModal.toString()}
                        onClick={() => toggleModal()}
                        className={
                            'bg-black bg-opacity-40 p-3 z-50 fixed lg:px-32 left-0 top-0 right-0 bottom-0 flex flex-col items-center justify-center'
                        }
                        layout
                        initial={{
                            opacity: 0,
                            y: 500,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            transition: {
                                duration: 0.1,
                                type: 'spring',
                                damping: 25,
                                stiffness: 500,
                            },
                        }}
                        exit={{ y: 500, opacity: 0 }}>
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className={
                                'rounded-xl flex flex-col ring ring-1 ring-gray-600/50 bg-black md:px-5 md:py-5 w-full overflow-y-scroll'
                            }>
                            <div className={'p-3'}>{children}</div>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </>
    );
};

export function useModal(showInitial: boolean = false) {
    const [showModal, setShowModal] = useState(showInitial);

    function toggleModal() {
        setShowModal(!showModal);
    }

    return { showModal, toggleModal, setShowModal };
}
