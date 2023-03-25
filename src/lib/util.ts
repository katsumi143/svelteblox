export function getGreeting() {
	const hours = new Date().getHours();
	if (hours < 12)
		return 0;
	else if (hours <= 17)
		return 1;
	return 2;
}