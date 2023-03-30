import { user } from '$lib/api/auth';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
export const load = (() => {
	throw redirect(304, `/users/${user.id}`);
}) satisfies PageLoad