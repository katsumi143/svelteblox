import Cache from '../cache';
import { request } from '.';
import type { Id, PagedResponse, ApiPageResponse, BadgeResponseV2 } from './types';

export const BADGES_BASE = 'https://badges.roblox.com/v1';
export const BADGES_CACHE = new Cache('badges');
export function getUserBadges(userId: Id, limit: 10 | 25 | 50 | 100, cursor?: string): Promise<PagedResponse<BadgeResponseV2>> {
	return BADGES_CACHE.use(`user_${userId}_${limit}_${cursor}`, () =>
		request<ApiPageResponse<BadgeResponseV2>>(`${BADGES_BASE}/users/${userId}/badges?sortOrder=Desc&limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`)
			.then(data => ({
				data: data.data,
				nextCursor: data.nextPageCursor,
				prevCursor: data.previousPageCursor
			})),
		86400000
	);
}