import type { PageLoad } from './$types';
import { getGroup, getGroupV2, getGroupMembership } from '$lib/api/groups';
export const load = (({ params }) => ({
	group: getGroup(params.id),
	group2: getGroupV2(params.id),
	membership: getGroupMembership(params.id)
})) satisfies PageLoad;