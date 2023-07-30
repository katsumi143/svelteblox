import Cache from '../cache';
import { user } from './users';
import { getThumbnails } from './images';
import { getExperiences } from './games';
import { request, fullRequest } from '.';
import type { GroupRelationship } from './enums';
import type { Id, Group, GroupV2, GroupRole, ImageData, GroupRole2, SocialLink, ApiDataList, PartialUser, ExperienceV2, PagedResponse, GroupWallPost, GroupAuditLog, ApiPageResponse, GroupMembership } from './types';
export const GROUPS_BASE = 'https://groups.roblox.com/v1';

export const GROUPS_CACHE = new Cache('groups');

export function getGroup(groupId: Id) {
	return GROUPS_CACHE.use(`group/${groupId}`, () =>
		request<Group>(`${GROUPS_BASE}/groups/${groupId}`).then(group => {
			GROUPS_CACHE.set(`group/${groupId}/name`, group.name, 86400000);
			GROUPS_CACHE.set(`group/${groupId}/verified`, group.hasVerifiedBadge, 86400000);
			return group;
		}),
		600000
	);
}
export function getGroupV2(groupId: Id) {
	return GROUPS_CACHE.use(`group2/${groupId}`, () =>
		getGroups([groupId]).then(([group]) => {
			GROUPS_CACHE.set(`group/${groupId}/name`, group.name, 86400000);
			GROUPS_CACHE.set(`group/${groupId}/verified`, group.hasVerifiedBadge, 86400000);
			return group;
		}),
		600000
	);
}

export function getGroups(groupIds: Id[]) {
	if (!groupIds.length)
		return Promise.resolve([]);
	return request<ApiDataList<GroupV2>>(`https://groups.roblox.com/v2/groups?groupIds=${groupIds.join(',')}`)
		.then(response => response.data);
}

export function getGroupIcon(groupId: Id): Promise<ImageData | undefined> {
	return GROUPS_CACHE.use(`group/${groupId}/icon`, () => getGroupIcons([groupId]).then(data => data[0]), 3600000);
}
export function getGroupName(groupId: Id) {
	return GROUPS_CACHE.use(`group/${groupId}/name`, () => getGroup(groupId).then(data => data.name), 86400000);
}
export function getGroupVerified(groupId: Id) {
	return GROUPS_CACHE.use(`group/${groupId}/verified`, () => getGroup(groupId).then(data => data.hasVerifiedBadge), 86400000);
}

export function getGroupIcons(groupIds: Id[]) {
	if (groupIds.length === 0)
		return Promise.resolve([]);
	return getThumbnails(groupIds, 'groups/icons?groupIds=%IDS%&format=Png&size=150x150', 3600000);
}
export function getGroupExperiences(groupId: Id, access?: number) {
	return request<ApiDataList<ExperienceV2>>(`https://games.roblox.com/v2/groups/${groupId}/games?accessFilter=${access}`)
		.then(data => data.data);
}
export function getGroupExperiences2(groupId: Id, access?: number) {
	return getGroupExperiences(groupId, access)
		.then(data => getExperiences(data.map(e => e.id)));
}

export function getGroupSocials(groupId: Id) {
	return GROUPS_CACHE.use(`group/${groupId}/socials`, () =>
		request<ApiDataList<SocialLink>>(`${GROUPS_BASE}/groups/${groupId}/social-links`)
			.then(data => data.data),
		86400000
	);
}

export function getGroupRoles(groupId: Id) {
	return GROUPS_CACHE.use(`group/${groupId}/roles`, () =>
		request<{
			roles: GroupRole[]
			groupId: number
		}>(`${GROUPS_BASE}/groups/${groupId}/roles`)
			.then(data => data.roles),
		86400000
	);
}

export function getGroupMembers(groupId: Id, roleId: Id, limit: 10 | 25 | 50 | 100, cursor?: string | null) {
	return GROUPS_CACHE.use(`group/${groupId}/roles/${roleId}/users/${limit}/${cursor}`, () =>
		request<ApiPageResponse<PartialUser>>(`${GROUPS_BASE}/groups/${groupId}/roles/${roleId}/users?sortOrder=Desc&limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`)
			.then(data => ({
				data: data.data,
				nextCursor: data.nextPageCursor,
				prevCursor: data.previousPageCursor
			})),
		86400000
	);
}

export function getGroupMembership(groupId: Id) {
	return GROUPS_CACHE.use(`group/${groupId}/membership`, () =>
		request<GroupMembership>(`${GROUPS_BASE}/groups/${groupId}/membership`),
		3600000
	);
}

export function getGroupWallPosts(groupId: Id, limit: 10 | 25 | 50 | 100, cursor?: string | null): Promise<PagedResponse<GroupWallPost>> {
	return GROUPS_CACHE.use(`group/${groupId}/wall/${limit}/${cursor}`, () =>
		request<ApiPageResponse<GroupWallPost>>(`https://groups.roblox.com/v2/groups/${groupId}/wall/posts?sortOrder=Desc&limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`)
			.then(data => ({
				data: data.data,
				nextCursor: data.nextPageCursor,
				prevCursor: data.previousPageCursor
			})),
		86400000
	);
}

export function getGroupAuditLog(groupId: Id, limit: 10 | 25 | 50 | 100, cursor?: string | null): Promise<PagedResponse<GroupAuditLog>> {
	return GROUPS_CACHE.use(`group/${groupId}/audit-log/${limit}/${cursor}`, () =>
		request<ApiPageResponse<GroupAuditLog>>(`${GROUPS_BASE}/groups/${groupId}/audit-log?sortOrder=Desc&limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`)
			.then(data => ({
				data: data.data,
				nextCursor: data.nextPageCursor,
				prevCursor: data.previousPageCursor
			})),
		86400000
	);
}

export function postToGroupWall(groupId: Id, body: string) {
	return request<GroupWallPost>(`https://groups.roblox.com/v2/groups/${groupId}/wall/posts`, 'POST', {
		body
	});
}

export function deleteGroupPost(groupId: Id, postId: Id) {
	return fullRequest(`${GROUPS_BASE}/groups/${groupId}/wall/posts/${postId}`, 'DELETE')
		.then(response => response.status === 200);
}

export function getSelfGroupRoles() {
	return getUserGroupRoles(user.id);
}

export function getUserGroupRoles(userId: Id) {
	return GROUPS_CACHE.use(`user/${userId}/group-roles`, () =>
		request<ApiDataList<GroupRole2>>(`${GROUPS_BASE}/users/${userId}/groups/roles`).then(data => data.data),
		600000
	);
}

export function getRelatedGroups(groupId: Id, relationship: GroupRelationship) {
	return GROUPS_CACHE.use(`group/${groupId}/related/${relationship}`, () =>
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

export function joinGroup(groupId: Id) {
	return request(`${GROUPS_BASE}/groups/${groupId}/users`, 'POST');
}

export function getPrimaryGroup(userId: Id): Promise<[Group, PrimaryGroupResponse['role']] | null> {
	return GROUPS_CACHE.use(`user/${userId}/primary`, () =>
		request<PrimaryGroupResponse | null>(`${GROUPS_BASE}/users/${userId}/groups/primary/role`)
			.then(data => {
				if (data)
					return getGroup(data.group.id).then(group => [group, data.role]);
				return null;
			}),
		3600000
	);
}

interface PrimaryGroupResponse {
	role: {
		id: number
		name: string
		rank: number
	}
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