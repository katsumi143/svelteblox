import type { LayoutLoad } from './$types';
import { getSelfGroupRoles } from '$lib/api/groups';
export const load = (async () => {
	const roles = await getSelfGroupRoles();
	return { groups: roles.map(role => role.group) };
}) satisfies LayoutLoad

export interface PlaceData {
	name: string
}