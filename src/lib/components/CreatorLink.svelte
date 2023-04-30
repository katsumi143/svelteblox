<script lang="ts">
	import { t } from '$lib/localisation';
	import ContextMenu, { Item } from 'svelte-contextmenu';

	import VerifiedBadge from './VerifiedBadge.svelte';
	import ClipboardPlus from '$lib/icons/ClipboardPlus.svelte';
	export let id: number;
	export let name: string;
	export let type: 'User' | 'Group';
	export let displayName: string = '';
	export let hasVerifiedBadge = false;
	let contextMenu: ContextMenu;

	$: link = `/${type.toLowerCase()}s/${id}`;
	$: formatted = `${!displayName && type === 'User' ? '@' : ''}${displayName || name}`;
</script>

<a href={link} title={`${displayName} (@${name})`} on:contextmenu={contextMenu.createHandler()}>
	{formatted}
	{#if hasVerifiedBadge}
		<VerifiedBadge/>
	{/if}
</a>

<ContextMenu bind:this={contextMenu}>
	<p>{formatted} ({type})</p>
	<Item href={`https://roblox.com${link}`} target="_blank">{$t('action.view_roblox')}</Item>
	<Item on:click={() => navigator.clipboard.writeText(id.toString())}><ClipboardPlus/>{$t('action.copy_id')}</Item>
</ContextMenu>

<style>
	a {
		gap: 8px;
		display: inline-flex;
		align-items: center;
	}
</style>