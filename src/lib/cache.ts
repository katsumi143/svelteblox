import { building } from '$app/environment';
export default class Cache {
	private id: string
	private cache: Record<string, [any, number]> = {}
	public constructor(id: string) {
		this.id = id;

		if (!building && globalThis.localStorage) {
			const data = localStorage.getItem(this.storageName);
			this.cache = data ? JSON.parse(data) : {};
		}
	}

	public async use<T>(id: string, func: () => Promise<T>, age: number = 0): Promise<T> {
		const now = Date.now();
		const cached = this.cache[id];
		if (cached) {
			const expire = cached[1];
			if (expire === -1 || expire > now) {
				console.log(`using cached ${id}`);
				return Promise.resolve(cached[0]);
			}
		}
		
		console.log(`${id} not cached, calling function`);
		const result = await func();
		const cantExpire = age === -1;
		if (age > 0 || cantExpire) {
			console.log(`caching ${id}`);
			this.cache[id] = [result, cantExpire ? -1 : now + age];
			this.save();
		}

		return result;
	}

	public invalidate(id: string) {
		delete this.cache[id];
		this.save();
	}

	private save() {
		localStorage.setItem(this.storageName, JSON.stringify(this.cache));
	}

	private get storageName() {
		return `cache_${this.id}`;
	}
}