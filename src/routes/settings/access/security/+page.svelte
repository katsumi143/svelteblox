<script lang="ts">
	import { get } from 'svelte/store';
	import { Button } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { pinLocked } from '$lib/api/auth';
	import { promptPinUnlock, confirmPassword } from '$lib/store';
	import { Update2FAEmailMethodEnabledResult } from '$lib/api/enums';
	import { get2FASecurityKeys, get2FAConfiguration, update2FAEmailMethodEnabled } from '$lib/api/misc';

	import Radio from '$lib/components/Radio.svelte';

	import Phone from '$lib/icons/Phone.svelte';
	import PlusLg from '$lib/icons/PlusLg.svelte';
	import Envelope from '$lib/icons/Envelope.svelte';
	import ShieldLock from '$lib/icons/ShieldLock.svelte';
	import PencilSquare from '$lib/icons/PencilSquare.svelte';
	// TODO: implement captcha feature
	/*let oldPassword = '';
	let newPassword = '';
	let newPassword2 = '';
	let passwordError: ChangePasswordResult | null = null;
	let updatingPassword = false;

	const updatePassword = async () => {
		if (newPassword !== newPassword2)
			return passwordError = ChangePasswordResult.NewPasswordMismatch;
		updatingPassword = !(passwordError = null);

		const result = await changePassword(oldPassword, newPassword);
		if (result === ChangePasswordResult.Success)
			updatingPassword = !(newPassword2 = newPassword = oldPassword = '');
		else
			updatingPassword = !(passwordError = result);
	};*/

	let updatingEmail = false;
	const toggleEmail = async (enabled: boolean) => {
		updatingEmail = true;
		if (get(pinLocked))
			await promptPinUnlock();
			
		const password = await confirmPassword();
		const result = await update2FAEmailMethodEnabled(!enabled, password);
		if (result === Update2FAEmailMethodEnabledResult.Success)
			return location.reload();

		// TODO: implement error handling
		updatingEmail = false;
		console.error(Update2FAEmailMethodEnabledResult[result]);
	};

	const twoFactorConfig = get2FAConfiguration();
	const securityKeys = twoFactorConfig
		.then(config => config.methods.some(m => m.mediaType === 'SecurityKey' && m.enabled) ? get2FASecurityKeys() : Promise.resolve([]));

	const authLink = 'https://www.roblox.com/my/account#!/security:~:text=Authenticator%20App';
</script>

<div class="main">
	<h1>{$t('settings.access.security.password')}</h1>
	<p class="summary">coming one day soon...</p>

	<!--<p class="input-label">{$t('settings.access.security.password.old')}</p>
	<TextInput type="password" bind:value={oldPassword}/>

	<p class="input-label">{$t('settings.access.security.password.new')}</p>
	<TextInput type="password" bind:value={newPassword}/>

	<p class="input-label">{$t('settings.access.security.password.new2')}</p>
	<TextInput type="password" bind:value={newPassword2}/>

	{#if passwordError}
		<p class="error">{$t(`settings.access.security.password.result.${passwordError}`)}</p>
	{/if}
	<div class="input-row">
		<Button on:click={updatePassword} disabled={updatingPassword}>
			<Check/>{$t('settings.access.security.password.update')}
		</Button>
		<a href="https://en.help.roblox.com/hc/en-us/articles/203313070-I-Forgot-My-Password" target="_blank">
			{$t('settings.access.security.password.forgot')}
		</a>
	</div>-->
	<h1>{$t('settings.access.security.2fa')}</h1>
	<p class="summary">{$t('settings.access.security.2fa.summary')}</p>

	<div class="two-factor-methods">
		{#await twoFactorConfig then config}
			{#each config.methods.sort((a, b) => a.mediaType.localeCompare(b.mediaType)) as item}
				<div class="item">
					{#if item.mediaType === 'Authenticator'}
						<Phone size={32}/>
					{:else if item.mediaType === 'Email'}
						<Envelope size={32}/>
					{:else}
						<ShieldLock size={32}/>
					{/if}
					<div class="details">
						<h1>
							{$t(`2fa.method.${item.mediaType}`)}
							{#if item.enabled}
								<p class="tag" style="--tag-color: #66cc77">
									{$t('2fa.configured')}
								</p>
							{/if}
							{#if item.mediaType === 'SecurityKey'}
								{#await securityKeys then keys}
									<p class="tag" style="--tag-color: var(--color-secondary)">
										{$t('2fa.method.SecurityKey.keys', [keys.length])}
									</p>
								{/await}
							{/if}
						</h1>
						<p>{$t(`2fa.method.${item.mediaType}.summary`)}</p>
					</div>
					{#if item.mediaType === 'Email'}
						<!-- requires captcha implementation to work!
						<p class="radio-label">{$t(`radio.${item.enabled}`)}</p>
						<Radio value={item.enabled} disabled={updatingEmail} on:change={() => toggleEmail(item.enabled)}/>
						-->
					{:else if item.mediaType === 'Authenticator'}
						{#if item.enabled}
							<Button href={authLink} target="_blank">
								<PencilSquare/>{$t('action.edit')}
							</Button>
						{:else}
							<Button href={authLink} target="_blank">
								<PlusLg/>{$t('action.setup')}
							</Button>
						{/if}
					{/if}
				</div>
			{/each}
		{/await}
	</div>
</div>

<style lang="scss">
	.main {
		padding: 32px 128px 64px 64px;
		overflow: auto;
		h1:not(:first-child) {
			margin-top: 64px;
		}
		.summary {
			color: var(--color-secondary);
			font-size: .9em;
			line-height: normal;
			margin-bottom: 32px;
		}
		.two-factor-methods {
			gap: 16px;
			display: flex;
			margin-top: 32px;
			flex-direction: column;
			.item {
				padding: 16px;
				display: flex;
				background: var(--background-secondary);
				align-items: center;
				border-radius: 16px;
				.details {
					margin-left: 16px;
					margin-right: auto;
					h1 {
						gap: 8px;
						margin: 0;
						display: flex;
						font-size: 1em;
						font-weight: 500;
						align-items: center;
						.tag {
							color: var(--tag-color);
							margin: 0;
							border: 1px solid var(--tag-color);
							padding: 2px 8px;
							font-size: .75em;
							border-radius: 16px;
						}
					}
					p {
						color: var(--color-secondary);
						margin: 2px 0 0;
						font-size: .9em;
						line-height: normal;
					}
				}
				.radio-label {
					color: var(--color-tertiary);
					margin: 0 16px;
					font-size: .9em;
				}
			}
		}
	}
</style>