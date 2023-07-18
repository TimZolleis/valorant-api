import type { ClassValue } from 'clsx/clsx';
import { clsx } from 'clsx/clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
