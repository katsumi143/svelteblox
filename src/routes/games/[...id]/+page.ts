import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getExperience, getExperienceId } from '$lib/api/games';
export const load = (async ({ params }) => {
	const id = await getExperienceId(params.id.split('/')[0]);
	if (id) {
		const experience = await getExperience(id);
		if (experience)
			return experience;
	}
	throw error(404);
}) satisfies PageLoad

export interface PlaceData {
	name: string
}