import type { HttpMethod } from '@sveltejs/kit';

import { building } from '$app/environment';
export function request<T>(targetUrl: string, method: HttpMethod = 'GET', body?: any, headers?: Record<string, string>, extraOptions?: Record<string, any>): Promise<T> {
	return fullRequest<T>(targetUrl, method, body, headers, extraOptions).then(response => response.data);
}
export function fullRequest<T>(targetUrl: string, method: HttpMethod = 'GET', body?: any, headers?: Record<string, string>, extraOptions?: Record<string, any>, ignoreErrors?: boolean): Promise<{
	data: T,
	status: number,
	headers: Headers,
	statusText: string
}> {
	if (building || !globalThis.window)
		return Promise.resolve({ headers: new Headers() }) as any;
	console.log(`[SEND]: ${method} ${targetUrl}`, body, headers);
	return new Promise((resolve, reject) => {
		const listener = (event: MessageEvent<any>) => {
			if (event.source === window) {
				const { url, rosvelteData } = event.data;
				if (url === targetUrl && rosvelteData) {
					window.removeEventListener('message', listener);

					const { data, status, statusText } = rosvelteData;
					console.log(`[RECEIVE]: ${status} ${targetUrl}`, data, rosvelteData.headers);

					if (status < 200 || status > 299) {
						if (status === 403) {
							const token = rosvelteData.headers['x-csrf-token'];
							if (token) {
								console.warn('request failed, retrying with new token');
								return fullRequest<T>(targetUrl, method, body, {
									...headers,
									'x-csrf-token': token
								}, extraOptions, ignoreErrors).then(resolve).catch(reject);
							}
						} else if (!ignoreErrors) {
							console.error('request failed', targetUrl, status, statusText, data, headers);
							return reject(new Error(`${status} ${statusText}`));
						}
					}
					resolve({
						data,
						status,
						headers: new Headers(rosvelteData.headers),
						statusText: rosvelteData
					});
				}
			}
		};
		window.addEventListener('message', listener);
		window.postMessage({
			url: targetUrl,
			options: {
				body: typeof body === 'object' ? JSON.stringify(body) : body,
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