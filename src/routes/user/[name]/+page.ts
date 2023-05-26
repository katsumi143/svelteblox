import { error, redirect } from '@sveltejs/kit';

import type { PageLoad } from './$types';
import { getUser, USERS_CACHE, getUserIdFromUsername } from '$lib/api/users';
export const load = (async ({ url, params: { name } }) => {
	const userId = parseInt(name);
	if (userId) {
		const user = await getUser(userId).catch(() => { throw error(404) });
		USERS_CACHE.set(`userid_${user.name}`, userId, 86400000);

		throw redirect(301, url.href.replace(name, user.name));
	}
	return getUser(await getUserIdFromUsername(name))
		.catch(() => { throw error(404) });
}) satisfies PageLoad;