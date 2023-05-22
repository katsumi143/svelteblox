import data from './data';
import { locale } from '$lib/settings';
import { get, derived } from 'svelte/store';
import type { LOCALES } from '../constants';

export const sourceLocale = 'en-AU';

export type Key = keyof typeof data[typeof sourceLocale]
export type Locale = typeof LOCALES[number]
export type Values = Iterable<any> | Record<string, any>

const numFormatter = new Intl.NumberFormat();

const ti = (id: number, val: number) => `time_in.${id}_${val === 1 ? 1 : 0}`;
const ta = (id: number, val: number) => `time_ago.${id}_${val === 1 ? 1 : 0}`;
const ns = (number: number) => {
	const string = numFormatter.format(number).replace(',', '.');
	const position = string.indexOf('.');
	return [string.slice(0, position === -1 ? undefined : position > 2 ? position : position + 2)];
};
export function translate(locale: Locale, key: Key | string, values: Values) {
	let text: string = (data as any)[locale]?.[key] ?? (data as any)[sourceLocale]?.[key];
	if (typeof text !== 'string')
		return key;

	text = text.replaceAll(/{(.*?)}/g, (t: string, k: string) => {
		const split = k.split('|');
		const split2 = split[0].split('??');
		const formatType = split[1];

		let value = values as any;
		for (const name of split2[0].split('.'))
			value = value[name];
		
		let finalValue: string = value ?? split2[1] ?? t;
		if (formatType === 'number')
			finalValue = numFormatter.format(parseInt(finalValue));
		else if (formatType === 'number_small') {
			const number = parseInt(finalValue);
			if (number > 999999999999)
				return translate(locale, 'number_small.3', ns(number));
			else if (number > 999999999)
				return translate(locale, 'number_small.2', ns(number));
			else if (number > 999999)
				return translate(locale, 'number_small.1', ns(number));
			else if (number > 999)
				return translate(locale, 'number_small.0', ns(number));
			return translate(locale, 'number', [finalValue]);
		} else if (formatType === 'time_ago') {
			const diff = Date.now() - Date.parse(finalValue);
			const year = Math.round(diff / 31536000000);
			if (year > 0)
				return translate(locale, ta(5, year), [year]);

			const month = Math.round(diff / 2628000000);
			if (month > 0)
				return translate(locale, ta(4, month), [month]);

			const day = Math.round(diff / 86400000);
			if (day > 0)
				return translate(locale, ta(3, day), [day]);

			const hour = Math.round(diff / 3600000);
			if (hour > 0)
				return translate(locale, ta(2, hour), [hour]);

			const minute = Math.round(diff / 60000);
			if (minute > 0)
				return translate(locale, ta(1, minute), [minute]);

			const second = Math.round(diff / 1000);
			return translate(locale, ta(0, second), [second]);
		} else if (formatType === 'time_in') {
			const diff = Date.parse(finalValue) - Date.now();
			const year = Math.round(diff / 31536000000);
			if (year > 0)
				return translate(locale, ti(5, year), [year]);

			const month = Math.round(diff / 2628000000);
			if (month > 0)
				return translate(locale, ti(4, month), [month]);

			const day = Math.round(diff / 86400000);
			if (day > 0)
				return translate(locale, ti(3, day), [day]);

			const hour = Math.round(diff / 3600000);
			if (hour > 0)
				return translate(locale, ti(2, hour), [hour]);

			const minute = Math.round(diff / 60000);
			if (minute > 0)
				return translate(locale, ti(1, minute), [minute]);

			const second = Math.round(diff / 1000);
			return translate(locale, ti(0, second), [second]);
		}

		return finalValue;
	});
	text = text.replaceAll(/\$\((.*)\)/g, (_, p1) => {
		const [key, values] = p1.split(', ');
		return translate(locale, key, values);
	});

	return text;
}

export const t = derived(locale, ($locale) => (key: Key, vars: Values = []) =>
	translate($locale, key, vars)
);
export const trans = (key: Key, vars: Values = []) => translate(get(locale), key, vars);