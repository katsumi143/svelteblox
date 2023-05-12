export function getGreeting() {
	const hours = new Date().getHours();
	if (hours < 12)
		return 0;
	else if (hours <= 17)
		return 1;
	return 2;
}

export function parseJson<T>(data: string): T | null {
	try {
		return JSON.parse(data);
	} catch (err) {
		return null;
	}
}

export async function replaceAsync(str: string, regex: RegExp, asyncFn: (match: string, ...args: any[]) => Promise<string>) {
    const promises: Promise<any>[] = [];
    str.replace(regex, (match, ...args) => {
        const promise = asyncFn(match, ...args);
        promises.push(promise);

		return match;
    });
    const data = await Promise.all(promises);
    return str.replace(regex, () => data.shift());
}

export function prettifyName(displayName: string, username: string) {
	if (displayName === username)
		return displayName;
	return `${displayName} (@${username})`;
}