import Cache from '$lib/cache';
import { request } from '.';
import type { ExperiencePermissions } from './types';
export const DEVELOP_BASE = 'https://develop.roblox.com/v1';
export const DEVELOP_CACHE = new Cache('develop');

export function getExperiencePermissions(experienceId: string | number) {
	return DEVELOP_CACHE.use(`permissions_${experienceId}`, () =>
		request<ExperiencePermissions>(`${DEVELOP_BASE}/universes/${experienceId}/permissions`),
		86400000
	);
}