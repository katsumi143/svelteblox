import { user } from '$lib/api/users';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
export const load = (() => {
	throw redirect(304, `/users/${user.id}/profile`);
}) satisfies PageLoad