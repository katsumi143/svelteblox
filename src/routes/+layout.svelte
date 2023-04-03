<script lang="ts">
	import '@voxelified/voxeliface/styles.scss';
	import Logo from '$lib/components/TextLogo.svelte';
	import { t } from '$lib/localization';
	import { Header } from '@voxelified/voxeliface';
	import PageLoader from '$lib/components/PageLoader.svelte';
	import { onMount } from 'svelte';
	import { pwaInfo } from 'virtual:pwa-info';
	import { Settings, defaultSettings } from 'svelte-contextmenu';
	onMount(async () => {
		if (pwaInfo) {
			const { registerSW } = await import('virtual:pwa-register');
			registerSW({
				immediate: true,
				onRegistered(r) {
					console.log(`SW Registered: ${r}`);
				},
				onRegisterError(error) {
					console.log('SW registration error', error);
				},
				onOfflineReady() {
					console.log('offline ready');
				}
			});
		}
	});

	const menuSettings = new Settings();
	menuSettings.Menu.Class.push('theme-dark');

	defaultSettings.set(menuSettings);

	$: webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : '';
</script>

<div class="app theme-dark">
	<Header>
		<a href="/" class="logo"><Logo/></a>
		<a href="/" class="nav-link">{$t('home')}</a>
		<a href="/groups" class="nav-link">{$t('groups')}</a>
	</Header>
	<main class="app-content">
		<slot/>
		<footer>
			svelte svelte svelte blox blox blox
			<a href="/">placeholder</a>
		</footer>
	</main>
</div>

<PageLoader/>

<svelte:head>
	{@html webManifest}
</svelte:head>

<style lang="scss">
	.app {
		display: flex;
		min-height: 100vh;
		background: var(--background-primary);
		flex-direction: column;
		.app-content {
			display: flex;
			overflow: auto;
			flex-direction: column;
		}
	}
	:global(.theme-dark) {
		--color-secondary: hsl(0 0% 70%);
		--color-tertiary: hsl(0 0% 80%);
		--background-secondary: hsl(0 0% 40%);
		--background-tertiary: hsl(0 0% 30%);
	}
	:global(body) {
		overflow: hidden auto;
	}

	:global(header) {
		display: flex;
	}
	.nav-link {
		color: var(--color-primary);
		margin: 14px 12px;
		text-decoration: none;
	}

	:global(a) {
		color: var(--color-primary);
		text-decoration: none;

		&:hover { text-decoration: underline; }
	}

	:global(.context-menu) {
		display: none;
		min-width: 220px;
		pointer-events: none;
	}
	:global(.context-menu.show) {
		border: 1px solid var(--background-secondary);
		display: flex;
		padding: 8px 12px;
		background: var(--background-primary);
		box-shadow: 0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2);
		white-space: nowrap;
		border-radius: 6px;
		pointer-events: all;
		flex-direction: column;
		list-style-type: none;
	}
	:global(.context-menu p) {
		color: var(--color-tertiary);
		margin: 0 8px;
		font-size: .8em;
		line-height: 24px;
		font-family: var(--font-primary);
	}
	:global(.context-menu li) {
		display: flex;
	}
	:global(.context-menu-item) {
		gap: .75em;
		width: 100%;
		color: var(--color-primary);
		border: none;
		cursor: default;
		display: flex;
		padding: 8px;
		font-size: .8em;
		background: none;
		transition: background .25s, box-shadow .25s;
		font-weight: 450;
		font-family: var(--font-primary);
		border-radius: 4px;
		text-decoration: none;
		&:hover {
			box-shadow: var(--button-shadow);
			background: var(--button-background);
			text-decoration: none;
		}
	}
	:global(.context-menu-divider) {
		width: 100%;
		height: 1px;
		border: none;
		margin: 4px 0;
		background: var(--background-tertiary);
	}

	footer {
		gap: 4px;
		color: var(--color-secondary);
		display: flex;
		padding: 40px 24px;
		margin-top: auto;
		background: var(--background-header);
		flex-direction: column;
		justify-content: center;
		a {
			color: var(--color-tertiary);
			text-decoration: none;
		}
	}
</style>