import type { PageLoad } from './$types';
import { getUser, getUserIcon } from '$lib/api';
export const load = (async ({ params }) => {
	console.log('fetching user details');
	const user = await getUser(params.id);
	const icon = await getUserIcon(params.id);
	return { ...user, icon };
}) satisfies PageLoad