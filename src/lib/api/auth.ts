import { fullRequest } from '.';

let csrfToken: string;
export function getCsrfToken() {
	if (csrfToken)
		return Promise.resolve(csrfToken);
	return fullRequest('https://auth.roblox.com/v1/authentication-ticket', 'POST')
		.then(response => csrfToken = response.headers.get('x-csrf-token') as string);
}