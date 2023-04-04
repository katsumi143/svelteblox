<script lang="ts">
	import { t } from '$lib/localisation';
	import ClipboardPlus from '$lib/icons/ClipboardPlus.svelte';
	import ContextMenu, { Item } from 'svelte-contextmenu';

	export let id: number;
	export let name: string;
	export let type: 'User' | 'Group';
	export let displayName: string = '';
	let contextMenu: ContextMenu;

	$: link = `/${type.toLowerCase()}s/${id}`;
	$: formatted = `${!displayName && type === 'User' ? '@' : ''}${displayName || name}`;
</script>

<a href={link} title={`${displayName} (@${name})`} on:contextmenu={contextMenu.createHandler()}>
	{formatted}
</a>

<ContextMenu bind:this={contextMenu}>
	<p>{formatted}</p>
	<Item href={`https://roblox.com${link}`} target="_blank">{$t('action.view_roblox')}</Item>
	<Item on:click={() => navigator.clipboard.writeText(id.toString())}><ClipboardPlus/>{$t('action.copy_id')}</Item>
</ContextMenu>