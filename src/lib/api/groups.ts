import Cache from '../cache';
import { user } from './auth';
import { request } from '.';
import { THUMBNAILS_BASE } from './images';
import type { Group, ImageData, ApiDataList } from './types';
export const GROUPS_BASE = 'https://groups.roblox.com/v1';

export const GROUPS_CACHE = new Cache('groups');

export function getGroup(id: string | number): Promise<Group> {
	return GROUPS_CACHE.use(`group_${id}`, () => request<Group>(`https://groups.roblox.com/v1/groups/${id}`), 600000);
}
export function getGroupIcon(id: string | number): Promise<ImageData | undefined> {
	return GROUPS_CACHE.use(`group_icon_${id}`, () => getGroupIcons([id]).then(data => data[0]), 600000);
}
export function getGroupIcons(ids: (string | number)[]) {
	return request<ApiDataList<ImageData>>(`${THUMBNAILS_BASE}/groups/icons?groupIds=${ids.join(',')}&format=Png&size=150x150`)
		.then(data => data.data);
}

export function getSelfGroupRoles() {
	return GROUPS_CACHE.use('roles', () =>
		request<ApiDataList<{
			role: {
				id: number
				name: string
				rank: number
			}
			group: Group
		}>>(`${GROUPS_BASE}/users/${user.id}/groups/roles`).then(data => data.data),
		600000
	);
}