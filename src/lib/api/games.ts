import Cache from '../cache';
import { request } from '.';
import { THUMBNAILS_BASE } from './images';
import type { ImageData, ApiDataList, Experience, ExperienceId, GameListItem, ExperienceVoting } from './types';
export const GAMES_BASE = 'https://games.roblox.com/v';
export const GAMES_BASE1 = GAMES_BASE + 1;
export const GAMES_BASE2 = GAMES_BASE + 2;

export const GAMES_CACHE = new Cache('experiences');

export function getExperience(id: number): Promise<Experience | undefined> {
	return GAMES_CACHE.use(`experience_${id}`, () => getExperiences([id]).then(data => data[0]), 600000);
}
export function getExperiences(ids: (string | number)[]) {
	return request<ApiDataList<Experience>>(`https://games.roblox.com/v1/games?universeIds=${ids.join(',')}`)
		.then(data => data.data);
}
export function getExperienceVotes(ids: (string | number)[]) {
	return request<ApiDataList<ExperienceVoting>>(`https://games.roblox.com/v1/games/votes?universeIds=${ids.join(',')}`)
		.then(data => data.data);
}

export function getExperienceId(placeId: string | number) {
	return GAMES_CACHE.use(`experience_id_${placeId}`, () =>
		request<ExperienceId>(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`)
			.then(data => data.universeId),
		-1
	);
}

export function getExperienceIcons(ids: (string | number)[]) {
	return request<ApiDataList<ImageData>>(`${THUMBNAILS_BASE}/games/icons?universeIds=${ids.join(',')}&format=Png&size=128x128`)
		.then(data => data.data);
}
export function getExperienceThumbnails(id: number) {
	return request<ApiDataList<{
		error: any
		universeId: number
		thumbnails: ImageData[]
	}>>(`${THUMBNAILS_BASE}/games/multiget/thumbnails?universeIds=${id}&format=Png&size=768x432`)
		.then(data => data.data[0].thumbnails);
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