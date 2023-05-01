<script lang="ts">
	import { t } from '$lib/localisation';
	import ContextMenu, { Item } from 'svelte-contextmenu';

	import RobloxIcon from '$lib/icons/RobloxIcon.svelte';
	import RobloxStudio2 from '$lib/icons/RobloxStudio2.svelte';
	import ClipboardPlus from '$lib/icons/ClipboardPlus.svelte';

	export let id: number;
	export let name: string;
	export let displayName: string;

	export let contextMenu: ContextMenu;
</script>

<slot/>
<ContextMenu bind:this={contextMenu}>
	<p>{displayName ? `${displayName} (@${name})` : `@${name}`}</p>
	<Item href={`https://roblox.com/users/${id}/profile`} target="_blank">
		<RobloxIcon/>
		{$t('action.view_roblox')}
	</Item>
	<Item href={`https://devforum.roblox.com/u/${name}`} target="_blank">
		<RobloxStudio2/>
		{$t('action.view_devforum')}
	</Item>
	<Item href={`https://talent.roblox.com/creators/${id}`} target="_blank">
		<RobloxStudio2/>
		{$t('action.view_talent')}
	</Item>
	<Item on:click={() => navigator.clipboard.writeText(id.toString())}>
		<ClipboardPlus/>
		{$t('action.copy_id')}
	</Item>
</ContextMenu>