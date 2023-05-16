import { error } from '@sveltejs/kit';

import { getBadge } from '$lib/api/games';
import type { PageLoad } from './$types';
export const load = (async ({ params: { id } }) => {
	return getBadge(id).catch(() => { throw error(404) });
}) satisfies PageLoad;