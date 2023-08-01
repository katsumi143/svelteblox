<script lang="ts">
	import { DropdownMenu } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';

	import RobloxIcon from '$lib/icons/RobloxIcon.svelte';
	import RobloxStudio2 from '$lib/icons/RobloxStudio2.svelte';
	import ClipboardPlus from '$lib/icons/ClipboardPlus.svelte';
	import BoxArrowUpRight from '$lib/icons/BoxArrowUpRight.svelte';

	export let id: number;
	export let name: string;
	export let displayName: string;

	export let trigger: () => void;
</script>

<DropdownMenu bind:trigger>
	<svelte:fragment slot="trigger">
		<slot/>
	</svelte:fragment>
	<p>{displayName ? `${displayName} (@${name})` : `@${name}`}</p>
	<a href={`/user/${name}`} target="_blank">
		<BoxArrowUpRight/>
		{$t('action.open_new_tab')}
	</a>
	<div class="separator"/>
	<a href={`https://roblox.com/users/${id}/profile`} target="_blank">
		<RobloxIcon/>
		{$t('action.view_roblox')}
	</a>
	<a href={`https://devforum.roblox.com/u/${name}`} target="_blank">
		<RobloxStudio2/>
		{$t('action.view_devforum')}
	</a>
	<a href={`https://talent.roblox.com/creators/${id}`} target="_blank">
		<RobloxStudio2/>
		{$t('action.view_talent')}
	</a>
	<div class="separator"/>
	<button type="button" on:click={() => navigator.clipboard.writeText(id.toString())}>
		<ClipboardPlus/>
		{$t('action.copy_id')}
	</button>
</DropdownMenu>