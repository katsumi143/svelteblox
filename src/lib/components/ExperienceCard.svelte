<script lang="ts">
	import { t } from '$lib/localization';
	import People from '$lib/icons/People.svelte';
	import PlayIcon from '$lib/icons/PlayIcon.svelte';
	import ThumbsUp from '$lib/icons/ThumbsUp.svelte';
	import { joinUser } from '$lib/launch';
	import type { ImageData, ExperienceVoting, ExperienceCreator } from '$lib/api/types';
	import { getExperienceVotes, getExperienceThumbnails } from '$lib/api/games';
	export let data: {
		id: number
		name: string
		playing: number
		voting?: ExperienceVoting
		creator: ExperienceCreator
		rootPlaceId: number
	};
	export let friendId: number | null;
	export let friendName: string | null;
	export let thumbnail: Promise<ImageData | undefined> | undefined = undefined;

	const voting = data.voting ? Promise.resolve(data.voting) :
		getExperienceVotes([data.id]).then(v => v[0]);
	const rating = voting.then(v => Math.round(v.upVotes / (v.upVotes + v.downVotes) * 100));
	const quickLaunch = () =>
		friendId ? joinUser(friendId) : location.href = `roblox://placeId=${data.rootPlaceId}`;
</script>

<a class="experience" href={`/games/${data.rootPlaceId}`}>
	{#await thumbnail ?? getExperienceThumbnails(data.id).then(i => i[0]) then image}
		<img src={image?.imageUrl} alt="experience thumbnail"/>
	{/await}

	<p class="name">{data.name}</p>
	<div class="details">
		<p>{$t('creator', [data.creator.name])}</p>
		<p>
			<ThumbsUp/>
			{#await rating then rating}
				{$t(`experience.${rating ? 'rating2' : 'unrated'}`, [rating])}
			{/await}
		</p>
		<p><People/>{$t('experience.playing2', [new Intl.NumberFormat().format(data.playing)])}</p>
	</div>
	<button type="button" class="play" on:click|preventDefault={quickLaunch}>
		{$t(`experience.${friendId ? 'join_user' : 'play'}`, [friendName])}
		<PlayIcon size={32}/>
	</button>
</a>

<style lang="scss">
	.experience {
		flex: 0 0 auto;
		width: 512px;
		color: var(--color-primary);
		height: 256px;
		display: flex;
		overflow: hidden;
		position: relative;
		background: var(--background-tertiary);
		border-radius: 8px;
		flex-direction: column;
		justify-content: end;
		text-decoration: none;
		img {
			width: 100%;
			height: 100%;
			position: absolute;
			object-fit: cover;
			mask-image: linear-gradient(#000, transparent);
			pointer-events: none;
			-webkit-mask-image: -webkit-linear-gradient(#000, transparent 90%);
		}
		.name {
			margin: 8px 16px 0;
			z-index: 1;
			overflow: hidden;
			font-size: 1.5em;
			max-height: 2.4em;
			font-weight: 700;
			line-height: 1.2em;
			text-overflow: ellipsis;
		}
		.details {
			gap: 24px;
			margin: 0 16px 16px;
			z-index: 1;
			display: flex;
			p {
				gap: 4px;
				color: var(--color-secondary);
				margin: 0;
				display: flex;
				font-size: .8em;
				line-height: 1.25;
			}
			p:first-child {
				margin-right: auto;
			}
		}
		.play {
			gap: 6px;
			top: 176px;
			right: 8px;
			color: #fff;
			border: none;
			cursor: pointer;
			opacity: 0;
			padding: 2px 4px 2px 16px;
			display: flex;
			position: absolute;
			font-size: .9em;
			background: #00b06f;
			transition: opacity .2s;
			line-height: 1.5;
			font-weight: 500;
			align-items: center;
			font-family: var(--font-primary);
			border-radius: 4px;
		}
		&:hover .play {
			opacity: 1;
		}
	}
</style>