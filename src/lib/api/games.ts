import { get } from 'svelte/store';

import Cache from '../cache';
import { locale } from '../settings';
import { request } from '.';
import { LOCALE_MAP } from '$lib/constants';
import { getThumbnails, THUMBNAILS_BASE } from './images';
import type { Id, Badge, ImageData, ApiDataList, MediaAsset, Experience, ExperienceId, GameListItem, ExperienceVoting, ExperienceServer, PrivateExperienceServer } from './types';
export const GAMES_BASE = 'https://games.roblox.com/v';
export const GAMES_BASE1 = GAMES_BASE + 1;
export const GAMES_BASE2 = GAMES_BASE + 2;

export const GAMES_CACHE = new Cache('experiences');

export function getExperience(universeId: Id): Promise<Experience | undefined> {
	return GAMES_CACHE.use(`experience_${universeId}`, () => getExperiences([universeId]).then(data => data[0]), 600000);
}
export function getExperiences(experienceIds: (string | number)[]) {
	if (experienceIds.length === 0)
		return Promise.resolve([]);
	return request<ApiDataList<Experience>>(`${GAMES_BASE1}/games?universeIds=${experienceIds.join(',')}`)
		.then(data => data.data);
}
export function getExperienceVotes(experienceIds: (string | number)[]) {
	if (!experienceIds.length)
		return Promise.resolve([]);

	const ids2 = experienceIds.filter(id => !GAMES_CACHE.isValid(`votes_${id}`));
	if (ids2.length > 0)
		return request<ApiDataList<ExperienceVoting>>(`${GAMES_BASE1}/games/votes?universeIds=${ids2.join(',')}`)
			.then(data => data.data.map(data => GAMES_CACHE.set(`votes_${data.id}`, data, 600000)))
			.then(data => [...data, ...experienceIds.filter(id => !ids2.includes(id)).map(id => GAMES_CACHE.get<ExperienceVoting>(`votes_${id}`)!)]);
	return Promise.resolve(experienceIds.map(id => GAMES_CACHE.get<ExperienceVoting>(`votes_${id}`)!));
}

export function getExperienceId(placeId: string | number) {
	return GAMES_CACHE.use(`experience_id_${placeId}`, () =>
		request<ExperienceId>(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`)
			.then(data => data.universeId),
		-1
	);
}

export function getExperienceIcons(experienceIds: (string | number)[]) {
	if (!experienceIds.length)
		return Promise.resolve([]);
	return getThumbnails(experienceIds, 'games/icons?universeIds=%IDS%&format=Png&size=128x128');
}
export function getExperienceThumbnails(experienceId: string | number) {
	return GAMES_CACHE.use(`thumbnail_${experienceId}`, () => {
		const userLocale = get(locale);
		return request<ApiDataList<{
			mediaAssets: (MediaAsset & { targetId: string | number })[]
			languageCode: string
		}>>(`https://gameinternationalization.roblox.com/v1/game-thumbnails/games/${experienceId}/images`)
			.then(({ data }) => (data.find(d => LOCALE_MAP[d.languageCode] === userLocale) ?? data[0]).mediaAssets)
			.then(data => {
				if (data.length === 0)
					return getExperienceThumbnails2(experienceId)
						.then(data => data.map(img => ({
							state: img.state,
							targetId: experienceId,
							mediaAssetId: '',
							mediaAssetUrl: img.imageUrl,
							mediaAssetAltText: ''
						})));
				return data.map(asset => {
					asset.targetId = experienceId;
					return asset;
				});
			})
	}, 7200000);
}
export function getExperienceThumbnails2(experienceId: string | number) {
	return request<ApiDataList<{
		universeId: number
		thumbnails: ImageData[]
	}>>(`${THUMBNAILS_BASE}/games/multiget/thumbnails?universeIds=${experienceId}&countPerUniverse=10&size=768x432&format=Png`)
		.then(data => data.data[0].thumbnails);
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

export function getBadge(badgeId: string | number) {
	return GAMES_CACHE.use(`badge_${badgeId}`, () =>
		request<Badge>(`https://badges.roblox.com/v1/badges/${badgeId}`),
		86400000
	);
}