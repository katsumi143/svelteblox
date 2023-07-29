<script lang="ts">
	import { Button, TextInput } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import * as toast from '$lib/toast';
	import { ChangeUsernameResult } from '$lib/api/enums';
	import { user, getUser, getRobux, USERS_CACHE, getUserIcon, changeUsername } from '$lib/api/users';

	import Modal from '$lib/components/Modal.svelte';
	import Avatar from '$lib/components/Avatar.svelte';

	import X from '$lib/icons/X.svelte';
	import Check from '$lib/icons/Check.svelte';
	import RobuxIcon from '$lib/icons/RobuxIcon.svelte';
	import PersonFill from '$lib/icons/PersonFill.svelte';
	
	const icon = getUserIcon(user.id);
	const user2 = getUser(user.id);

	let password = '';
	let username = user.name;
	let changeError: ChangeUsernameResult | null = null;
	let missingRobux = 0;
	let changingUsername = false;
	$: username = username.slice(0, 20);

	let passwordTrigger: () => void;
	const startUsernameChange = async () => {
		if (username.length < 3)
			return changeError = ChangeUsernameResult.TooShort;
		if (/^_|_$/g.test(username))
			return changeError = ChangeUsernameResult.UnderscoreAtStartOrEnd;
		if (username.match(/_/g)?.length ?? 0 > 1)
			return changeError = ChangeUsernameResult.TooManyUnderscores;
		if (!/^\w+$/g.test(username))
			return changeError = ChangeUsernameResult.InvalidUsername;

		const robux = await getRobux();
		if (robux < 1000)
			return changeError = ChangeUsernameResult.MissingRobux, missingRobux = 1000 - robux;

		changeError = null;
		passwordTrigger();
	};
	const updateUsername = async () => {
		changingUsername = !(changeError = null);
		const result = await changeUsername(username, password);
		if (result !== ChangeUsernameResult.Success) {
			changeError = result;
			changingUsername = !!(password = '');
		} else {
			USERS_CACHE.invalidate('robux');
			USERS_CACHE.invalidate('current');
			USERS_CACHE.invalidate(`user_${user.id}`);
			USERS_CACHE.invalidate(`userid_${user.name}`);
			USERS_CACHE.invalidate(`username_${user.id}`);

			location.reload();
		}
	};
</script>

<div class="main">
	<h1>{$t('settings.account')}</h1>
	<div class="profile">
		<div class="header">
			<Avatar src={icon.then(image => image?.imageUrl)} size="md" circle/>
			<div class="name">
				<h1>{user.displayName}</h1>
				<p>@{username}</p>
			</div>
			<div class="buttons">
				<Button href={`/user/${user.name}`}>
					<PersonFill/>{$t('action.view_profile')}
				</Button>
			</div>
		</div>
		{#await user2 then user2}
			<p class="details">{$t('user.joined', [user2.created])}</p>
		{/await}
	</div>

	<p class="input-label">{$t('settings.account.account.name')}</p>
	<div class="input-row">
		<TextInput bind:value={username} placeholder={$t('settings.account.account.name.placeholder')}/>
		<Button on:click={startUsernameChange} disabled={username === user.name || changingUsername}>
			<RobuxIcon/>{$t('settings.account.account.name.change')}
		</Button>
	</div>
	{#if changeError}
		<p class="error">{$t(`change_username.result.${changeError}`, [missingRobux])}</p>
	{/if}
</div>

<Modal bind:trigger={passwordTrigger}>
	<h1>{$t('change_username.password')}</h1>
	<p>{$t('change_username.password.summary')}</p>

	<TextInput bind:value={password} placeholder={$t('change_username.password')}/>
	<form method="dialog">
		<Button on:click={updateUsername} disabled={!password}>
			<Check/>{$t('action.continue')}
		</Button>
		<Button on:click={() => password = ''}>
			<X/>{$t('action.cancel')}
		</Button>
	</form>
</Modal>

<style lang="scss">
	.main {
		width: 100%;
		margin: 32px 256px 32px 64px;
		.profile {
			padding: 16px;
			position: relative;
			margin-top: 64px;
			background: var(--background-secondary);
			border-radius: 16px;
			.header {
				display: flex;
				padding: 0 0 0 128px;
				:global(.avatar) {
					top: -32px;
					left: 24px;
					position: absolute;
					box-shadow: 0 8px 16px 2px #00000040;
				}
				.name {
					h1 {
						margin: 0;
					}
					p {
						color: var(--color-secondary);
						margin: 4px 0 0;
						font-size: .9em;
					}
				}
				.buttons {
					margin-left: auto;
				}
			}
			.details {
				color: var(--color-secondary);
				margin: 24px 0 0;
				font-size: .9em;
			}
		}
		.error {
			color: #e98686;
			font-size: .9em;
			margin-top: 8px;
		}
	}
	form {
		gap: 16px;
		display: flex;
		margin-top: 16px;
	}
</style>