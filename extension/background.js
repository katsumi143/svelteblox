chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(console.log);
chrome.runtime.onMessage.addListener(({ url, options }, _, sendResponse) => {
	fetch(url, options).then(async response => ({
		data: await response.json(),
		headers: Object.fromEntries(response.headers.entries())
	})).then(sendResponse);
	return true;
});