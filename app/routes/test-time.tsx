import { DateTime } from 'luxon';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export const loader = () => {
    const hour = DateTime.now().get('hour');

    return json({ hour });
};

const TimePage = () => {
  const {hour} = useLoaderData<typeof loader>()

  return <p className={"text-white"}>{hour}</p>
}

export default TimePage;