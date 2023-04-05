import { Form, useFetcher, useNavigation } from '@remix-run/react';
import type { DataFunctionArgs } from '@vercel/remix';
import { json, redirect } from '@vercel/remix';
import axios from 'axios';
import type { TrackerPlayerNameQueryResult } from '~/models/trn/searchquery';
import { Button } from '~/ui/common/Button';
import { UnofficialValorantApi } from '~/utils/unofficial-valorant-api/client.server';
import type { UnofficalValorantApiAccountDetails } from '~/models/unofficial-valorant-api/AccountDetails';
import { unofficalValorantApiEndpoints } from '~/config/unofficialValorantApiEndpoints';
import { Loading } from '@geist-ui/core';
import { id } from 'postcss-selector-parser';
import { LoadingComponent } from '~/ui/common/LoadingComponent';
import { Container } from '~/ui/container/Container';

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

async function getAccountDetailsByPlayerNameAndTag(name: string, tag: string) {
    return await new UnofficialValorantApi().getCached<UnofficalValorantApiAccountDetails>(
        unofficalValorantApiEndpoints.getAccountByNameAndTag(name, tag),
        {
            key: `account-details-${name}`,
            expiration: 86400,
        }
    );
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
    const result = await getAccountDetailsByPlayerNameAndTag(name, tag);
    if (result) {
        return redirect(`/search/player/${result.puuid}`);
    }
    return null;
};

const SearchPage = () => {
    const fetcher = useFetcher<typeof loader>();
    const navigation = useNavigation();
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
            {fetcher.state !== 'idle' ? (
                <LoadingComponent text={'Searching for players'}></LoadingComponent>
            ) : null}
            {navigation.state !== 'idle' ? (
                <LoadingComponent text={'Loading player statistics'}></LoadingComponent>
            ) : null}
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

export const ErrorBoundary = () => {
    return (
        <div className={'flex items-center justify-center w-full'}>
            <Container className={'bg-black md:w-2/4'}>
                <div className={'flex flex-col items-center justify-center'}>
                    <p className={'text-title-medium font-medium'}>
                        Oh shoot, something failed here.
                    </p>
                    <p className={'text-sm text-gray-400'}>
                        Something went sideways processing your search. Please try again, but this
                        player seems crooked
                    </p>
                    <Button className={'mt-2'} onClick={() => window.location.reload()}>
                        <p>Try again</p>
                    </Button>
                </div>
            </Container>
        </div>
    );
};

export default SearchPage;
