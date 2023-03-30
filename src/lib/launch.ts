import { csrfToken } from './api/auth';
import { fullRequest } from './api';

export async function getLaunchUri(type: 'RequestFollowUser', params: Record<string, string>) {
	const url = new URL('https://assetgame.roblox.com/game/PlaceLauncher.ashx');
	for (const [key, value] of Object.entries({ request: type, ...params }))
		url.searchParams.set(key, value);

	return url.toString();
}

export async function getTicket() {
	const ticket = await fullRequest('https://auth.roblox.com/v1/authentication-ticket', 'POST', null, {
		'x-csrf-token': csrfToken
	}).then(response => response.headers.get('rbx-authentication-ticket'));
	if (!ticket)
		throw new Error();

	return ticket;
}

export function launchClient(ticket: string, launchUri: string) {
	location.href = `roblox-player:1+launchmode:play+gameinfo:${ticket}+placelauncherurl:${encodeURIComponent(launchUri)}+channel:+LaunchExp:InApp`;
}

export async function joinUser(userId: number) {
	const ticket = await getTicket();
	const launchUri = await getLaunchUri('RequestFollowUser', { userId: userId.toString() });
	launchClient(ticket, launchUri);
}