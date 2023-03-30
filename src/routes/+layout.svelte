<script lang="ts">
	import '@voxelified/voxeliface/styles.scss';
	import Logo from '$lib/components/TextLogo.svelte';
	import { t } from '$lib/localization';
	import { Header } from '@voxelified/voxeliface';
	import PageLoader from '$lib/components/PageLoader.svelte';
	import { Settings, defaultSettings } from 'svelte-contextmenu';

	const menuSettings = new Settings();
	menuSettings.Menu.Class.push('theme-dark');

	defaultSettings.set(menuSettings);
</script>

<div class="app theme-dark">
	<Header>
		<a href="/" class="logo"><Logo/></a>
		<a href="/" class="nav-link">{$t('home')}</a>
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

<style lang="scss">
	.app {
		height: 100vh;
		display: flex;
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

	:global(.context-menu) {
		display: none;
		pointer-events: none;
	}
	:global(.context-menu.show) {
		gap: 4px;
		display: flex;
		padding: 8px 0;
		background: var(--background-secondary);
		white-space: nowrap;
		border-radius: 8px;
		pointer-events: all;
		flex-direction: column;
		list-style-type: none;
	}
	:global(.context-menu p) {
		color: var(--color-tertiary);
		margin: 4px 48px 4px 12px;
		font-size: .8em;
		font-family: var(--font-primary);
	}
	:global(.context-menu li) {
		display: flex;
	}
	:global(.context-menu-item) {
		width: 100%;
		color: var(--color-primary);
		border: none;
		margin: 0 8px;
		display: flex;
		padding: 4px 16px 4px 8px;
		background: var(--background-tertiary);
		font-family: var(--font-primary);
		border-radius: 4px;
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