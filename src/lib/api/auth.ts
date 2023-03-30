import { fullRequest } from '.';
import { getCurrentUser } from './users';

export const user = await getCurrentUser();
export const csrfToken = await fullRequest('https://auth.roblox.com/v1/authentication-ticket', 'POST')
	.then(response => response.headers.get('x-csrf-token') as string);