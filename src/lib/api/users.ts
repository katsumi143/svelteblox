import Cache from '../cache';
import { request } from '.';
import { UserRole } from './enums';
import { GAMES_BASE2 } from './games';
import { getCsrfToken } from './auth';
import { getThumbnails, THUMBNAILS_BASE } from './images';
import type { User, Friend, ImageData, Friendship, RobloxBadge, ApiDataList, CurrentUser, ExperienceV2, UserPresence, FriendshipStatus, ProfileExperience } from './types';
export const USERS_BASE = 'https://users.roblox.com/v1';
export const FRIENDS_BASE = 'https://friends.roblox.com/v1';

export const USERS_CACHE = new Cache('users');

export function getUser(id: string | number) {
	return request<User>(`https://users.roblox.com/v1/users/${id}`);
}
export function getUsername(id: string | number) {
	return USERS_CACHE.use(`username_${id}`, () => getUser(id).then(u => u.name), 86400000);
}
export function getDisplayName(id: string | number) {
	return USERS_CACHE.use(`display_name_${id}`, () => getUser(id).then(u => u.displayName), 86400000);
}

export function getRobloxBadges(id: string | number) {
	return USERS_CACHE.use(`roblox_badges_${id}`, () =>
		request<RobloxBadge[]>(`https://accountinformation.roblox.com/v1/users/${id}/roblox-badges`),
		3600000
	);
}

interface DiscourseUser {
	user: {
		groups: [{
			id: number
		}]
	}
}

export function getUserRoles(id: string | number, username: string): Promise<UserRole[]> {
	return USERS_CACHE.use(`roles_${id}`, async () => {
		const roles = [];
		if (id === user.id)
			for (const role of await request<{ roles: string[] }>(`${USERS_BASE}/users/authenticated/roles`).then(d => d.roles)) {
				if (role === 'BetaTester')
					roles.push(UserRole.BetaTester);
			}

		if ((await getRobloxBadges(id)).some(badge => badge.id === 1))
			roles.push(UserRole.Staff);

		for (const group of (await request<DiscourseUser>(`https://devforum.roblox.com/u/${username}.json`)).user.groups)
			if (group.id === 50)
				roles.push(UserRole.DeveloperRelations);
			else if (group.id === 115)
				roles.push(UserRole.EventOrganiser);
		return roles;
	}, 3600000);
}

export function hasPremium(id: string | number) {
	return USERS_CACHE.use(`premium_${id}`, () =>
		request<boolean>(`https://premiumfeatures.roblox.com/v1/users/${id}/validate-membership`),
		3600000
	);
}

export function getUserFriends(id: string | number) {
	return USERS_CACHE.use(`friends_${id}`, () =>
		request<ApiDataList<Friend>>(`${FRIENDS_BASE}/users/${id}/friends`)
			.then(data => data.data.map(friend => {
				friend.presenceType ??= 0;
				return friend;
			})),
		60000
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

const FRIENDSHIP_MAP: Record<string, number> = {'NotFriends': 0, 'Friends': 1, 'RequestSent': 2, 'RequestReceived': 3};
export function getFriendshipStatuses(id: number, ids: (string | number)[]): Promise<Friendship[]> {
	return request<ApiDataList<any>>(`${FRIENDS_BASE}/users/${id}/friends/statuses?userIds=${ids.join(',')}`)
		.then(data => data.data.map(data => {
			if (typeof data.status === 'string')
				data.status = FRIENDSHIP_MAP[data.status];
			return data as {
				id: number,
				status: FriendshipStatus
			};
		}));
}

export async function requestFriendship(id: number) {
	return request(`${FRIENDS_BASE}/users/${id}/request-friendship`, 'POST', null, {
		'x-csrf-token': await getCsrfToken()
	});
}

export async function removeFriendship(id: number) {
	USERS_CACHE.invalidate(`user_count_friends_${id}`);
	return request(`${FRIENDS_BASE}/users/${id}/unfriend`, 'POST', null, {
		'x-csrf-token': await getCsrfToken()
	});
}

export async function acceptFriendRequest(id: number) {
	USERS_CACHE.invalidate(`user_count_friends_${id}`);
	return request(`${FRIENDS_BASE}/users/${id}/accept-friend-request`, 'POST', null, {
		'x-csrf-token': await getCsrfToken()
	});
}

export async function declineFriendRequest(id: number) {
	return request(`${FRIENDS_BASE}/users/${id}/decline-friend-request`, 'POST', null, {
		'x-csrf-token': await getCsrfToken()
	});
}

export function getUserFavourites(id: string | number) {
	return USERS_CACHE.use(`user_favourites_${id}`, () =>
		request<ApiDataList<ExperienceV2>>(`${GAMES_BASE2}/users/${id}/favorite/games`)
			.then(data => data.data),
		3600000
	);
}

export function getUserIcon(id: string | number): Promise<ImageData | undefined> {
	return USERS_CACHE.use(`user_icon_${id}`, () => getUserIcons([id]).then(data => data[0]), 600000);
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

export function getUserProfileExperiences(id: string | number) {
	return request<{
		Games: ProfileExperience[]
	}>(`https://www.roblox.com/users/profile/playergames-json?userId=${id}`)
		.then(data => data.Games);
}

export function getCurrentUser() {
	return USERS_CACHE.use('current', () => request<CurrentUser>(`${USERS_BASE}/users/authenticated`), 3600000);
}
export const user = await getCurrentUser();

export function getRobux() {
	return USERS_CACHE.use('robux', () =>
		request<{ robux: number }>('https://economy.roblox.com/v1/user/currency')
			.then(data => data.robux), 3600000
	);
}

const PRESENCE_SORT = [0, 1, 3, 2];
export function sortFriends(friends: Friend[], presences: UserPresence[]) {
	const sorted = friends.map(friend => {
		friend.presenceType = presences.find(p => p.userId === friend.id)?.userPresenceType ?? 0;
		return friend;
	}).sort((a, b) => a.displayName.localeCompare(b.displayName));
	const online = sorted.filter(friend => friend.presenceType > 0);
	const offline = sorted.filter(f => !online.includes(f));
	return [...online.sort((a, b) => PRESENCE_SORT[b.presenceType] - PRESENCE_SORT[a.presenceType]), ...offline];
}