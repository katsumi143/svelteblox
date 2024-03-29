<script lang="ts">
	import { DropdownMenu } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { joinExperience } from '$lib/launch';
	import type { ImageData, PartialExperience } from '$lib/api/types';
	import { getExperienceIcons, getExperienceVotes } from '$lib/api/games';

	import Avatar from '$lib/components/Avatar.svelte';

	import People from '$lib/icons/PeopleFill.svelte';
	import PlayIcon from '$lib/icons/PlayIcon.svelte';
	import ThumbsUp from '$lib/icons/ThumbsUp.svelte';
	import RobloxIcon from '$lib/icons/RobloxIcon.svelte';
	import ClipboardPlus from '$lib/icons/ClipboardPlus.svelte';
	import BoxArrowUpRight from '$lib/icons/BoxArrowUpRight.svelte';

	export let id: number;
	export let name: string
	export let icon: Promise<ImageData | undefined> | null = null;
	export let voting: PartialExperience['votes'] | null = null;
	export let playing: number | null = null;
	export let rootPlaceId: number;

	let trigger: () => void;

	const voting2 = voting ? Promise.resolve(voting) :
		getExperienceVotes([id]).then(v => v[0]);
	const rating = voting2.then(v => Math.round(v[0] / (v[0] + v[1]) * 100));

	$: href = `/experience/${id}`;
</script>

<DropdownMenu bind:trigger>
	<a slot="trigger" class="experience" {href} title={$t('experience.hover', [name, playing])} on:contextmenu|preventDefault={trigger}>
		<Avatar src={icon ? icon.then(i => i?.imageUrl) : getExperienceIcons([id]).then(i => i[0]?.imageUrl)} size="lg2"/>
		<p class="name">{name}</p>
		<div class="details">
			<p>
				<ThumbsUp/>
				{#await rating then rating}
					{Number.isNaN(rating) ? $t('experience.unrated') : `${rating}%`}
				{/await}
			</p>
			{#if typeof playing === 'number'}
				<p><People/>{$t('number', [playing])}</p>
			{/if}
		</div>
		<button type="button" class="play" title={$t('experience.play2', [name])} on:click|preventDefault={() => joinExperience(rootPlaceId)}>
			<PlayIcon size={20}/>
		</button>
	</a>
	<p>{name}</p>
	<a {href} target="_blank">
		<BoxArrowUpRight/>{$t('action.open_new_tab')}
	</a>
	<div class="separator"/>
	<a href={`https://roblox.com/games/${rootPlaceId}`} target="_blank">
		<RobloxIcon/>{$t('action.view_roblox')}
	</a>
	<div class="separator"/>
	<button type="button" on:click={() => navigator.clipboard.writeText(rootPlaceId.toString())}>
		<ClipboardPlus/>{$t('action.copy_place_id')}
	</button>
	<button type="button" on:click={() => navigator.clipboard.writeText(id.toString())}>
		<ClipboardPlus/>{$t('action.copy_universe_id')}
	</button>
</DropdownMenu>

<style lang="scss">
	.experience {
		flex: 0 0 auto;
		width: 128px;
		color: var(--color-primary);
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
			display: flex;
			margin-top: 4px;
			justify-content: space-between;
			p {
				gap: 4px;
				color: var(--color-secondary);
				margin: 0;
				display: flex;
				font-size: .8em;
				line-height: 1.25;
			}
		}
		.play {
			top: 96px;
			right: 8px;
			width: 24px;
			color: #fff;
			height: 24px;
			border: none;
			cursor: pointer;
			opacity: 0;
			padding: 2px;
			position: absolute;
			background: #00b06f;
			transition: opacity .2s;
			border-radius: 4px;
		}
		&:hover .play {
			opacity: 1;
		}
	}
</style>