import { z } from 'zod';
import { writable } from 'svelte/store';
import type { ZodEnum } from 'zod';
import { CLIENT_CHANNELS } from './constants';

function setting<T extends [string, ...string[]]>(id: string, schema: ZodEnum<T>, initial: z.util.noUndefined<T[number]>) {
	const itemId = `setting_${id}`;
	const obj = writable(schema.default(initial).catch(initial).parse(localStorage.getItem(itemId)));
	obj.subscribe(value => localStorage.setItem(itemId, value.toString()));

	return obj;
}

export const clientChannel = setting('clientChannel', z.enum(CLIENT_CHANNELS), CLIENT_CHANNELS[0]);