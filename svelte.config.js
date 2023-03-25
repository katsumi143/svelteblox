import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
export default {
	kit: {
		adapter: adapter({
			fallback: 'index.html'
		})
	},
	extensions: ['.svelte'],
	preprocess: [
		preprocess({}),
		vitePreprocess()
	]
};