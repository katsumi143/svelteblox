import type { LayoutLoad } from './$types';
import { getGroupIcons, getSelfGroupRoles } from '$lib/api';
export const load = (async () => {
	console.log('fetching groups');
	const roles = await getSelfGroupRoles();
	const groups = roles.map(role => role.group);
	const icons = await getGroupIcons(groups.map(group => group.id));
	return { icons, groups };
}) satisfies LayoutLoad

export interface PlaceData {
	name: string
}