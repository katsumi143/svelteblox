<script lang="ts">
	import '@voxelified/voxeliface/styles.scss';
	import { onMount } from 'svelte';
	import { pwaInfo } from 'virtual:pwa-info';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import { Header, DropdownMenu } from '@voxelified/voxeliface';
	import { Settings, defaultSettings } from 'svelte-contextmenu';

	import { t } from '$lib/localisation';
	import { theme } from '$lib/settings';
	import { lockPin, pinLocked } from '$lib/api/auth';
	import { user, getRobux, getUserIcon } from '$lib/api/users';
	import { getGroupIcon, getPrimaryGroup } from '$lib/api/groups';

	import Logo from '$lib/components/TextLogo.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import CaretDown from '$lib/icons/CaretDown.svelte';
	import PageLoader from '$lib/components/PageLoader.svelte';
	import UnlockPinModal from '$lib/components/UnlockPinModal.svelte';

	import ExclamationTriangle from '$lib/icons/ExclamationTriangle.svelte';
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

	const robux = getRobux();
	const avatar = getUserIcon(user.id);
	const primaryGroup = getPrimaryGroup(user.id);
	const primaryGroupIcon = primaryGroup.then(group => group ? getGroupIcon(group.id) : null);

	let userMenuTrigger: () => void;
</script>

<div class={`app theme-${themeName}`} use:themeHue={themeColour}>
	<Header>
		<a href="/" class="logo"><Logo/></a>
		<a href="/" class="nav-link">{$t('home')}</a>
		<a href="/groups" class="nav-link">{$t('groups')}</a>
		<a href="https://create.roblox.com" class="nav-link">{$t('create')}</a>

		<DropdownMenu bind:trigger={userMenuTrigger}>
			<button class="user focusable" type="button" slot="trigger" on:click={userMenuTrigger}>
				<Avatar src={avatar.then(a => a?.imageUrl)} size="sm" circle/>
				<div>
					<p class="name">
						{user.displayName}
						{#if user.displayName !== user.name}
							<span>@{user.name}</span>
						{/if}
					</p>
					<p class="robux">
						{#await robux}
							...
						{:then value}
							{$t('number', [value])} Robux
						{/await}
					</p>
				</div>
				{#if !$pinLocked}
					<ExclamationTriangle size={24}/>
				{/if}
				<CaretDown/>
			</button>
			{#if !$pinLocked}
				<button type="button" on:click={lockPin}>
					<ExclamationTriangle/>
					{$t('action.lock_pin')}
				</button>
			{/if}
			<p>{user.displayName}</p>
			<a href={`/user/${user.name}`}>{$t('user_action.user.profile')}</a>
			<a href="https://create.roblox.com/dashboard/creations">{$t('user_action.user.creations')}</a>
			{#await primaryGroup then group}
				{#if group}
					<div class="separator"/>
					<p>{$t('user_action.group')}</p>
					<a href={`/groups/${group.id}`}>
						<Avatar src={primaryGroupIcon.then(i => i?.imageUrl)} size="xs" transparent/>
						{group.name}
					</a>
				{/if}
			{/await}
			<div class="separator"/>
			<a href="/settings">{$t('user_action.settings.settings')}</a>
			<div class="separator"/>
			<a href="/">{$t('user_action.other.logout')}</a>
		</DropdownMenu>
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
	<UnlockPinModal/>
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
	:global(body) {
		overflow: hidden auto;
	}

	:global(header) {
		display: flex;
		:global(.container) {
			margin-left: auto;
		}
	}
	.nav-link {
		color: var(--color-primary);
		margin: 14px 12px;
		text-decoration: none;
	}
	.user {
		color: var(--color-secondary);
		border: none;
		cursor: pointer;
		padding: 4px 8px;
		display: flex;
		background: none;
		text-align: start;
		align-items: center;
		font-family: var(--font-primary);
		border-radius: 8px;
		div {
			margin: 0 24px 0 16px;
			p {
				margin: 0;
				&.name {
					font-size: 1.2em;
					font-weight: 600;
					span {
						font-size: .75em;
						font-weight: 500;
						margin-left: 4px;
					}
				}
				&.robux {
					font-size: .85em;
					margin-top: 2px;
					font-weight: 500;
				}
			}
		}
		:global(.exclamation-triangle) {
			color: var(--color-primary);
			margin-right: 16px;
		}
		&:hover {
			background: #ffffff40;
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