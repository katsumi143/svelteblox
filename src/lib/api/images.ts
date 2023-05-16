import Cache from '../cache';
import { request } from '.';
import { splitArray } from '$lib/util';
import type { ImageData, ApiDataList } from './types';
export const IMAGES_CACHE = new Cache('images');
export const THUMBNAILS_BASE = 'https://thumbnails.roblox.com/v1';

export async function getImages(assetIds: number[], size: '150x150') {
	const ids2 = assetIds.filter(id => !IMAGES_CACHE.isValid(`image_${id}`));
	if (ids2.length) {
		const items: ImageData[] = [];
		for (const chunk of splitArray(ids2, 100))
			items.push(...await request<ApiDataList<ImageData>>(`${THUMBNAILS_BASE}/assets?assetIds=${chunk.join(',')}&format=Png&size=${size}`)
				.then(data => data.data.map(data => IMAGES_CACHE.set(`image_${data.targetId}`, data, -1)))
				.then(data => [...data, ...assetIds.filter(id => !ids2.includes(id)).map(id => IMAGES_CACHE.get<ImageData>(`image_${id}`)!)]));
		return items;
	} else
		return assetIds.map(id => IMAGES_CACHE.get<ImageData>(`image_${id}`)!);
}
export async function getThumbnails(ids: (string | number)[], path: string, age: number = 1800000) {
	const ids2 = ids.filter(id => !IMAGES_CACHE.isValid(`image_${id}`));
	if (ids2.length) {
		const items: ImageData[] = [];
		for (const chunk of splitArray(ids2, 100))
			items.push(...await request<ApiDataList<ImageData>>(`${THUMBNAILS_BASE}/${path.replace('%IDS%', chunk.join(','))}`)
				.then(data => data.data.map(data => IMAGES_CACHE.set(`image_${data.targetId}`, data, age)))
				.then(data => [...data, ...ids.filter(id => !ids2.includes(id)).map(id => IMAGES_CACHE.get<ImageData>(`image_${id}`)!)]));
		return items;
	} else
		return ids.map(id => IMAGES_CACHE.get<ImageData>(`image_${id}`)!);
}