import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getUniverse, getUniverseId, getUniverseThumbnails } from '$lib/api';
export const load = (async ({ params }) => {
	console.log('fetching universe details');
	const universeId = await getUniverseId(params.id);
	if (universeId) {
		const universe = await getUniverse(universeId);
		if (universe) {
			const thumbnails = await getUniverseThumbnails(universeId);
			return { ...universe, thumbnails };
		}
	}
	throw error(404);
}) satisfies PageLoad

export interface PlaceData {
	name: string
}