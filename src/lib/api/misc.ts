import { get } from 'svelte/store';

import Cache from '../cache';
import { user } from './users';
import { promptPinUnlock } from '../store';
import { request, fullRequest } from '.';
import { pinLocked, getCsrfToken } from './auth';
import { ChangePasswordResult, Update2FAEmailMethodEnabledResult } from './enums';
import type { DiscordInvite, GuildedInvite, GetUserSettingsResponse, UpdateUserSettingsPayload, GetAuthorisedAppsResponse, Get2FASecurityKeysResponse, Get2FAConfigurationResponse, GetVoiceChatSettingsResponse } from './types';
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

export function changeFacialAnimationOptIn(value: boolean) {
	return request('https://voice.roblox.com/v1/settings/user-opt-in/avatarvideo', 'POST', `isUserOptIn=${value}`, {
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

export async function changePassword(oldPassword: string, newPassword: string) {
	if (get(pinLocked))
		if (!await promptPinUnlock())
			throw new Error('cancelled by user');
	return fullRequest('https://auth.roblox.com/v2/user/passwords/change', 'POST', {
		newPassword,
		currentPassword: oldPassword
	}, {
		'x-csrf-token': await getCsrfToken()
	}, undefined, true)
		.then(({ status }) => {
			console.log(status);
			if (status === 429)
				return ChangePasswordResult.Ratelimited;
			else if (status === 403 || status === 401)
				return ChangePasswordResult.AuthFailure;
			else if (status === 200)
				return ChangePasswordResult.Success;
			return ChangePasswordResult.IncorrectPassword;
		});
}

export function get2FAConfiguration() {
	return request<Get2FAConfigurationResponse>(`https://twostepverification.roblox.com/v1/users/${user.id}/configuration`);
}

export async function get2FASecurityKeys() {
	return request<Get2FASecurityKeysResponse>(`https://twostepverification.roblox.com/v1/users/${user.id}/configuration/security-key/list`, 'POST', null, {
		'x-csrf-token': await getCsrfToken()
	}).then(response => response.credentials);
}

export async function update2FAEmailMethodEnabled(newValue: boolean, password: string) {
	return fullRequest(`https://twostepverification.roblox.com/v1/users/${user.id}/configuration/email/${newValue ? 'enable' : 'disable'}`, 'POST', {
		password
	}, {
		'x-csrf-token': await getCsrfToken()
	}).then(({ status }) => {
		if (status === 429)
			return Update2FAEmailMethodEnabledResult.Ratelimited;
		else if (status === 403 || status === 401)
			return Update2FAEmailMethodEnabledResult.AuthFailure;
		else if (status === 200)
			return Update2FAEmailMethodEnabledResult.Success;
		return Update2FAEmailMethodEnabledResult.IncorrectPassword;
	});
}