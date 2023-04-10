import Cache from '../cache';
import { request } from '.';
import type { ImageData, ApiDataList } from './types';
export const IMAGES_CACHE = new Cache('images');
export const THUMBNAILS_BASE = 'https://thumbnails.roblox.com/v1';

export function getThumbnails(ids: (string | number)[], path: string, age: number = 1800000) {
	const ids2 = ids.filter(id => !IMAGES_CACHE.isValid(`image_${id}`));
	if (ids2.length > 0)
		return request<ApiDataList<ImageData>>(`${THUMBNAILS_BASE}/${path.replace('%IDS%', ids2.join(','))}`)
			.then(data => data.data.map(data => IMAGES_CACHE.set(`image_${data.targetId}`, data, age)))
			.then(data => [...data, ...ids.filter(id => !ids2.includes(id)).map(id => IMAGES_CACHE.get<ImageData>(`image_${id}`)!)]);
	else
		return Promise.resolve(ids.map(id => IMAGES_CACHE.get<ImageData>(`image_${id}`)!));
}