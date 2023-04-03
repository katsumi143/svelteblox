import { redirect } from '@sveltejs/kit';
import type { PageLoad } from '../$types';
export const load = (({ url }) => {
	throw redirect(304, `/groups/${url.searchParams.get('gid')}`);
}) satisfies PageLoad