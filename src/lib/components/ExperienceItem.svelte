<script lang="ts">
	import { t } from '$lib/localization';
	import People from '$lib/icons/People.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import PlayIcon from '$lib/icons/PlayIcon.svelte';
	import ThumbsUp from '$lib/icons/ThumbsUp.svelte';
	import ClipboardPlus from '$lib/icons/ClipboardPlus.svelte';
	import ContextMenu, { Item } from 'svelte-contextmenu';
	import type { ImageData, ExperienceVoting } from '$lib/api/types';
	import { getExperienceIcons, getExperienceVotes } from '$lib/api/games';
	export let id: number;
	export let name: string
	export let icon: Promise<ImageData | undefined> | null = null;
	export let voting: ExperienceVoting | null = null;
	export let playing: number | null = null;
	export let rootPlaceId: number;
	let contextMenu: ContextMenu;

	const voting2 = voting ? Promise.resolve(voting) :
		getExperienceVotes([id]).then(v => v[0]);
	const rating = voting2.then(v => Math.round(v.upVotes / (v.upVotes + v.downVotes) * 100));
	const quickLaunch = () =>
		location.href = `roblox://placeId=${rootPlaceId}`;
</script>

<a class="experience" href={`/games/${rootPlaceId}`} title={$t('experience.hover', [name, playing])} on:contextmenu={contextMenu.createHandler()}>
	<Avatar src={icon ? icon.then(i => i?.imageUrl) : getExperienceIcons([id]).then(i => i[0]?.imageUrl)} size="lg2"/>
	<p class="name">{name}</p>
	<div class="details">
		<p>
			<ThumbsUp/>
			{#await rating then rating}
				{isNaN(rating) ? 'Unrated' : `${rating}%`}
			{/await}
		</p>
		{#if typeof playing === 'number'}
			<p><People/>{$t('number', [playing])}</p>
		{/if}
	</div>
	<button type="button" class="play" title={$t('experience.play2', [name])} on:click|preventDefault={quickLaunch}>
		<PlayIcon size={20}/>
	</button>
</a>

<ContextMenu bind:this={contextMenu}>
	<p>{name}</p>
	<Item href={`https://roblox.com/games/${rootPlaceId}`} target="_blank">View on Roblox</Item>
	<Item on:click={() => navigator.clipboard.writeText(rootPlaceId.toString())}><ClipboardPlus/>Copy Place ID</Item>
	<Item on:click={() => navigator.clipboard.writeText(id.toString())}><ClipboardPlus/>Copy Universe ID</Item>
</ContextMenu>

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