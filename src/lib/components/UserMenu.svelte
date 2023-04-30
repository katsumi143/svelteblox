<script lang="ts">
	import { t } from '$lib/localisation';
	import ContextMenu, { Item } from 'svelte-contextmenu';

	import ClipboardPlus from '$lib/icons/ClipboardPlus.svelte';

	export let id: number;
	export let name: string;
	export let displayName: string;

	export let contextMenu: ContextMenu;
</script>

<slot/>
<ContextMenu bind:this={contextMenu}>
	<p>{displayName} (@{name})</p>
	<Item href={`https://roblox.com/users/${id}/profile`} target="_blank">{$t('action.view_roblox')}</Item>
	<Item on:click={() => navigator.clipboard.writeText(id.toString())}><ClipboardPlus/>{$t('action.copy_id')}</Item>
</ContextMenu>