chrome.runtime.onMessage.addListener(({ url, options }, _, sendResponse) => {
	fetch(url, options).then(response => response.json()).then(sendResponse);
	return true;
});