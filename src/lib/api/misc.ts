import Cache from '../cache';
import { request } from '.';
import type { DiscordInvite, GuildedInvite, GetVoiceChatSettingsResponse } from './types';
export const MISC_CACHE = new Cache('misc');

export function getDiscordInvite(inviteId: string) {
	return MISC_CACHE.use(`discord_invite_${inviteId}`, () =>
		request<DiscordInvite>(`https://discord.com/api/v10/invites/${inviteId}`),
		86400000
	);
}

export function getGuildedInvite(inviteId: string) {
	return MISC_CACHE.use(`guilded_invite_${inviteId}`, () =>
		request<GuildedInvite>(`https://www.guilded.gg/api/invites/${inviteId}`),
		86400000
	);
}

export function changeVoiceChatOptIn(value: boolean) {
	return request('https://voice.roblox.com/v1/settings/user-opt-in', 'POST', `isUserOptIn=${value}`, {
		'content-type': 'application/x-www-form-urlencoded'
	});
}

export function getVoiceChatSettings() {
	return request<GetVoiceChatSettingsResponse>('https://voice.roblox.com/v1/settings');
}