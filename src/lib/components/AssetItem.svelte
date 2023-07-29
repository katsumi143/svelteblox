<script lang="ts">
	import { DropdownMenu } from '@voxelified/voxeliface';

	import { t } from '../localisation';

	import Avatar from './Avatar.svelte';

	import RobloxIcon from '$lib/icons/RobloxIcon.svelte';
	import ClipboardPlus from '../icons/ClipboardPlus.svelte';
	import RobloxStudio2 from '../icons/RobloxStudio2.svelte';
	export let id: number;
	export let name: string;

	export let icon: Promise<string | null> | string | null = null;

	let trigger: () => void;
</script>

<DropdownMenu bind:trigger>
	<a href={`/asset/${id}`} class="asset" slot="trigger" title={name} on:contextmenu|preventDefault={trigger}>
		<Avatar src={icon} size="md"/>
		<p>{name}</p>
	</a>
	<p>{name}</p>
	<a href={`https://www.roblox.com/library/${id}`} target="_blank">
		<RobloxIcon/>{$t('action.view_roblox')}
	</a>
	<a href={`https://create.roblox.com/marketplace/asset/${id}`} target="_blank">
		<RobloxStudio2/>{$t('action.view_creator')}
	</a>
	<div class="separator"/>
	<button type="button" on:click={() => navigator.clipboard.writeText(id.toString())}>
		<ClipboardPlus/>{$t('action.copy_id')}
	</button>
</DropdownMenu>

<style lang="scss">
	.asset {
		width: 80px;
		color: var(--color-primary);
		height: 100px;
		display: flex;
		overflow: hidden;
		position: relative;
		text-align: center;
		flex-direction: column;
		text-decoration: none;
		p {
			margin: 4px 0 0;
			overflow: hidden;
			font-size: .85em;
			line-height: 1.2;
			white-space: nowrap;
			text-overflow: ellipsis;
		}
	}
</style>