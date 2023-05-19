import type { LayoutLoad } from './$types';
import { getSelfGroupRoles } from '$lib/api/groups';
export const load = (async () => ({ groups: await getSelfGroupRoles() })) satisfies LayoutLoad