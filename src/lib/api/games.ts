import { request } from '.';
import { THUMBNAILS_BASE } from './images';
import type { ImageData, ApiDataList, Experience, ExperienceId, GameListItem, ExperienceVoting } from './types';
export const GAMES_BASE = 'https://games.roblox.com/v';
export const GAMES_BASE1 = GAMES_BASE + 1;
export const GAMES_BASE2 = GAMES_BASE + 2;

export function getExperience(id: number): Promise<Experience | undefined> {
	return getExperiences([id]).then(data => data[0]);
}
export function getExperiences(ids: (string | number)[]) {
	return request<ApiDataList<Experience>>(`https://games.roblox.com/v1/games?universeIds=${ids.join(',')}`)
		.then(data => data.data);
}
export function getExperienceVotes(ids: (string | number)[]) {
	return request<ApiDataList<ExperienceVoting>>(`https://games.roblox.com/v1/games/votes?universeIds=${ids.join(',')}`)
		.then(data => data.data);
}

const placeToExperienceCache: Record<string, number | null> = {};
export function getExperienceId(placeId: string | number) {
	const string = placeId.toString();
	const cached = placeToExperienceCache[string];
	if (cached)
		return cached;
	return request<ExperienceId>(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`)
		.then(data => placeToExperienceCache[string] = data.universeId);
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

let recentExperiences: GameListItem[];
export function getRecentExperiences() {
	return recentExperiences ? Promise.resolve(recentExperiences) : request<{
		sorts: {
			name: string
			token: string
		}[]
	}>('https://games.roblox.com/v1/games/sorts?GameSortsContext=2')
		.then(data => request<{
			games: GameListItem[]
		}>(`https://games.roblox.com/v1/games/list?SortToken=${data.sorts.find(s => s.name === 'MyRecent')?.token}`))
		.then(data => recentExperiences = data.games);
}