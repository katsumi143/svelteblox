<script lang="ts">
	import '@voxelified/voxeliface/styles.scss';
	import Logo from '$lib/components/TextLogo.svelte';
	import { t } from '$lib/localisation';
	import { theme } from '$lib/settings';
	import { Header } from '@voxelified/voxeliface';
	import PageLoader from '$lib/components/PageLoader.svelte';
	import { onMount } from 'svelte';
	import { pwaInfo } from 'virtual:pwa-info';
	import { SvelteToast } from '@zerodevx/svelte-toast';
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

	$: [themeName, themeColour] = $theme.split('_');
	const themeHues: Record<string, number> = {
		purple: 280
	};

	$: defaultSettings.update(() => {
		const settings = new Settings();
		settings.Menu.Class = ['contextmenu', `theme-${themeName}`];
		settings.Item.Class = ['contextmenuitem'];

		return settings;
	});

	$: webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : '';
	function themeHue(node: HTMLDivElement, color: string) {
		node.style.setProperty('--theme-hue', themeHues[color]?.toString());
		return {
			update: (color: string) =>
				node.style.setProperty('--theme-hue', themeHues[color]?.toString())
		}
	}
</script>

<div class={`app theme-${themeName}`} use:themeHue={themeColour}>
	<Header>
		<a href="/" class="logo"><Logo/></a>
		<a href="/" class="nav-link">{$t('home')}</a>
		<a href="/groups" class="nav-link">{$t('groups')}</a>
		<a href="https://create.roblox.com" class="nav-link">{$t('create')}</a>
		<a href="/settings" class="nav-link settings">{$t('settings')}</a>
	</Header>
	<main class="app-content">
		<slot/>
		<footer>
			svelte svelte svelte blox blox blox
			<a href="/">placeholder <a href="/test">⠀</a></a>
		</footer>
	</main>
	<div id="captcha"/>
	<div id="context-menu-portal"/>
	<SvelteToast options={{
		pausable: true,
		duration: 5000,
		dismissable: false
	}}/>
</div>

<PageLoader/>

<svelte:head>
	{@html webManifest}
</svelte:head>

<style lang="scss">
	:global(._toastContainer) {
		font-family: var(--font-primary);
	}
	:global(._toastMsg) {
		display: flex;
		font-size: 14px;
		:global(svg) {
			margin: auto 16px auto 0;
		}
		:global(p) {
			color: var(--color-secondary);
			margin: 4px 0 0;
			font-size: 12px;
		}
	}

	.app {
		height: 100vh;
		display: flex;
		min-height: 100vh;
		background: var(--background-primary);
		flex-direction: column;
		.app-content {
			height: 100%;
			display: flex;
			overflow: auto;
			flex-direction: column;
		}
		#captcha {
			top: 0;
			left: 0;
			position: fixed;
		}
		#context-menu-portal {
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			display: none;
			position: fixed;
			&:has(.show) {
				display: block;
			}
		}

		--toastWidth: auto;
		--toastColor: var(--color-primary);
		--toastBarHeight: 4px;
		--toastBoxShadow: 0 0 16px -12px rgb(0 0 0 / 0.25);
		--toastMsgPadding: 16px 64px 16px 20px;
		--toastBackground: var(--background-secondary);
		--toastBorderRadius: 16px;
		--toastContainerTop: auto;
		--toastBarBackground: var(--color-secondary);
		--toastContainerBottom: 16px;
	}
	:global(.theme-dark) {
		--color-tertiary: hsl(0 0% 80%);
		--background-tertiary: hsl(0 0% 30%);
	}
	:global(.theme-light) {
		--color-tertiary: hsl(0 0% 20%);
		--background-tertiary: hsl(0 0% 80%);
	}
	:global(.theme-color) {
		--color-tertiary: hsl(var(--theme-hue) 20% 80%);
		--background-tertiary: hsl(var(--theme-hue) 10% 45%);
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
		&.settings {
			margin-left: auto;
		}
	}

	:global(a) {
		color: var(--color-primary);
		text-decoration: none;

		&:hover { text-decoration: underline; }
	}

	:global(.list-header) {
		width: 100%;
		margin: 0 0 12px;
		display: flex;
		font-weight: 500;
		justify-content: space-between;
		:global(p) { margin: 0; }
		:global(a) {
			gap: 8px;
			color: var(--color-primary);
			display: flex;
			font-size: .9em;
			align-items: center;
			text-decoration: none;
			&:hover {
				text-decoration: underline;
			}
		}
	}

	:global(.contextmenu) {
		border: 1px solid var(--border-primary);
		display: none;
		padding: 8px 12px;
		min-width: 220px;
		background: var(--background-primary);
		box-shadow: rgb(22 23 24 / 35%) 0px 0px 20px 4px;
		white-space: nowrap;
		font-family: var(--font-primary);
		border-radius: 8px;
		pointer-events: none;
		flex-direction: column;
		list-style-type: none;
	}
	:global(.contextmenu.show) {
		display: flex;
		pointer-events: all;
	}
	:global(.contextmenu p) {
		color: var(--color-tertiary);
		margin: 0 8px;
		font-size: .8em;
		line-height: 24px;
	}
	:global(.contextmenu li) {
		display: flex;
	}
	:global(.contextmenuitem) {
		gap: .75em;
		width: 100%;
		color: var(--color-primary);
		border: none;
		cursor: default;
		display: flex;
		padding: 8px;
		font-size: .8em;
		background: none;
		transition: color .25s, background .25s, box-shadow .25s;
		font-weight: 450;
		font-family: var(--font-primary);
		border-radius: 4px;
		text-decoration: none;
		&:hover {
			color: var(--button-color);
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