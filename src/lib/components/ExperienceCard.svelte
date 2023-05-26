<script lang="ts">
	import { t } from '$lib/localisation';
	import People from '$lib/icons/PeopleFill.svelte';
	import PlayIcon from '$lib/icons/PlayIcon.svelte';
	import ThumbsUp from '$lib/icons/ThumbsUp.svelte';
	import type { PartialExperience } from '$lib/api/types';
	import { joinUser, joinExperience } from '$lib/launch';
	import { getExperienceVotes, getExperienceThumbnails } from '$lib/api/games';
	export let id: number;
	export let name: string;
	export let votes: PartialExperience['votes'] | null = null;
	export let playing: number;
	export let rootPlaceId: number;
	export let creatorName: string | null = null;

	export let friendId: number | null = null;
	export let friendName: string | null = null;
	export let thumbnail: Promise<string | undefined> | undefined = undefined;

	const voting = votes ? Promise.resolve(votes) : getExperienceVotes([id]).then(v => v[0]);
	const rating = voting.then(v => Math.round(v[0] / (v[0] + v[1]) * 100));
	const quickLaunch = () =>
		friendId ? joinUser(friendId) : joinExperience(rootPlaceId);
</script>

<a class="experience" href={`/experience/${id}`}>
	{#await thumbnail ?? getExperienceThumbnails(id).then(i => i[0]?.mediaAssetUrl) then image}
		<img src={image} alt="experience thumbnail"/>
	{/await}

	<p class="name">{name}</p>
	<div class="details">
		{#if creatorName}
			<p>{$t('creator', [creatorName])}</p>
		{/if}
		<p>
			<ThumbsUp/>
			{#await rating then rating}
				{$t(`experience.${rating ? 'rating2' : 'unrated'}`, [rating])}
			{/await}
		</p>
		<p><People/>{$t('experience.playing2', [playing])}</p>
	</div>
	<button type="button" class="play" on:click|preventDefault={quickLaunch}>
		{$t(`experience.${friendId ? 'join_user' : 'play'}`, [friendName])}
		<PlayIcon size={32}/>
	</button>
</a>

<style lang="scss">
	.experience {
		flex: 0 1 auto;
		width: 512px;
		color: var(--color-primary);
		height: 224px;
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
			white-space: nowrap;
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
			right: 8px;
			color: #fff;
			border: none;
			bottom: 40px;
			cursor: pointer;
			opacity: 0;
			z-index: 10;
			display: flex;
			padding: 2px 4px 2px 16px;
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