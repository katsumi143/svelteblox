import { building } from '$app/environment';
import type { HttpMethod } from '@sveltejs/kit/types/private';

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
	return new Promise((resolve, reject) => {
		const listener = (event: MessageEvent<any>) => {
			if (event.source === window) {
				const { url, rosvelteData } = event.data;
				if (url === targetUrl && rosvelteData) {
					window.removeEventListener('message', listener);

					const { data, status, headers, statusText } = rosvelteData;
					if (status < 200 || status > 299) {
						if (status === 403) {
							const token = headers['x-csrf-token'];
							if (token) {
								console.warn('request failed, retrying with new token');
								return fullRequest<T>(targetUrl, method, body, headers, extraOptions, ignoreErrors).then(resolve).catch(reject);
							}
						} else if (!ignoreErrors) {
							console.error('request failed', targetUrl, status, statusText, data, headers);
							return reject(new Error(`${status} ${statusText}`));
						}
					}
					resolve({
						data,
						status,
						headers: new Headers(headers),
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