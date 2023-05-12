import Cache from '$lib/cache';
import { request } from '.';
import type { ApiDataList, TalentProfile } from './types';
export const TALENT_BASE = 'https://apis.roblox.com/talent/v1';
export const TALENT_CACHE = new Cache('talent');

export function getTalentProfile(id: string | number) {
	return TALENT_CACHE.use(`profile_${id}`, () =>
		request<ApiDataList<TalentProfile>>(`${TALENT_BASE}/users/${id}/profile`)
			.then(data => data.data[0]),
		86400000
	);
}