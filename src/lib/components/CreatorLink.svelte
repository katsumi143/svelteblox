<script lang="ts">
	import { t } from '$lib/localisation';
	import ContextMenu, { Item } from 'svelte-contextmenu';

	import UserMenu from './UserMenu.svelte';
	import RobloxIcon from '$lib/icons/RobloxIcon.svelte';
	import VerifiedBadge from './VerifiedBadge.svelte';
	import ClipboardPlus from '$lib/icons/ClipboardPlus.svelte';
	export let id: number;
	export let name: string;
	export let type: 'User' | 'Group';
	export let displayName: string = '';
	export let hasVerifiedBadge = false;
	let contextMenu: ContextMenu;

	$: link = type === 'User' ? `/user/${name}` : `/groups/${id}`;
</script>

<a href={link} title={displayName ? `${displayName} (@${name})` : `@${name}`} on:contextmenu={contextMenu.createHandler()}>
	{!displayName && type === 'User' ? '@' : ''}{displayName || name}
	{#if hasVerifiedBadge}
		<VerifiedBadge/>
	{/if}
</a>

{#if type === 'User'}
	<UserMenu id={id} name={name} displayName={displayName} bind:contextMenu={contextMenu}/>
{:else}
	<ContextMenu bind:this={contextMenu}>
		<p>{name}</p>
		<Item href={`https://roblox.com${link}`} target="_blank">
			<RobloxIcon/>
			{$t('action.view_roblox')}
		</Item>
		<Item on:click={() => navigator.clipboard.writeText(id.toString())}>
			<ClipboardPlus/>
			{$t('action.copy_id')}
		</Item>
	</ContextMenu>
{/if}

<style>
	a {
		gap: 8px;
		display: inline-flex;
		align-items: center;
	}
</style>