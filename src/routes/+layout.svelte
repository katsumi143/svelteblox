<script lang="ts">
	import '@voxelified/voxeliface/styles.scss';
	import { onMount } from 'svelte';
	import { pwaInfo } from 'virtual:pwa-info';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import { Settings, defaultSettings } from 'svelte-contextmenu';
	import { Button, TextInput, DropdownMenu } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { theme } from '$lib/settings';
	import * as toast from '$lib/toast';
	import { COLOUR_THEME_HUES } from '$lib/constants';
	import { StartQuickLoginResult } from '$lib/api/enums';
	import type { QuickLoginResult } from '$lib/api/types';
	import { user, getRobux, getUserIcon } from '$lib/api/users';
	import { getGroupIcon, getPrimaryGroup, getSelfGroupRoles } from '$lib/api/groups';
	import { lockPin, pinLocked, startQuickLogin, confirmQuickLogin } from '$lib/api/auth';

	import Modal from '$lib/components/Modal.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import PageLoader from '$lib/components/PageLoader.svelte';
	import AccountNotice from '$lib/components/AccountNotice.svelte';
	import UnlockPinModal from '$lib/components/UnlockPinModal.svelte';

	import X from '$lib/icons/X.svelte';
	import Check from '$lib/icons/Check.svelte';
	import GearFill from '$lib/icons/GearFill.svelte';
	import CaretDown from '$lib/icons/CaretDown.svelte';
	import PhoneFill from '$lib/icons/PhoneFill.svelte';
	import Svelteblox from '$lib/icons/svelteblox.svelte';
	import PersonFill from '$lib/icons/PersonFill.svelte';
	import BoxArrowRight from '$lib/icons/BoxArrowRight.svelte';
	import RobloxStudio2 from '$lib/icons/RobloxStudio2.svelte';
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
	$: defaultSettings.update(() => {
		const settings = new Settings();
		settings.Menu.Class = ['contextmenu', `theme-${themeName}`];
		settings.Item.Class = ['contextmenuitem'];

		return settings;
	});

	$: webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : '';
	function themeHue(node: HTMLDivElement, color: string) {
		node.style.setProperty('--theme-hue', COLOUR_THEME_HUES[color]?.toString());
		return {
			update: (color: string) =>
				node.style.setProperty('--theme-hue', COLOUR_THEME_HUES[color]?.toString())
		}
	}

	const banned = !!(user as any).errors;

	const robux = banned ? 0 : getRobux();
	const avatar = banned ? null : getUserIcon(user.id);
	const groups = banned ? Promise.resolve([]) : getSelfGroupRoles();
	const primaryGroup = banned ? null : getPrimaryGroup(user.id);
	const primaryGroupIcon = banned ? null : primaryGroup!.then(group => group ? getGroupIcon(group[0].id) : null);

	let groupId: number;
	let userMenuTrigger: () => void;

	primaryGroup?.then(group => {
		if (group)
			groupId = group[0].id;
		else
			groups.then(g => groupId = g[0].group.id);
	});

	let quickLogging = false;
	let quickLoginCode = '';
	let quickLoginError: StartQuickLoginResult | null = null;
	let quickLoginResult: QuickLoginResult | null = null;

	let quickLoginClose: () => void;
	let quickLoginTrigger: () => void;
	$: quickLoginCode = quickLoginCode.toUpperCase().slice(0, 6);

	const quickLogin = () => {
		quickLogging = !(quickLoginError = null);
		startQuickLogin(quickLoginCode).then(({ data, result }) => {
			if (result === StartQuickLoginResult.Success)
				quickLogging = !!(quickLoginResult = data);
			else
				quickLoginError = result;
			quickLogging = false;
		});
	};
	const finishQuickLogin = () => {
		quickLogging = true;
		confirmQuickLogin(quickLoginCode).then(() => {
			quickLogging = !!(quickLoginCode = '');
			quickLoginResult = null;
			quickLoginClose();

			toast.success($t('toast.success'), $t('toast.quick_login_success'));
		});
	};
</script>

<div class={`app theme-${themeName}`} use:themeHue={themeColour}>
	<header>
		<a href="/" class="logo"><Svelteblox size={40}/></a>
		<a href="/" class="nav-link">{$t('home')}</a>
		<a href={`/group/${groupId}`} class="nav-link">{$t('groups')}</a>
		<a href="https://create.roblox.com" class="nav-link">{$t('create')}</a>

		{#if !banned}
			<DropdownMenu bind:trigger={userMenuTrigger}>
				<button class="user focusable" type="button" slot="trigger" on:click={userMenuTrigger}>
					<Avatar src={avatar?.then(a => a?.imageUrl)} size="sm" circle/>
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
				<a href={`/user/${user.name}`}>
					<PersonFill/>{$t('user_action.user.profile')}
				</a>
				<a href="https://create.roblox.com/dashboard/creations">
					<RobloxStudio2/>{$t('user_action.user.creations')}
				</a>
				<div class="separator"/>
				<button type="button" on:click={quickLoginTrigger}>
					<PhoneFill/>{$t('user_action.quick_login')}
				</button>
				{#await primaryGroup then group}
					{#if group}
						<div class="separator"/>
						<p>{$t('user_action.group')}</p>
						<a href={`/group/${group[0].id}`}>
							<Avatar src={primaryGroupIcon?.then(i => i?.imageUrl)} size="xs" transparent/>
							{group[0].name}
						</a>
					{/if}
				{/await}
				<div class="separator"/>
				<a href="/settings/account">
					<GearFill/>{$t('user_action.settings.settings')}
				</a>
				<div class="separator"/>
				<a href="/">
					<BoxArrowRight/>{$t('user_action.other.logout')}
				</a>
			</DropdownMenu>
		{/if}
	</header>
	<main class="app-content">
		{#if banned}
			<AccountNotice/>
		{:else}
			<slot/>
		{/if}
		<footer>
			<div class="header">
				<p class="name">
					<Svelteblox size={40}/>
				</p>
				<p class="oss">
					{$t('footer.oss')}
					<a href="https://github.com/katsumi143/svelteblox" target="_blank">
						{$t('footer.oss.link')}
					</a>.
				</p>
			</div>
			<div class="links">
				<p>{$t('footer.roblox')}</p>
				<a href="https://www.roblox.com" target="_blank">
					{$t('footer.roblox.website')}
				</a>
				<a href="https://en.help.roblox.com/hc/en-us/articles/115004647846-Roblox-Terms-of-Use" target="_blank">
					{$t('footer.roblox.terms')}
				</a>
				<a href="https://en.help.roblox.com/hc/en-us/articles/115004630823-Roblox-Privacy-and-Cookie-Policy" target="_blank">
					{$t('footer.roblox.privacy')}
				</a>
			</div>
			<div class="links">
				<p>{$t('footer.creator')}</p>
				<a href="https://create.roblox.com" target="_blank">
					{$t('footer.creator.dashboard')}
				</a>
				<a href="https://create.roblox.com/docs" target="_blank">
					{$t('footer.creator.documentation')}
				</a>
				<a href="https://create.roblox.com/talent" target="_blank">
					{$t('footer.creator.talent')}
				</a>
			</div>
			<div class="links">
				<p>{$t('footer.resources')}</p>
				<a href="https://setup.rbxcdn.com/RobloxStudioLauncherBeta.exe" target="_blank">
					{$t('footer.resources.studio')}
				</a>
			</div>
			<div class="links">
				<p>{$t('footer.svelteblox')}</p>
				<a href="https://github.com/katsumi143/svelteblox" target="_blank">
					GitHub
				</a>
				<a href="https://discord.com/invite/wYC5BTVJsw" target="_blank">
					Discord
				</a>
			</div>
		</footer>
	</main>
	<div id="captcha"/>
	<div id="context-menu-portal"/>
	<Modal bind:close={quickLoginClose} bind:trigger={quickLoginTrigger}>
		<h1>{$t('quick_login')}</h1>
		{#if quickLoginResult}
			<p>{$t('quick_login.confirm')}</p>
			<p class="quick-login-device"><PhoneFill/>{quickLoginResult.deviceInfo} in {quickLoginResult.location}</p>

			<div class="quick-login-buttons">
				<Button on:click={finishQuickLogin} disabled={quickLogging}>
					<Check/>{$t('action.continue')}
				</Button>
				<form method="dialog">
					<Button on:click={() => (quickLoginCode = '', quickLoginResult = null)} disabled={quickLogging}>
						<X/>{$t('action.cancel')}
					</Button>
				</form>
			</div>
		{:else}
			<p>{$t('quick_login.summary')}</p>
			{#if quickLoginError}
				<p class="error">{$t(`quick_login.error.${quickLoginError}`)}</p>
			{/if}
			<TextInput bind:value={quickLoginCode} placeholder={$t('quick_login.placeholder')}/>

			<div class="quick-login-buttons">
				<Button on:click={quickLogin} disabled={quickLogging || quickLoginCode.length !== 6}>
					<Check/>{$t('action.continue')}
				</Button>
				<form method="dialog">
					<Button on:click={() => quickLoginCode = ''} disabled={quickLogging}>
						<X/>{$t('action.cancel')}
					</Button>
				</form>
			</div>
		{/if}
	</Modal>
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

		--user-status-1: hsl(200, 60%, 60%);
		--user-status-2: hsl(130, 60%, 60%);
		--user-status-3: hsl(35, 80%, 60%);
	}
	:global(.theme-color) {
		--color-primary: hsl(var(--theme-hue) 60% 98%);
		--color-secondary: hsl(var(--theme-hue) 25% 75%);

		--background-header: hsl(var(--theme-hue) 20% 15%);
		--background-primary: hsl(var(--theme-hue) 15% 40%);
		--background-secondary: hsl(var(--theme-hue) 15% 50%);
		--background-tertiary: hsl(var(--theme-hue) 15% 53%);

		--button-background: hsl(var(--theme-hue) 30% 60%);
		--button-background-hover: hsl(var(--theme-hue) 30% 55%);
		--button-background-active: hsl(var(--theme-hue) 30% 50%);
	}
	:global(body) {
		overflow: hidden auto;
	}

	header {
		margin: 8px 8px 0;
		display: flex;
		padding: 8px 32px;
		background: var(--background-header);
		align-items: center;
		border-radius: 8px;
		:global(.container) {
			margin-left: auto;
		}
	}
	.logo {
		margin-right: 24px;
	}
	.nav-link {
		color: var(--color-primary);
		margin: 14px 16px;
		font-weight: 500;
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

	.quick-login-device {
		gap: 8px;
		color: var(--color-primary);
		display: flex;
		align-items: center;
	}
	.quick-login-buttons {
		gap: 8px;
		display: flex;
		margin-top: 16px;
	}
	.error {
		color: #e98686;
		font-size: .9em;
		margin-bottom: 8px;
	}
	footer {
		color: var(--color-secondary);
		margin: 0 8px 8px;
		display: flex;
		padding: 40px 64px;
		margin-top: auto;
		background: var(--background-header);
		border-radius: 8px;
		.header {
			.name {
				gap: 8px;
				color: var(--color-primary);
				margin: 0;
				display: flex;
				font-size: 1.25em;
				font-weight: 500;
				align-items: center;
			}
			.oss {
				font-size: .9em;
				margin-top: 8px;
			}
		}
		.links {
			gap: 4px;
			display: flex;
			margin-left: 96px;
			flex-direction: column;
			p {
				margin: 0;
				font-size: .8em;
			}
			a {
				font-size: .9em;
			}
		}
	}
</style>