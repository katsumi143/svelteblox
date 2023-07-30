import Cache from '../cache';
import { request } from '.';
import type { DiscordInvite, GuildedInvite, GetUserSettingsResponse, UpdateUserSettingsPayload, GetAuthorisedAppsResponse, GetVoiceChatSettingsResponse } from './types';
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

export function getUserSettings() {
	return request<GetUserSettingsResponse>('https://apis.roblox.com/user-settings-api/v1/user-settings');
}

export function updateUserSettings(payload: UpdateUserSettingsPayload) {
	return request('https://apis.roblox.com/user-settings-api/v1/user-settings', 'POST', payload);
}

export function getOAuthAuthorisations() {
	return request<GetAuthorisedAppsResponse>('https://apis.roblox.com/oauth/v1/authorizations?limit=10&sortOrder=Desc')
		.then(response => response.authorizations);
}

export function revokeOAuthAuthorisation(authorisationId: string) {
	return request(`https://apis.roblox.com/oauth/v1/authorizations/${authorisationId}`, 'DELETE');
}