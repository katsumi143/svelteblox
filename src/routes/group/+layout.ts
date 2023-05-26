import type { LayoutLoad } from './$types';
import { getSelfGroupRoles } from '$lib/api/groups';
export const load = (() => ({ groups: getSelfGroupRoles() })) satisfies LayoutLoad;