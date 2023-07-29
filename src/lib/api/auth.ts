import { get, derived, writable } from 'svelte/store';

import { request, fullRequest } from '.';
import { PinUnlockResult, StartQuickLoginResult } from './enums';
import type { QuickLoginResult, GetActiveSessionsResponse } from './types';
export const AUTH_BASE = 'https://auth.roblox.com/v1';

let csrfToken: string;
export function getCsrfToken() {
	if (csrfToken)
		return Promise.resolve(csrfToken);
	return fullRequest(`${AUTH_BASE}/authentication-ticket`, 'POST', null, undefined, undefined, true)
		.then(response => csrfToken = response.headers.get('x-csrf-token') as string);
}

export const pinState = writable(await getPinState());
export const pinLocked = derived(pinState, state => !state.unlockedUntil);
export const pinEnabled = derived(pinState, state => state.isEnabled);

const timeLeft = get(pinState)?.unlockedUntil;
if (timeLeft)
	setTimeout(() => pinState.set({ ...get(pinState), unlockedUntil: null }), timeLeft * 1000);

export async function lockPin() {
	if (get(pinLocked))
		return Promise.resolve(true);
	return fullRequest(`${AUTH_BASE}/account/pin/lock`, 'POST', null, {
		'x-csrf-token': await getCsrfToken()
	}, undefined, true).then(response => response.status === 200).then(success => {
		if (success)
			pinState.set({ ...get(pinState), unlockedUntil: null });
		return success;
	});
}

export async function unlockPin(pin: string | number) {
	if (!get(pinLocked))
		return true;
	return fullRequest(`${AUTH_BASE}/account/pin/unlock`, 'POST', {
		pin: pin.toString()
	}, {
		'x-csrf-token': await getCsrfToken()
	}, undefined, true).then(({ status }) => {
		if (status === 429)
			return PinUnlockResult.Ratelimited;
		else if (status === 200) {
			pinState.set({ ...get(pinState), unlockedUntil: 300 });
			setTimeout(() => pinState.set({ ...get(pinState), unlockedUntil: null }), 300000);

			return PinUnlockResult.Success;
		}
		return PinUnlockResult.Incorrect;
	});
}

export function getPinState() {
	return request<{
		isEnabled: boolean
		unlockedUntil: number | null
	}>(`${AUTH_BASE}/account/pin`);
}

export async function startQuickLogin(code: string): Promise<{ data: QuickLoginResult, result: StartQuickLoginResult.Success } | { data: null, result: StartQuickLoginResult }> {
	return fullRequest('https://apis.roblox.com/auth-token-service/v1/login/enterCode', 'POST', { code }, {
		'x-csrf-token': await getCsrfToken()
	}, undefined, true).then(({ data, status }) => {
		if (status === 429)
			return { data: null, result: StartQuickLoginResult.Ratelimited };
		else if (status === 200)
			return { data: data as any, result: StartQuickLoginResult.Success };
		return { data: null, result: StartQuickLoginResult.InvalidCode };
	});
}

export async function confirmQuickLogin(code: string) {
	return fullRequest('https://apis.roblox.com/auth-token-service/v1/login/validateCode', 'POST', { code }, {
		'x-csrf-token': await getCsrfToken()
	}, undefined, true).then(({ status }) => status === 200);
}

export function getActiveSessions() {
	return request<GetActiveSessionsResponse>('https://apis.roblox.com/token-metadata-service/v1/sessions?desiredLimit=500')
		.then(response => response.sessions);
}

export function revokeSession(sessionToken: string) {
	return request('https://apis.roblox.com/token-metadata-service/v1/logout', 'POST', {
		token: sessionToken
	});
}

export function revokeOtherSessions() {
	return request('https://auth.roblox.com/v1/logoutfromallsessionsandreauthenticate', 'POST');
}