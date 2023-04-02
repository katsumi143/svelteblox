import Cache from '../cache';
import { request } from '.';
import { GAMES_BASE2 } from './games';
import { getThumbnails, THUMBNAILS_BASE } from './images';
import type { User, Friend, ImageData, ApiDataList, CurrentUser, ExperienceV2, UserPresence } from './types';
export const USERS_BASE = 'https://users.roblox.com/v1';
export const FRIENDS_BASE = 'https://friends.roblox.com/v1';

export const USERS_CACHE = new Cache('users');

export function getUser(id: string | number) {
	return request<User>(`https://users.roblox.com/v1/users/${id}`);
}
export function getUserFriends(id: string | number) {
	return USERS_CACHE.use(`friends_${id}`, () =>
		request<ApiDataList<Friend>>(`${FRIENDS_BASE}/users/${id}/friends`)
			.then(data => data.data),
		600000
	);
}
export function getUserFriendCount(id: string | number) {
	return getUserCount(id, 'friends');
}
export function getUserFollowerCount(id: string | number) {
	return getUserCount(id, 'followers');
}
export function getUserFollowingCount(id: string | number) {
	return getUserCount(id, 'followings');
}
export function getUserCount(id: string | number, count: string) {
	return USERS_CACHE.use(`user_count_${count}_${id}`, () =>
		request<{ count: number }>(`${FRIENDS_BASE}/users/${id}/${count}/count`)
			.then(data => data.count),
		3600000
	);
}

export function getUserFavourites(id: string | number) {
	return request<ApiDataList<ExperienceV2>>(`${GAMES_BASE2}/users/${id}/favorite/games`)
		.then(data => data.data);
}

export function getUserIcon(id: string | number): Promise<ImageData | undefined> {
	return USERS_CACHE.use(`user_icon_${id}`, () => getUserIcons([id]).then(data => data[0]), 3600000);
}
export function getUserIcons(ids: (string | number)[]) {
	return getThumbnails(ids, 'users/avatar-headshot?userIds=%IDS%&format=Png&size=150x150');
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
	return USERS_CACHE.use('current', () => request<CurrentUser>(`${USERS_BASE}/users/authenticated`), 3600000);
}