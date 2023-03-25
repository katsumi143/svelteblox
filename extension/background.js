chrome.runtime.onMessage.addListener(({ url, options }, _, sendResponse) => {
	console.log(url, options);
	fetch(url, options).then(response => response.json()).then(sendResponse);
	return true;
});