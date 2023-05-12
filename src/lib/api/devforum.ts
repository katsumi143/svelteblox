import Cache from '../cache';
import { request } from '.';
import type { DiscourseTopic } from './types';
export const FORUM_BASE = 'https://devforum.roblox.com';
export const FORUM_CACHE = new Cache('forum');

export function getTopic(id: string | number) {
	return FORUM_CACHE.use(`topic-${id}`, () => request<DiscourseTopic>(`${FORUM_BASE}/t/${id}.json`), 86400000);
}