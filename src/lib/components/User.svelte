<script lang="ts">
	import { t } from '$lib/localisation';
	import { joinUser } from '$lib/launch';
	import { UserPresenceType } from '$lib/api/enums';
	import type { ImageData, Experience, UserPresence } from '$lib/api/types';

	import Avatar from './Avatar.svelte';
	import UserMenu from './UserMenu.svelte';

	export let id: number;
	export let name: string;
	export let displayName: string;

	export let avatar: Promise<ImageData | undefined> | null = null;
	export let presence: UserPresence | null = null;
	export let experience: Promise<Experience | undefined> | null = null;

	$: presenceType = presence?.userPresenceType ?? UserPresenceType.Offline;

	let trigger: () => void;
</script>

<div class="friend-container">
	<UserMenu id={id} name={name} displayName={displayName} bind:trigger>
		<a href={`/user/${name}`} class={`friend status-${presenceType}`} title={`${displayName} (@${name}) • ${$t(`user_status.${presenceType}`)}`} on:contextmenu|preventDefault={trigger}>
			<Avatar src={avatar?.then(i => i?.imageUrl)} size="md" circle/>
			<p>{displayName}</p>
			{#if presenceType > 0 && experience}
				{#await experience then experience}
					{#if experience}
						<button class="status" type="button" title={$t('user.join', [displayName, experience.name])} on:click|preventDefault={() => joinUser(id)}>{experience.name}</button>
					{/if}
				{/await}
			{/if}
		</a>
	</UserMenu>
</div>

<style lang="scss">
	.friend-container {
		width: 80px;
		height: 148px;
		display: flex;
		overflow: hidden;
		.friend {
			width: 80px;
			color: var(--color-primary);
			display: flex;
			position: relative;
			text-align: center;
			flex-direction: column;
			text-decoration: none;
			p {
				width: 100%;
				margin: 4px 0 0;
				overflow: hidden;
				font-size: .85em;
				line-height: 1.2;
				white-space: nowrap;
				text-overflow: ellipsis;
			}
			.status {
				width: 100%;
				color: var(--color-secondary);
				border: none;
				cursor: pointer;
				margin: 2px 0 0;
				padding: 0;
				overflow: hidden;
				font-size: .75em;
				background: none;
				font-family: var(--font-primary);
				white-space: nowrap;
				text-overflow: ellipsis;
				&:hover {
					text-decoration: underline;
				}
			}
			&.status-1, &.status-2, &.status-3 {
				:before {
					top: 58px;
					right: 0;
					width: 14px;
					height: 14px;
					border: 4px solid var(--background-primary);
					content: '';
					display: block;
					position: absolute;
					background: var(--status-color);
					border-radius: 50%;
				}
				&.status-1 {
					--status-color: var(--user-status-1);
				}
				&.status-2 {
					--status-color: var(--user-status-2);
				}
				&.status-3 {
					--status-color: var(--user-status-3);
				}
			}
		}
	}
</style>