<script lang="ts">
	import { DropdownMenu } from '@voxelified/voxeliface';

	import { t } from '../localisation';

	import UserMenu from './UserMenu.svelte';
	import VerifiedBadge from './VerifiedBadge.svelte';
	import CreatorLinkInner from './CreatorLinkInner.svelte';

	import RobloxIcon from '../icons/RobloxIcon.svelte';
	import ClipboardPlus from '../icons/ClipboardPlus.svelte';
	import BoxArrowUpRight from '../icons/BoxArrowUpRight.svelte';
	export let id: number;
	export let name: string;
	export let type: 'User' | 'Group';
	export let displayName: string = '';
	export let hasVerifiedBadge = false;

	let trigger: () => void;

	$: link = type === 'User' ? `/user/${name}` : `/group/${id}`;
</script>

<div class="container">
	{#if type === 'User'}
		<UserMenu {id} {name} {displayName} bind:trigger>
			<CreatorLinkInner {id} {name} {type} {trigger} {displayName} {hasVerifiedBadge}/>
		</UserMenu>
	{:else}
		<DropdownMenu bind:trigger>
			<CreatorLinkInner slot="trigger" {id} {name} {type} {trigger} {displayName} {hasVerifiedBadge}/>
			<p>{name}</p>
			<a href={`/user/${name}`} target="_blank">
				<BoxArrowUpRight/>
				{$t('action.open_new_tab')}
			</a>
			<div class="separator"/>
			<a href={`https://roblox.com${link}`} target="_blank">
				<RobloxIcon/>
				{$t('action.view_roblox')}
			</a>
			<button type="button" on:click={() => navigator.clipboard.writeText(id.toString())}>
				<ClipboardPlus/>
				{$t('action.copy_id')}
			</button>
		</DropdownMenu>
	{/if}
</div>

<style lang="scss">
	.container {
		display: inline-flex;
		line-height: 1;
		a {
			gap: 8px;
			display: inline-flex;
			align-items: center;
		}
	}
</style>