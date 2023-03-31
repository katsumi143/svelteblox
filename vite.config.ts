import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import type { UserConfig } from 'vite';
export default {
	build: {
		target: 'esnext'
	},
	plugins: [sveltekit(), SvelteKitPWA({
		base: '/',
		scope: '/',
		srcDir: './src',
		manifest: {
			name: 'svelteblox',
			icons: [{
				src: '/icon.svg',
				type: 'image/svg+xml',
				sizes: '48x48 72x72 96x96 128x128 256x256 512x512',
				purpose: 'any maskable',
			}],
			scope: '/',
			start_url: '/',
			short_name: 'svelteblox'
		},
		workbox: {
			globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2}'],
			cleanupOutdatedCaches: true,
			maximumFileSizeToCacheInBytes: 4194304
		},
		strategies: 'generateSW',
		registerType: 'autoUpdate',
		injectManifest: {
			globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2}']
		}
	})]
} satisfies UserConfig;