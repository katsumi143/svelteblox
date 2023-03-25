import { building } from "$app/environment";
import type { HttpMethod } from "@sveltejs/kit/types/private";

export const THUMBNAILS_BASE = 'https://thumbnails.roblox.com/v1';

export function getCreatorLink(creator: UniverseCreator) {
	if (creator.type === 'Group')
		return `/groups/${creator.id}`;
	return `/users/${creator.id}`;
}

export function getCurrentUser() {
	return request<{
		id: number
		name: string
		displayName: string
	}>('https://users.roblox.com/v1/users/authenticated');
}

export const user = await getCurrentUser();
console.log('logged in as', user);

export function getSelfGroupRoles() {
	return request<ApiDataList<{
		role: {
			id: number
			name: string
			rank: number
		}
		group: Group
	}>>(`https://groups.roblox.com/v1/users/${user.id}/groups/roles`).then(data => data.data);
}

export function getUser(id: string | number) {
	return request<User>(`https://users.roblox.com/v1/users/${id}`);
}
export function getUserFriends(id: string | number) {
	return request<ApiDataList<Friend>>(`https://friends.roblox.com/v1/users/${id}/friends`)
		.then(data => data.data);
}

export function getUserIcon(id: string | number): Promise<ImageData | undefined> {
	return getUserIcons([id]).then(data => data[0]);
}
export function getUserIcons(ids: (string | number)[]) {
	return request<ApiDataList<ImageData>>(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${ids.join(',')}&format=Png&size=150x150`)
		.then(data => data.data);
}

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

export function getUniverse(id: number): Promise<Universe | undefined> {
	return request<ApiDataList<Universe>>(`https://games.roblox.com/v1/games?universeIds=${id}`)
		.then(data => data.data[0]);
}

const placeToUniverseCache: Record<string, number | null> = {};
export function getUniverseId(placeId: string | number) {
	const string = placeId.toString();
	const cached = placeToUniverseCache[string];
	if (cached)
		return cached;
	return request<UniverseId>(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`)
		.then(data => placeToUniverseCache[string] = data.universeId);
}

export function getUniverseIcons(ids: (string | number)[]) {
	return request<ApiDataList<ImageData>>(`${THUMBNAILS_BASE}/games/icons?universeIds=${ids.join(',')}&format=Png&size=128x128`)
		.then(data => data.data);
}
export function getUniverseThumbnails(id: number) {
	return request<ApiDataList<{
		error: any
		universeId: number
		thumbnails: ImageData[]
	}>>(`${THUMBNAILS_BASE}/games/multiget/thumbnails?universeIds=${id}&format=Png&size=768x432`)
		.then(data => data.data[0].thumbnails);
}

export function request<T>(targetUrl: string, method: HttpMethod = 'GET', body?: any): Promise<T> {
	if (building || !globalThis.window)
		return null as any;
	return new Promise(resolve => {
		const listener = (event: MessageEvent<any>) => {
			if (event.source === window) {
				const { url, rosvelteData } = event.data;
				if (url === targetUrl && rosvelteData) {
					resolve(rosvelteData);
					window.removeEventListener('message', listener);
				}
			}
		};
		window.addEventListener('message', listener);
		window.postMessage({
			url: targetUrl,
			options: {
				body: body ? JSON.stringify(body) : undefined,
				method,
				headers: {
					'content-type': 'application/json'
				}
			},
			rosvelte: true
		}, '*');
	});
}

export interface User {
	id: string
	name: string
	isBanned: boolean
	displayName: string
	description: string
	hasVerifiedBadge: boolean
	externalAppDisplayName: string | null
}
export interface Friend {
	id: number
	name: string
	created: string
	isOnline: boolean
	isBanned: boolean
	isDeleted: boolean
	description: null
	displayName: string
	presenceType: 1 | 2 | undefined
	friendFrequentRank: number
	friendFrequentScore: number
	externalAppDisplayName: string | null
}
export interface Group {
	id: number
	name: string
	owner: PartialUser
	shout: {
		body: string
		poster: PartialUser
		created: string
		updated: string
	}
	description: string
	memberCount: number
	hasVerifiedBadge: boolean
	isBuildersClubOnly: boolean
	publicEntryAllowed: boolean
}
export interface PartialUser {
	userId: number
	username: string
	displayName: string
	hasVerifiedBadge: boolean
}

export interface Universe {
	id: number
	name: string
	price: number | null
	genre: 'All' // missing other genres
	visits: number
	playing: number
	created: string
	updated: string
	creator: UniverseCreator
	maxPlayers: number
	isAllGenre: boolean
	sourceName: string | null
	description: string
	rootPlaceId: number
	favoritedCount: number
	copyingAllowed: boolean
	isGenreEnforced: boolean
	isFavoritedByUser: boolean
	allowedGearGenres: string[]
	sourceDescription: string | null
	universeAvatarType: 'MorphToR15' // missing other types
	allowedGearCategories: string[]
	createVipServersAllowed: boolean
	studioAccessToApisAllowed: boolean
}
export interface UniverseCreator {
	id: number
	name: string
	type: 'User' | 'Group'
	isRNVAccount: boolean
	hasVerifiedBadge: boolean
}

export interface UniverseId {
	universeId: number | null
}

export interface ImageData {
	state: 'Completed'
	targetId: number
	imageUrl: string
}
export interface ApiDataList<T> {
	data: T[]
}