import { Listbox, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';

export const Select = ({
    options,
    preselect,
    onChange,
}: {
    options: string[];
    preselect: string;
    onChange: (value: string) => any;
}) => {
    const [selectedOption, setSelectionOption] = useState(preselect);
    const handleChange = (value: string) => {
        setSelectionOption(value);
        onChange(value);
    };

    return (
        <Listbox value={selectedOption} onChange={(value) => handleChange(value)}>
            <div>
                <Listbox.Button className='relative flex items-center justify-between gap-3 rounded-md py-2 px-3 text-left bg-black focus:outline-none text-sm border border-zinc-800 '>
                    <span>{selectedOption}</span>
                    <span>
                        <img className={'h-4 '} src={'/resources/icons/chevron-down.svg'} />
                    </span>
                </Listbox.Button>
                <Transition
                    leave='transition ease-in duration-100'
                    leaveFrom='opacity-100'
                    leaveTo='opacity-0'>
                    <Listbox.Options className='absolute mt-1 bg-black overflow-auto rounded-md text-sm py-1'>
                        {options.map((option) => (
                            <Listbox.Option
                                key={option}
                                className={({ active }) =>
                                    `relative cursor-default select-none py-2 px-3 ${
                                        active ? 'bg-zinc-500/30 text-white' : 'text-zinc-500'
                                    }`
                                }
                                value={option}>
                                {({ selected }) => (
                                    <>
                                        <span
                                            className={`block truncate ${
                                                selected ? 'font-medium' : 'font-normal'
                                            }`}>
                                            {option}
                                        </span>
                                    </>
                                )}
                            </Listbox.Option>
                        ))}
                    </Listbox.Options>
                </Transition>
            </div>
        </Listbox>
    );
};
