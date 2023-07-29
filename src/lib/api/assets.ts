import Cache from '../cache';
import { request } from '.';
import { getThumbnails } from './images';
import type { Id, ImageData, ApiDataList, AssetDetails } from './types';
export const ASSETS_CACHE = new Cache('assets');

export function getAssetDetails(assetIds: Id[]) {
	return request<ApiDataList<AssetDetails>>(`https://apis.roblox.com/toolbox-service/v1/items/details?assetIds=${assetIds.join(',')}`)
		.then(response => response.data);
}

export function getAssetIcon(assetId: Id): Promise<ImageData | undefined> {
	return ASSETS_CACHE.use(`asset/${assetId}/icon`, () => getAssetIcons([assetId]).then(data => data[0]), 3600000);
}

export function getAssetIcons(assetIds: Id[]) {
	if (!assetIds.length)
		return Promise.resolve([]);
	return getThumbnails(assetIds, 'assets?assetIds=%IDS%&format=Png&size=150x150&returnPolicy=Placeholder', 3600000);
}