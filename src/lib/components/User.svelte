<script lang="ts">
	import { t } from '$lib/localisation';
	import { joinUser } from '$lib/launch';
	import type ContextMenu from 'svelte-contextmenu';
	import type { ImageData, Experience, UserPresence } from '$lib/api/types';

	import Avatar from './Avatar.svelte';
	import UserMenu from './UserMenu.svelte';

	export let user: { id: number, name: string, displayName: string };
	export let avatar: Promise<ImageData | undefined> | null = null;
	export let presence: UserPresence | null = null;
	export let experience: Promise<Experience | undefined> | null = null;

	$: presenceType = presence?.userPresenceType ?? 0;

	let contextMenu: ContextMenu;
</script>

<a href={`/user/${user.name}`} class={`friend status-${presenceType}`} title={`${user.displayName} (@${user.name}) • ${$t(`user_status.${presenceType}`)}`} on:contextmenu={contextMenu.createHandler()}>
	<Avatar src={avatar?.then(i => i?.imageUrl)} size="md" circle/>
	<p>{user.displayName}</p>
	{#if presenceType > 0 && experience}
		{#await experience then experience}
			{#if experience}
				<button class="status" type="button" title={$t('user.join', [user, experience])} on:click|preventDefault={() => joinUser(user.id)}>{experience.name}</button>
			{/if}
		{/await}
	{/if}
</a>

<UserMenu {...user} bind:contextMenu={contextMenu}/>

<style lang="scss">
	.friend {
		width: 80px;
		color: var(--color-primary);
		height: 148px;
		overflow: hidden;
		position: relative;
		text-align: center;
		text-decoration: none;
		p {
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
				--status-color: hsl(200, 60%, 60%);
			}
			&.status-2 {
				--status-color: hsl(130, 60%, 60%);
			}
			&.status-3 {
				--status-color: hsl(35, 80%, 60%);
			}
		}
	}
</style>