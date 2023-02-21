import type { LoaderFunction } from '@remix-run/node';
import { defer } from '@remix-run/node';
import { Suspense, useDeferredValue } from 'react';
import { Await, useLoaderData } from '@remix-run/react';

export const loader: LoaderFunction = async ({ request }) => {
    const testPromise = new Promise((resolve) => setTimeout(() => resolve('Hello World'), 1000));
    return defer({ testPromise });
};

export default function Index() {
    return <></>;
}
