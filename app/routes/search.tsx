import { Form, useFetcher } from '@remix-run/react';
import type { DataFunctionArgs } from '@vercel/remix';
import { json } from '@vercel/remix';
import axios from 'axios';
import type { TrackerPlayerNameQueryResult } from '~/models/trn/searchquery';
import { Button } from '~/ui/common/Button';

async function searchPlayerByName(name: string) {
    return await axios
        .get<TrackerPlayerNameQueryResult>(
            'https://api-staging.tracker.gg/api/v2/valorant/standard/search',
            {
                params: {
                    platform: 'riot',
                    query: name,
                    autocomplete: true,
                },
            }
        )
        .then((res) => res.data.data);
}

function parsePlayerName(playerName: string) {
    const split = playerName.split('#');
    const name = split[0];
    const tag = split[1];
    return { name, tag };
}

export const loader = async ({ request }: DataFunctionArgs) => {
    const query = new URL(request.url).searchParams.get('player-name');
    if (!query) {
        return json({ players: [] });
    }
    const results = await searchPlayerByName(query);
    return json({
        players: results,
    });
};

export const action = async ({ request }: DataFunctionArgs) => {
    const formData = await request.formData();
    const playerName = formData.get('player-name');
    if (!playerName) {
        throw new Error('Please provide a valid player name');
    }
    const { name, tag } = parsePlayerName(playerName.toString());

    return null;
};

const SearchPage = () => {
    const fetcher = useFetcher<typeof loader>();
    return (
        <div>
            <p className={'text-headline-medium'}>Search Players</p>
            <fetcher.Form method={'get'}>
                <input
                    name={'player-name'}
                    className={
                        ' mt-5 w-full bg-black rounded-md border border-zinc-800 px-3 py-1.5 focus:outline-none'
                    }
                    onChange={(event) => fetcher.submit(event.target.form)}
                />
            </fetcher.Form>
            <p className={' mt-2 text-sm text-zinc-400'}>
                {fetcher.data?.players.length && fetcher.data?.players.length > 1
                    ? `${fetcher.data?.players.length} Results`
                    : fetcher.data?.players.length
                    ? `${fetcher.data?.players.length} Result`
                    : '0 Results'}
            </p>
            <div className={'mt-5 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2'}>
                {fetcher.data?.players
                    ? fetcher.data.players.map((player) => (
                          <PlayerComponent
                              playerName={player.platformUserHandle}
                              key={player.platformUserHandle.toString()}
                          />
                      ))
                    : null}
            </div>
        </div>
    );
};

const PlayerComponent = ({ playerName }: { playerName: string }) => {
    return (
        <Form
            method={'post'}
            className={
                'w-full bg-black rounded-md flex items-center justify-between p-3 border border-zinc-800'
            }>
            <input
                className={'appearance-none bg-transparent'}
                readOnly={true}
                name={'player-name'}
                defaultValue={playerName}></input>
            <div>
                <Button>Check player</Button>
            </div>
        </Form>
    );
};

export default SearchPage;
