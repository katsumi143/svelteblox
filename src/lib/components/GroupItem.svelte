<script lang="ts">
	import { t } from '$lib/localisation';
	import ContextMenu, { Item } from 'svelte-contextmenu';
	import type { ImageData, PartialUser } from '$lib/api/types';
	import { getGroupIcon } from '$lib/api/groups';

	import Avatar from './Avatar.svelte';
	import VerifiedBadge from './VerifiedBadge.svelte';

	import People from '$lib/icons/PeopleFill.svelte';
	import RobloxIcon from '../icons/RobloxIcon.svelte';
	import ClipboardPlus from '../icons/ClipboardPlus.svelte';

	export let id: number;
	export let name: string
	export let icon: Promise<ImageData | undefined> | null = null;
	export let owner: PartialUser | null = null;
	export let verified: boolean;
	export let memberCount: number;
	let contextMenu: ContextMenu;
</script>

<a class="group" href={`/group/${id}`} title={$t('group.hover', [name, memberCount])} on:contextmenu={contextMenu.createHandler()}>
	<Avatar src={(icon ?? getGroupIcon(id)).then(i => i?.imageUrl)} size="lg2"/>
	<p class="name">
		{name}
		{#if verified}
			<VerifiedBadge/>
		{/if}
	</p>
	<div class="details">
		<p>{$t('creator', [owner?.displayName ?? $t('creator.none')])}</p>
		<p class="members"><People/>{$t('number_small', [memberCount])}</p>
	</div>
</a>

<ContextMenu bind:this={contextMenu}>
	<p>{name}</p>
	<Item href={`https://roblox.com/groups/${id}`} target="_blank">
		<RobloxIcon/>
		{$t('action.view_roblox')}
	</Item>
	<Item on:click={() => navigator.clipboard.writeText(id.toString())}>
		<ClipboardPlus/>
		{$t('action.copy_id')}
	</Item>
</ContextMenu>

<style lang="scss">
	.group {
		flex: 0 0 auto;
		width: 128px;
		color: var(--color-primary);
		height: 200px;
		display: flex;
		position: relative;
		flex-direction: column;
		text-decoration: none;
		.name {
			margin: 8px 0 0;
			overflow: hidden;
			max-height: 2.4em;
			font-weight: 500;
			line-height: 1.2em;
			text-overflow: ellipsis;
		}
		.details {
			gap: 2px;
			display: flex;
			flex-wrap: wrap;
			margin-top: 4px;
			justify-content: space-between;
			p {
				color: var(--color-secondary);
				margin: 0;
				font-size: .8em;
				line-height: 1.25;
				&:first-child {
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
				}
				&.members {
					gap: 4px;
					display: flex;
				}
			}
		}
	}
</style>