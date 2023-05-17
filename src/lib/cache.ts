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
			if (expire === -1 || expire > now)
				return Promise.resolve(cached[0]);
		}
		
		const result = await func();
		this.set(id, result, age, now);

		return result;
	}

	public get<T>(id: string): T | undefined {
		return this.cache[id]?.[0];
	}

	public set<T>(id: string, value: T, age: number = 0, now?: number) {
		const cantExpire = age === -1;
		if (age > 0 || cantExpire) {
			this.cache[id] = [value, cantExpire ? -1 : (now ?? Date.now()) + age];
			this.save();
		}
		return value;
	}

	public isValid(id: string) {
		const obj = this.cache[id];
		if (!obj)
			return false;

		const date = obj[1];
		return date === -1 || date > Date.now();
	}

	public invalidate(id: string) {
		this.log('invalidating', id);

		delete this.cache[id];
		this.save();
	}

	public invalidateAll() {
		this.log('invalidating all items');

		this.cache = {};
		this.save();
	}

	private log(...args: string[]) {
		console.log(`[cache:${this.id}]:`, ...args);
	}

	private save() {
		if (!building && globalThis.localStorage) {
			localStorage.setItem(this.storageName, JSON.stringify(this.cache));
			this.log('saved cache to local storage');
		}
	}

	private get storageName() {
		return `cache_${this.id}`;
	}
}