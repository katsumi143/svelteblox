import { user } from './auth';
import { request } from '.';
import { THUMBNAILS_BASE } from './images';
import type { Group, ImageData, ApiDataList } from './types';
export const GROUPS_BASE = 'https://groups.roblox.com/v1';

export function getGroup(id: string | number): Promise<Group> {
	return request<Group>(`https://groups.roblox.com/v1/groups/${id}`);
}
export function getGroupIcon(id: string | number): Promise<ImageData | undefined> {
	return getGroupIcons([id]).then(data => data[0]);
}
export function getGroupIcons(ids: (string | number)[]) {
	return request<ApiDataList<ImageData>>(`${THUMBNAILS_BASE}/groups/icons?groupIds=${ids.join(',')}&format=Png&size=150x150`)
		.then(data => data.data);
}

export function getSelfGroupRoles() {
	return request<ApiDataList<{
		role: {
			id: number
			name: string
			rank: number
		}
		group: Group
	}>>(`${GROUPS_BASE}/users/${user.id}/groups/roles`).then(data => data.data);
}