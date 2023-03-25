import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getGroup, getGroupIcon } from '$lib/api';
export const load = (async ({ params }) => {
	console.log('fetching group details');
	const group = await getGroup(params.id);
	const icon = await getGroupIcon(params.id);
	return { ...group, icon };
}) satisfies PageLoad

export interface PlaceData {
	name: string
}