import { building } from '$app/environment';
import type { HttpMethod } from '@sveltejs/kit/types/private';

export function request<T>(targetUrl: string, method: HttpMethod = 'GET', body?: any, headers?: Record<string, string>, extraOptions?: Record<string, any>): Promise<T> {
	return fullRequest<T>(targetUrl, method, body, headers, extraOptions).then(response => response.data);
}
export function fullRequest<T>(targetUrl: string, method: HttpMethod = 'GET', body?: any, headers?: Record<string, string>, extraOptions?: Record<string, any>): Promise<{
	data: T,
	headers: Headers
}> {
	if (building || !globalThis.window)
		return Promise.resolve({ headers: new Headers() }) as any;
	return new Promise(resolve => {
		const listener = (event: MessageEvent<any>) => {
			if (event.source === window) {
				const { url, rosvelteData } = event.data;
				if (url === targetUrl && rosvelteData) {
					resolve({
						data: rosvelteData.data,
						headers: new Headers(rosvelteData.headers)
					});
					window.removeEventListener('message', listener);
				}
			}
		};
		window.addEventListener('message', listener);
		window.postMessage({
			url: targetUrl,
			options: {
				body: body ? JSON.stringify(body) : undefined,
				method,
				headers: {
					'content-type': 'application/json',
					...headers
				},
				...extraOptions
			},
			rosvelte: true
		}, '*');
	});
}