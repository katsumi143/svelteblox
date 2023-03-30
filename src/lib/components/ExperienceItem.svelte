<script lang="ts">
	import People from '$lib/icons/People.svelte';
	import PlayIcon from './PlayIcon.svelte';
	import ThumbsUp from '$lib/icons/ThumbsUp.svelte';
	import type { ImageData } from '$lib/api';
	export let data: {
		id: number
		name: string
		playing: number
		rootPlaceId: number
		totalUpVotes: number
		totalDownVotes: number
	};
	export let icon: Promise<ImageData | undefined>;

	const rating = Math.round(data.totalUpVotes / (data.totalUpVotes + data.totalDownVotes) * 100);
	const quickLaunch = () =>
		location.href = `roblox://placeId=${data.rootPlaceId}`;
</script>

<a class="experience" href={`/games/${data.rootPlaceId}`}>
	{#await icon}
		<img alt="experience icon"/>
	{:then data}
		<img src={data?.imageUrl} alt="experience icon" width="128" height="128"/>
	{/await}
	<p class="name">{data.name}</p>
	<div class="details">
		<p><ThumbsUp/>{isNaN(rating) ? 'Unrated' : `${rating}%`}</p>
		<p><People/>{new Intl.NumberFormat().format(data.playing)}</p>
	</div>
	<button type="button" class="play" on:click|preventDefault={quickLaunch}>
		<PlayIcon size={20}/>
	</button>
</a>

<style lang="scss">
	.experience {
		flex: 0 0 auto;
		width: 128px;
		color: var(--color-primary);
		display: flex;
		position: relative;
		flex-direction: column;
		text-decoration: none;
		img { border-radius: 8px; }
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