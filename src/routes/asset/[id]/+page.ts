import type { PageLoad } from './$types';
import { getAssetDetails } from '$lib/api/assets';
export const load = (async ({ params: { id } }) => {
	return getAssetDetails([id]).then(data => data[0]);
}) satisfies PageLoad;