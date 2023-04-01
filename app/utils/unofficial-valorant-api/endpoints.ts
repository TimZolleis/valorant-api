import { z } from 'zod';

const playerByPlayerNameAndTagEndpoint = z.object({
    status: z.number(),
    data: z.object({
        puuid: z.string(),
        region: z.string(),
        account_level: z.number(),
        name: z.string(),
        tag: z.string(),
        card: z.object({
            small: z.string(),
            large: z.string(),
            wide: z.string(),
            id: z.string(),
        }),
        last_update: z.string(),
        last_update_raw: z.number(),
    }),
});
