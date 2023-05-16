import Cache from '../cache';
import { user } from './users';
import { request } from '.';
import { getThumbnails } from './images';
import { getExperiences } from './games';
import type { GroupRelationship } from './enums';
import type { Group, ImageData, ApiDataList, ExperienceV2 } from './types';
export const GROUPS_BASE = 'https://groups.roblox.com/v1';

export const GROUPS_CACHE = new Cache('groups');

export function getGroup(groupId: string | number): Promise<Group> {
	return GROUPS_CACHE.use(`group_${groupId}`, () => request<Group>(`${GROUPS_BASE}/groups/${groupId}`), 600000);
}
export function getGroupIcon(groupId: string | number): Promise<ImageData | undefined> {
	return GROUPS_CACHE.use(`group_icon_${groupId}`, () => getGroupIcons([groupId]).then(data => data[0]), 3600000);
}
export function getGroupIcons(groupIds: (string | number)[]) {
	if (groupIds.length === 0)
		return Promise.resolve([]);
	return getThumbnails(groupIds, 'groups/icons?groupIds=%IDS%&format=Png&size=150x150', 3600000);
}
export function getGroupExperiences(groupId: string | number, access?: number) {
	return request<ApiDataList<ExperienceV2>>(`https://games.roblox.com/v2/groups/${groupId}/games?accessFilter=${access}`)
		.then(data => data.data);
}
export function getGroupExperiences2(groupId: string | number, access?: number) {
	return getGroupExperiences(groupId, access)
		.then(data => getExperiences(data.map(e => e.id)));
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

export function getRelatedGroups(groupId: string | number, relationship: GroupRelationship) {
	return GROUPS_CACHE.use(`related_${groupId}_${relationship}`, () =>
		request<{
			groupId: number
			nextRowIndex: number
			relatedGroups: Group[]
			totalGroupCount: number
			relationshipType: GroupRelationship
		}>(`${GROUPS_BASE}/groups/${groupId}/relationships/${relationship}?StartRowIndex=0&MaxRows=10`)
			.then(data => data.relatedGroups),
		600000
	)
}

export function joinGroup(groupId: string | number) {
	return request(`${GROUPS_BASE}/groups/${groupId}/users`, 'POST');
}

export function getPrimaryGroup(userId: string | number) {
	return GROUPS_CACHE.use(`primary_${userId}`, () =>
		request<PrimaryGroupResponse | null>(`${GROUPS_BASE}/users/${userId}/groups/primary/role`)
			.then((data) => data ? getGroup(data.group.id) : null),
		3600000
	);
}

interface PrimaryGroupResponse {
	role: any
	group: {
		id: number
		name: string
		owner: {
			userId: number
			username: string
			displayName: string
			hasVerifiedBadge: boolean
		}
		shout: {
			body: string
			poster: {
				userId: boolean
				username: string
				displayName: string
				hasVerifiedBadge: boolean
				buildersClubMembershipType: number
			}
			created: string
			updated: string
		} | null
		description: string
		hasVerifiedBadge: boolean
		publicEntryAllowed: boolean
		isBuildersClubOnly: boolean
	}
	isPrimaryGroup: boolean
}