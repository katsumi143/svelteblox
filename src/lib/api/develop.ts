import { request } from '.';
import type { ExperiencePermissions } from './types';
export const DEVELOP_BASE = 'https://develop.roblox.com/v1';

export function getExperiencePermissions(universeId: string | number) {
	return request<ExperiencePermissions>(`${DEVELOP_BASE}/universes/${universeId}/permissions`);
}