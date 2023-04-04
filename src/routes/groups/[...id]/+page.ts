import { getGroup } from '$lib/api/groups';
import type { PageLoad } from './$types';
export const load = (async ({ params }) => {
	return await getGroup(params.id.split('/')[0]);
}) satisfies PageLoad