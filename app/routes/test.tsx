import type { DataFunctionArgs } from '@remix-run/node';
import { analyzeSampleMatches } from '~/utils/test/test.server';
import { requireUser } from '~/utils/session/session.server';

export const loader = async ({ request, params }: DataFunctionArgs) => {
    const user = await requireUser(request);
    await analyzeSampleMatches(user);
    return null;
};

const TestPage = () => {
    return <div>Test page</div>;
};

export default TestPage;
