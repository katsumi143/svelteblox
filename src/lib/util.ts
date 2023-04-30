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