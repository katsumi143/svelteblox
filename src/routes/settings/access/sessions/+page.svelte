<script lang="ts">
	import { Button } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import type { ActiveSession } from '$lib/api/types';
	import { revokeSession, getActiveSessions, revokeOtherSessions } from '$lib/api/auth';

	import X from '$lib/icons/X.svelte';
	import Phone from '$lib/icons/Phone.svelte';
	import Display from '$lib/icons/Display.svelte';
	import BoxArrowRight from '$lib/icons/BoxArrowRight.svelte';

	let sessions: ActiveSession[] = [];
	getActiveSessions().then(items => sessions = items);

	let revoking: string[] = [];
	let revokingOthers = false;
	const localiseDevice = ({ agent: { os, type, value } }: ActiveSession) => {
		if (type === 'App')
			return $t('active_session.device.app', [os]);
		if (type === 'Studio')
			return $t('active_session.device.studio', [os]);
		if (type === 'Browser')
			return `${$t('active_session.browser')} ${$t(`active_session.browser.${value!}`, [os])}`;
		return $t('active_session.device.unknown', [value, os]);
	};
</script>

<div class="main">
	<h1>{$t('settings.access.sessions.header')}</h1>
	<p class="summary">{$t('settings.access.sessions.summary')}</p>

	<Button on:click={() => {
		revoking = sessions.map(item => item.token);
		revokingOthers = true;
		revokeOtherSessions()
			.then(() => (revoking = [], sessions = sessions.filter(item => item.isCurrentSession), revokingOthers = false));
	}} disabled={revokingOthers}>
		<BoxArrowRight/>{$t('settings.access.sessions.revoke_others')}
	</Button>
	<div class="sessions">
		{#await sessions then items}
			{#each items.sort((a, b) => parseInt(b.lastAccessedTimestampEpochMilliseconds) - parseInt(a.lastAccessedTimestampEpochMilliseconds)) as item}
				<div class="item">
					{#if item.agent.os === 'iOS' || item.agent.os === 'Android'}
						<Phone size={32}/>
					{:else}
						<Display size={32}/>
					{/if}
					<div class="details">
						<h1>{item.location.city}, {item.location.country} • {item.lastAccessedIp}</h1>
						<p>
							{#if item.isCurrentSession}
								{$t('active_session.you')}
							{:else}
								{localiseDevice(item)} • {$t(item.isCurrentSession ? 'active_session.you' : 'active_session.accessed', [parseInt(item.lastAccessedTimestampEpochMilliseconds)])}
							{/if}
						</p>
					</div>
					<Button on:click={() => {
						revoking = [...revoking, item.token];
						revokeSession(item.token).then(() => {
							sessions = sessions.filter(i => i !== item);
							revoking = revoking.filter(i => i !== item.token);
						});
					}} disabled={revoking.includes(item.token)}>
						<X/>{$t('action.revoke')}
					</Button>
				</div>
			{/each}
		{/await}
	</div>
</div>

<style lang="scss">
	.main {
		width: 100%;
		padding: 32px 128px 32px 64px;
		overflow: auto;
		.summary {
			color: var(--color-secondary);
			font-size: .9em;
			margin-bottom: 32px;
		}
		.sessions {
			gap: 16px;
			display: flex;
			margin-top: 16px;
			flex-direction: column;
			.item {
				display: flex;
				padding: 16px;
				background: var(--background-secondary);
				align-items: center;
				border-radius: 16px;
				.details {
					margin-left: 16px;
					margin-right: auto;
					h1 {
						margin: 0;
						font-size: 1em;
						font-weight: 500;
					}
					p {
						color: var(--color-secondary);
						margin: 4px 0 0;
						font-size: .9em;
					}
				}
			}
		}
	}
</style>