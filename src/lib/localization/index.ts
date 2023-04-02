import data from './data';
import { derived, writable } from 'svelte/store';

export const locale = writable('en-AU');
export const locales = Object.keys(data);

export type Values = Iterable<any> | Record<string, any>

const numFormatter = new Intl.NumberFormat();
export function translate(locale: string, key: string, values: Values) {
	let text = data[locale][key];
	if (typeof text !== 'string')
		return key;

	text = text.replaceAll(/{(.*)}/g, (t: string, k: string) => {
		const split = k.split('|');
		const split2 = split[0].split('??');
		const formatType = split[1];

		let value = values as any;
		for (const name of split2[0].split('.'))
			value = value[name];
		
		let finalValue: string = value ?? split2[1] ?? t;
		if (formatType === 'number')
			finalValue = numFormatter.format(parseInt(finalValue));
		else if (formatType === 'description')
			finalValue = finalValue.replace(/(?:http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+/g, url => {
				const replaced = url.replace(/(?:http(s)?:\/\/)(www\.)?roblox\.com/g, '');
				return `<a href="${replaced}" target="${replaced === url ? '_blank' : '_self'}">${url}</a>`
			});

		return finalValue;
	});
	text = text.replaceAll(/\$\((.*)\)/g, (_, p1) => {
		const [key, values] = p1.split(', ');
		return translate(locale, key, values);
	});

	return text;
}

export const t = derived(locale, ($locale) => (key: string, vars: Values = []) =>
	translate($locale, key, vars)
);