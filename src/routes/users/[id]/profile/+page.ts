import { getUser } from '$lib/api/users';
import type { PageLoad } from '../$types';
export const load = (async ({ params }) => {
	return await getUser(params.id);
}) satisfies PageLoad