import { get } from 'svelte/store';

import Cache from '../cache';
import { pinLocked } from './auth';
import { GAMES_BASE2 } from './games';
import { getCsrfToken } from './auth';
import { promptPinUnlock } from '$lib/store';
import { request, fullRequest } from '.';
import { getThumbnails, THUMBNAILS_BASE } from './images';
import { UserRole, FriendshipStatus, ChangeDisplayNameResult } from './enums';
import type { User, Friend, ImageData, UserBadge, Friendship, RobloxBadge, ApiDataList, CurrentUser, ExperienceV2, UserPresence, ProfileExperience, PartialExperience } from './types';
export const USERS_BASE = 'https://users.roblox.com/v1';
export const FRIENDS_BASE = 'https://friends.roblox.com/v1';

export const USERS_CACHE = new Cache('users');

export function getUser(userId: string | number) {
	return USERS_CACHE.use(`user_${userId}`, () =>
		request<User>(`${USERS_BASE}/users/${userId}`)
			.then(user => {
				USERS_CACHE.set(`username_${userId}`, user.name, 86400000);
				USERS_CACHE.set(`displayname_${userId}`, user.displayName, 86400000);
				return user;
			}),
		3600000
	);
}
export function getUserIdFromUsername(username: string) {
	return USERS_CACHE.use(`userid_${username}`, () =>
		request<ApiDataList<{ id: number }>>(`${USERS_BASE}/usernames/users`, 'POST', {
			usernames: [username],
			excludeBannedUsers: false
		}).then(data => {
			const userId = data.data[0].id;
			if (!userId)
				throw new Error('uh oh!');
			
			USERS_CACHE.set(`username_${userId}`, username, 86400000);
			return userId;
		}),
		86400000
	);
}

export function getUsername(userId: string | number) {
	return USERS_CACHE.use(`username_${userId}`, () => getUser(userId).then(u => u.name), 86400000);
}
export function getDisplayName(userId: string | number) {
	return USERS_CACHE.use(`displayname_${userId}`, () => getUser(userId).then(u => u.displayName), 86400000);
}

export function getBadges(userId: string | number) {
	return USERS_CACHE.use(`badges_${userId}`, () =>
		request<ApiDataList<UserBadge>>(`https://badges.roblox.com/v1/users/${userId}/badges?limit=10&sortOrder=Desc`)
			.then(data => data.data),
		3600000
	);
}

export function getRobloxBadges(userId: string | number) {
	return USERS_CACHE.use(`roblox_badges_${userId}`, () =>
		request<RobloxBadge[]>(`https://accountinformation.roblox.com/v1/users/${userId}/roblox-badges`),
		86400000
	);
}

export function userHasBadge(userId: string | number, badgeId: string | number) {
	return USERS_CACHE.use(`badge_time_${userId}_${badgeId}`, () =>
		request<ApiDataList<{
			badgeId: number
			awardedDate: string
		}>>(`https://badges.roblox.com/v1/users/${userId}/badges/awarded-dates?badgeIds=${badgeId}`)
			.then(({ data }) => {
				if (data[0])
					return new Date(data[0].awardedDate);
				return false;
			}),
		86400000	
	)
}

interface DiscourseUser {
	user: {
		groups: [{
			id: number
		}]
	}
}

export function getUserRoles(userId: string | number, username: string, banned?: boolean): Promise<UserRole[]> {
	if (banned)
		return Promise.resolve([UserRole.Banned]);
	return USERS_CACHE.use(`roles_${userId}`, async () => {
		const roles = [];
		if ([373020309].includes(typeof userId === 'string' ? parseInt(userId) : userId))
			roles.push(UserRole.Contributor);
			
		if (userId === user.id)
			for (const role of await request<{ roles: string[] }>(`${USERS_BASE}/users/authenticated/roles`).then(d => d.roles))
				if (role === 'BetaTester')
					roles.push(UserRole.BetaTester);

		if ((await getRobloxBadges(userId)).some(badge => badge.id === 1))
			roles.push(UserRole.Staff);

		for (const group of (await request<DiscourseUser>(`https://devforum.roblox.com/u/${username}.json`)).user.groups)
			if (group.id === 50)
				roles.push(UserRole.DeveloperRelations);
			else if (group.id === 115)
				roles.push(UserRole.EventOrganiser);
		return roles;
	}, 3600000);
}

export function hasPremium(userId: string | number) {
	return USERS_CACHE.use(`premium_${userId}`, () =>
		request<boolean>(`https://premiumfeatures.roblox.com/v1/users/${userId}/validate-membership`),
		86400000
	);
}

export function getUserFriends(userId: string | number) {
	return USERS_CACHE.use(`friends_${userId}`, () =>
		request<ApiDataList<Friend>>(`${FRIENDS_BASE}/users/${userId}/friends`)
			.then(data => data.data.map(friend => {
				friend.presenceType ??= 0;
				return friend;
			})),
		60000
	);
}
export function getUserFriendCount(userId: string | number) {
	return getUserCount(userId, 'friends');
}
export function getUserFollowerCount(userId: string | number) {
	return getUserCount(userId, 'followers');
}
export function getUserFollowingCount(userId: string | number) {
	return getUserCount(userId, 'followings');
}
export function getUserCount(userId: string | number, count: string) {
	return USERS_CACHE.use(`user_count_${count}_${userId}`, () =>
		request<{ count: number }>(`${FRIENDS_BASE}/users/${userId}/${count}/count`)
			.then(data => data.count),
		86400000
	);
}

const FRIENDSHIP_MAP: Record<string, number> = {'NotFriends': 0, 'Friends': 1, 'RequestSent': 2, 'RequestReceived': 3};
export function getFriendshipStatuses(userId: number, ids: (string | number)[]): Promise<Friendship[]> {
	return request<ApiDataList<any>>(`${FRIENDS_BASE}/users/${userId}/friends/statuses?userIds=${ids.join(',')}`)
		.then(data => data.data.map(data => {
			if (typeof data.status === 'string')
				data.status = FRIENDSHIP_MAP[data.status];
			return data as {
				id: number,
				status: FriendshipStatus
			};
		}));
}

export async function requestFriendship(userId: number) {
	return request(`${FRIENDS_BASE}/users/${userId}/request-friendship`, 'POST', null, {
		'x-csrf-token': await getCsrfToken()
	});
}

export async function removeFriendship(userId: number) {
	USERS_CACHE.invalidate(`user_count_friends_${userId}`);
	return request(`${FRIENDS_BASE}/users/${userId}/unfriend`, 'POST', null, {
		'x-csrf-token': await getCsrfToken()
	});
}

export async function acceptFriendRequest(userId: number) {
	USERS_CACHE.invalidate(`user_count_friends_${userId}`);
	return request(`${FRIENDS_BASE}/users/${userId}/accept-friend-request`, 'POST', null, {
		'x-csrf-token': await getCsrfToken()
	});
}

export async function declineFriendRequest(userId: number) {
	return request(`${FRIENDS_BASE}/users/${userId}/decline-friend-request`, 'POST', null, {
		'x-csrf-token': await getCsrfToken()
	});
}

export function getUserFavourites(userId: string | number): Promise<PartialExperience[]> {
	return USERS_CACHE.use(`user_favourites_${userId}`, () =>
		request<ApiDataList<ExperienceV2>>(`${GAMES_BASE2}/users/${userId}/favorite/games`)
			.then(d => d.data.map(data => ({
				id: data.id,
				name: data.name,
				creator: data.creator,
				created: data.created,
				updated: data.updated,
				description: data.description,
				rootPlaceId: data.rootPlace.id,
				playerVisits: data.placeVisits
			}))),
		3600000
	);
}

export function getUserIcon(userId: string | number): Promise<ImageData | undefined> {
	return USERS_CACHE.use(`user_icon_${userId}`, () => getUserIcons([userId]).then(data => data[0]), 600000);
}
export function getUserIcons(userIds: (string | number)[]) {
	if (!userIds.length)
		return Promise.resolve([]);
	return getThumbnails(userIds, 'users/avatar-headshot?userIds=%IDS%&format=Png&size=150x150');
}

export function getUserFullBodies(userIds: (string | number)[]) {
	if (!userIds.length)
		return Promise.resolve([]);
	return request<ApiDataList<ImageData>>(`${THUMBNAILS_BASE}/users/avatar?userIds=${userIds.join(',')}&format=Png&size=250x250`)
		.then(data => data.data);
}

export function getUserPresences(userIds: (string | number)[]) {
	if (!userIds.length)
		return Promise.resolve([]);
	return request<{
		userPresences: UserPresence[]
	}>(`https://presence.roblox.com/v1/presence/users`, 'POST', { userIds })
		.then(data => data.userPresences);
}

export function getUserProfileExperiences(userId: string | number) {
	return request<{
		Games: ProfileExperience[]
	}>(`https://www.roblox.com/users/profile/playergames-json?userId=${userId}`)
		.then(data => data.Games);
}

export function getCurrentUser() {
	return USERS_CACHE.use('current', () => request<CurrentUser>(`${USERS_BASE}/users/authenticated`), 3600000);
}
export const user = await getCurrentUser();
if (user) {
	USERS_CACHE.set(`userid_${user.name}`, user.id, -1);
	USERS_CACHE.set(`username_${user.id}`, user.name, -1);
	USERS_CACHE.set(`displayname_${user.id}`, user.displayName, -1);
}

export function getRobux() {
	return USERS_CACHE.use('robux', () =>
		request<{ robux: number }>('https://economy.roblox.com/v1/user/currency')
			.then(data => data.robux),
		3600000
	);
}

export function getUserSocials(userId: number) {
	return USERS_CACHE.use(`socials_${userId}`, () =>
		request<{
			twitch: string | null
			twitter: string | null
			guilded: string | null
			youtube: string | null
			facebook: string | null
		}>(`https://accountinformation.roblox.com/v1/users/${userId}/promotion-channels`),
		86400000
	);
}

export function changeDisplayName(newValue: string) {
	const length = newValue.length;
	if (length < 3 || length > 20)
		return Promise.resolve(ChangeDisplayNameResult.BadLength);
	return fullRequest(`${USERS_BASE}/users/${user.id}/display-names`, 'PATCH', {
		newDisplayName: newValue
	}, undefined, undefined, true).then(({ status }) => {
		if (status === 429)
			return ChangeDisplayNameResult.Ratelimited;
		if (status === 200)
			return ChangeDisplayNameResult.Success;
		return ChangeDisplayNameResult.InvalidName;
	});
}

export async function setDescription(newValue: string) {
	if (get(pinLocked))
		if (!await promptPinUnlock())
			throw new Error('cancelled by user');
	return request<{ description: string }>('https://accountinformation.roblox.com/v1/description', 'POST', {
		description: newValue
	}).then(data => data.description);
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

export function getModerationNotice() {
	return USERS_CACHE.use('mod_notice', () =>
		request<{
			endDate: string
			beginDate: string
			punishmentId: number
			messageToUser: string
			badUtterances: {
				imageUrl: string
				abuseType: string
				utteranceText: string
			}[]
			punishedUserId: number
			punishmentTypeDescription: string
		}>('https://usermoderation.roblox.com/v1/not-approved'),
		86400000
	);
}