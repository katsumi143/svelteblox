<script lang="ts">
	import { Button } from '@voxelified/voxeliface';

	import { t } from '../localisation';
	import { USERS_CACHE, reactiveAccount, getModerationNotice } from '../api/users';

	import Modal from './Modal.svelte';
	import Loading from './Loading.svelte';
	import Description from './Description.svelte';

	import X from '../icons/X.svelte';
	import Check from '../icons/Check.svelte';
	import Search from '../icons/Search.svelte';
	import Question from '../icons/Question.svelte';
	import Hourglass from '../icons/Hourglass.svelte';
	import RobloxIcon from '../icons/RobloxIcon.svelte';

	const notice = getModerationNotice();
	const canReactive = notice.then(notice => Date.parse(notice.endDate) - Date.now() <= 1500);

	let modal = false;
	let timeout = false;
	let reactivating = false;
	const reactivate = () => {
		reactivating = true;
		reactiveAccount().then(() => {
			USERS_CACHE.invalidateAll();
			location.reload();
		});
	};
	const openModal = () => {
		modal = timeout = true;
		setTimeout(() => timeout = false, 15000);
	};
</script>

<div class="notice">
	{#await notice then notice}
		{#await canReactive then canReactive}
			<h1>{$t(`mod_notice.title.${notice.punishmentTypeDescription}`)}</h1>
			<Description input={notice.messageToUser} disableEmbeds/>
			<div class="separator"/>
			<div class="detail">
				<Search/>
				<p>{$t('mod_notice.reviewed', [notice.beginDate])}</p>
			</div>
			<div class="detail">
				{#if canReactive}
					<Check/>
				{:else}
					<Hourglass/>
				{/if}
				<p>{$t('mod_notice.ends', [notice.endDate])}</p>
			</div>
			<div class="separator"/>
			<a class="link" href="https://www.roblox.com/not-approved" target="_blank">
				<Question/>
				{$t('mod_notice.details')}
			</a>
			<a class="link" href="https://www.roblox.com/info/community-guidelines" target="_blank">
				<RobloxIcon/>
				{$t('mod_notice.guidelines')}
			</a>
			<div class="buttons">
				{#if canReactive}
					<Button on:click={openModal}><Check/>{$t('mod_notice.reactive')}</Button>
				{/if}
				<Button><X/>{$t('user_action.other.logout')}</Button>
			</div>
		{/await}
	{/await}
</div>

{#if modal}
	<Modal autoOpen>
		<h1>{$t('modal.wait')}</h1>
		<p>{$t('mod_notice.modal')}</p>
		<a class="link" class:timeout href="https://www.roblox.com/info/terms" target="_blank">
			<RobloxIcon/>
			{$t('mod_notice.terms')}
		</a>
		<a class="link" class:timeout href="https://www.roblox.com/info/community-guidelines" target="_blank">
			<RobloxIcon/>
			{$t('mod_notice.guidelines')}
		</a>
		<div class="buttons">
			<Button on:click={reactivate} disabled={reactivating || timeout}>
				<Check/>
				{$t('mod_notice.agree')}
			</Button>
			<Button on:click={() => modal = false} disabled={reactivating || timeout}>
				<X/>
				{$t('action.cancel')}
			</Button>
			{#if reactivating || timeout}
				<Loading size={24}/>
			{/if}
		</div>
	</Modal>
{/if}

<style lang="scss">
	.notice {
		width: 75%;
		margin: auto;
		padding: 24px;
		background: var(--background-secondary);
		border-radius: 16px;
		h1 {
			margin: 0;
			font-size: 2.5em;
		}
		:global(.description) {
			margin-top: 16px;
		}
		.separator {
			width: 100%;
			height: 1px;
			margin: 16px 0;
			background: var(--border-secondary);
		}
		.detail {
			gap: 12px;
			width: fit-content;
			display: flex;
			position: relative;
			align-items: end;
			margin-bottom: 12px;
			p {
				color: var(--color-tertiary);
				margin: 0;
				white-space: nowrap;
			}
		}
	}
	.link {
		gap: 8px;
		display: flex;
		align-items: center;
		margin-bottom: 8px;
		&:last-child {
			margin: 0;
		}
		&.timeout {
			animation: 1s infinite alternate timeout;
		}
	}
	.buttons {
		gap: 8px;
		display: flex;
		margin-top: 16px;
		align-items: center;
	}
	:global(dialog p) {
		color: var(--color-tertiary);
		margin-bottom: 32px;
	}

	@keyframes timeout {
		0% {
			color: var(--color-primary)
		}
		100% {
			color: var(--color-tertiary);
		}
	}
</style>