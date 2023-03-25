const fetch = (url, options) => new Promise(resolve => {
	chrome.runtime.sendMessage(null, { url, options }, resolve);
});

window.addEventListener('message', async ({ data: { url, options, rosvelte } }) => {
	if (rosvelte) {
		const data = await fetch(url, options);
		window.postMessage({
			url,
			rosvelteData: data
		}, '*');
	}
});