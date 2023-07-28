chrome.runtime.onMessage.addListener(({ url, options }, _, sendResponse) => {
	console.log(url, options);
	fetch(url, options).then(async response => {
		const data = url.includes('funcaptcha') ? await response.text() : await response.json().catch(() => null);
		return {
			data,
			status: response.status,
			headers: Object.fromEntries(response.headers.entries()),
			statusText: response.statusText
		};
	}).then(sendResponse);
	return true;
});