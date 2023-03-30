import { request } from '.';
import { GAMES_BASE2 } from './games';
import { THUMBNAILS_BASE } from './images';
import type { User, Friend, ImageData, ApiDataList, ExperienceV2, UserPresence, ExperienceCreator } from './types';
export const USERS_BASE = 'https://users.roblox.com/v1';
export const FRIENDS_BASE = 'https://friends.roblox.com/v1';

export function getUser(id: string | number) {
	return request<User>(`https://users.roblox.com/v1/users/${id}`);
}
export function getUserFriends(id: string | number) {
	return request<ApiDataList<Friend>>(`${FRIENDS_BASE}/users/${id}/friends`)
		.then(data => data.data);
}
export function getUserFriendCount(id: string | number) {
	return request<{ count: number }>(`${FRIENDS_BASE}/users/${id}/friends/count`)
		.then(data => data.count);
}
export function getUserFollowerCount(id: string | number) {
	return request<{ count: number }>(`${FRIENDS_BASE}/users/${id}/followers/count`)
		.then(data => data.count);
}
export function getUserFollowingCount(id: string | number) {
	return request<{ count: number }>(`${FRIENDS_BASE}/users/${id}/followings/count`)
		.then(data => data.count);
}

export function getUserFavourites(id: string | number) {
	return request<ApiDataList<ExperienceV2>>(`${GAMES_BASE2}/users/${id}/favorite/games`)
		.then(data => data.data);
}

export function getUserIcon(id: string | number): Promise<ImageData | undefined> {
	return getUserIcons([id]).then(data => data[0]);
}
export function getUserIcons(ids: (string | number)[]) {
	return request<ApiDataList<ImageData>>(`${THUMBNAILS_BASE}/users/avatar-headshot?userIds=${ids.join(',')}&format=Png&size=150x150`)
		.then(data => data.data);
}

export function getUserFullBodies(ids: (string | number)[]) {
	return request<ApiDataList<ImageData>>(`${THUMBNAILS_BASE}/users/avatar?userIds=${ids.join(',')}&format=Png&size=250x250`)
		.then(data => data.data);
}

export function getUserPresences(userIds: (string | number)[]) {
	return request<{
		userPresences: UserPresence[]
	}>(`https://presence.roblox.com/v1/presence/users`, 'POST', { userIds })
		.then(data => data.userPresences);
}

export function getCurrentUser() {
	return request<{
		id: number
		name: string
		displayName: string
	}>(`${USERS_BASE}/users/authenticated`);
}