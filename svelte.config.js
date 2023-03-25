//import adapter from 'sveltekit-adapter-chrome-extension';
import adapter from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
export default {
	kit: {
		adapter: adapter()
	},
	extensions: ['.svelte'],
	preprocess: [
		preprocess({}),
		vitePreprocess()
	]
};