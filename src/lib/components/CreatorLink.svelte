<script lang="ts">
	import ClipboardPlus from '$lib/icons/ClipboardPlus.svelte';
	import ContextMenu, { Item } from 'svelte-contextmenu';

	export let id: number;
	export let name: string;
	export let type: 'User' | 'Group';
	export let displayName: string = '';
	let creatorMenu: ContextMenu;

	$: link = `/${type.toLowerCase()}s/${id}`;
	$: formatted = `${!displayName && type === 'User' ? '@' : ''}${displayName || name}`;
</script>

<a href={link} title={`${displayName} (@${name})`} on:contextmenu={creatorMenu.createHandler()}>
	{formatted}
</a>

<ContextMenu bind:this={creatorMenu}>
	<p>{formatted}</p>
	<Item href={`https://roblox.com${link}`} target="_blank">View on Roblox</Item>
	<Item on:click={() => navigator.clipboard.writeText(id.toString())}><ClipboardPlus/>Copy ID</Item>
</ContextMenu>