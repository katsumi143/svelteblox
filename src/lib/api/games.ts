import { get } from 'svelte/store';

import Cache from '../cache';
import { locale } from '../settings';
import { request } from '.';
import { LOCALE_MAP } from '$lib/constants';
import { getThumbnails } from './images';
import type { ApiDataList, MediaAsset, Experience, ExperienceId, GameListItem, ExperienceVoting, ExperienceServer, PrivateExperienceServer } from './types';
export const GAMES_BASE = 'https://games.roblox.com/v';
export const GAMES_BASE1 = GAMES_BASE + 1;
export const GAMES_BASE2 = GAMES_BASE + 2;

export const GAMES_CACHE = new Cache('experiences');

export function getExperience(id: number): Promise<Experience | undefined> {
	return GAMES_CACHE.use(`experience_${id}`, () => getExperiences([id]).then(data => data[0]), 600000);
}
export function getExperiences(ids: (string | number)[]) {
	if (ids.length === 0)
		return Promise.resolve([]);
	return request<ApiDataList<Experience>>(`${GAMES_BASE1}/games?universeIds=${ids.join(',')}`)
		.then(data => data.data);
}
export function getExperienceVotes(ids: (string | number)[]) {
	const ids2 = ids.filter(id => !GAMES_CACHE.isValid(`votes_${id}`));
	if (ids2.length > 0)
		return request<ApiDataList<ExperienceVoting>>(`${GAMES_BASE1}/games/votes?universeIds=${ids2.join(',')}`)
			.then(data => data.data.map(data => GAMES_CACHE.set(`votes_${data.id}`, data, 600000)))
			.then(data => [...data, ...ids.filter(id => !ids2.includes(id)).map(id => GAMES_CACHE.get<ExperienceVoting>(`votes_${id}`)!)]);
	return Promise.resolve(ids.map(id => GAMES_CACHE.get<ExperienceVoting>(`votes_${id}`)!));
}

export function getExperienceId(placeId: string | number) {
	return GAMES_CACHE.use(`experience_id_${placeId}`, () =>
		request<ExperienceId>(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`)
			.then(data => data.universeId),
		-1
	);
}

export function getExperienceIcons(ids: (string | number)[]) {
	return getThumbnails(ids, 'games/icons?universeIds=%IDS%&format=Png&size=128x128');
}
export function getExperienceThumbnails(id: string | number) {
	return GAMES_CACHE.use(`thumbnail_${id}`, () => {
		const userLocale = get(locale);
		return request<ApiDataList<{
			mediaAssets: MediaAsset[]
			languageCode: string
		}>>(`https://gameinternationalization.roblox.com/v1/game-thumbnails/games/${id}/images`)
			.then(({ data }) => (data.find(d => LOCALE_MAP[d.languageCode] === userLocale) ?? data[0]).mediaAssets);
	}, 7200000);
}

export function getExperienceServers(placeId: string | number) {
	return request<ServerListResponse>(`${GAMES_BASE1}/games/${placeId}/servers/0`)
		.then(data => data.data);
}
export function getExperiencePrivateServers(placeId: string | number) {
	return request<ServerListResponse<PrivateExperienceServer>>(`${GAMES_BASE1}/games/${placeId}/private-servers`)
		.then(data => data.data);
}

export function getExperienceFriendServers(placeId: string | number) {
	return request<ServerListResponse>(`${GAMES_BASE1}/games/${placeId}/servers/Friend`)
		.then(data => data.data);
}

export interface ServerListResponse<T = ExperienceServer> {
	data: T[]
	nextPageCursor: string | null
	previousPageCursor: string | null
}

export function getRecentExperiences() {
	return GAMES_CACHE.use('recent', () =>
		request<{
			sorts: {
				name: string
				token: string
			}[]
		}>('https://games.roblox.com/v1/games/sorts?GameSortsContext=2')
			.then(data => request<{
				games: GameListItem[]
			}>(`https://games.roblox.com/v1/games/list?SortToken=${data.sorts.find(s => s.name === 'MyRecent')?.token}`))
			.then(data => data.games),
		60000
	);
}