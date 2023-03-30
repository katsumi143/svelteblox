<script lang="ts">
	import { t } from '$lib/localization';
	import type { PageData } from './$types';
	import { getExperienceVotes, getExperienceThumbnails } from '$lib/api/games';

	import Star from '$lib/icons/Star.svelte';
	import StarFill from '$lib/icons/StarFill.svelte';
	import ThumbsUp from '$lib/icons/ThumbsUp.svelte';
	import PlayIcon from '$lib/icons/PlayIcon.svelte';
	import ThumbsDown from '$lib/icons/ThumbsDown.svelte';
	import CreatorLink from '$lib/components/CreatorLink.svelte';

	export let data: PageData;

	$: votes = getExperienceVotes([data.id]);
	$: rating = votes.then(([v]) => Math.round(v.upVotes / (v.upVotes + v.downVotes) * 100));
	$: thumbnails = getExperienceThumbnails(data.id);
	const formatter = new Intl.NumberFormat();
</script>

<div class="main">
	<div class="landing">
		<div class="thumbnails">
			{#await thumbnails then thumbnails}
				<img src={thumbnails[0].imageUrl} alt="thumbnail">
			{/await}
		</div>
		<div class="details">
			<h1>{data.name}</h1>
			<p>by <CreatorLink {...data.creator}/></p>

			<div class="share">
				<p>
					{#if data.isFavoritedByUser}
						<StarFill/>
					{:else}
						<Star/>
					{/if}
					{$t(`experience.favourite_${data.isFavoritedByUser}`)}
				</p>
				{#await rating then rating}
					<div class="rating" style={`--rating: ${rating}%;`}>
						<div class="buttons">
							{#await votes.then(v => v[0]) then votes}
								<p><ThumbsUp size={24}/>{formatter.format(votes.upVotes)}</p>
								<p>{formatter.format(votes.downVotes)}<ThumbsDown size={24}/></p>
							{/await}
						</div>
						<div class="ratio"/>
						<p>{$t('experience.rating', [rating])}</p>
					</div>
				{/await}
			</div>
			<button type="button" on:click={() => location.href = `roblox://placeId=${data.rootPlaceId}`}>
				<PlayIcon/>
			</button>
			<p class="players">{$t('experience.playing', [data.playing])}</p>
		</div>
	</div>
	<div class="description">
		<p>{data.description}</p>
	</div>
</div>

<svelte:head>
	<title>{data.name}</title>
</svelte:head>

<style lang="scss">
	.main {
		margin: 32px 48px;

		.landing {
			display: flex;
			.thumbnails {
				width: 768px;
				height: 432px;
				img {
					display: flex;
					border-radius: 8px;
				}
			}
			.details {
				width: 100%;
				display: flex;
				margin-left: 32px;
				flex-direction: column;
				h1 {
					margin: 16px 8px 8px 0;
					font-size: 2.5em;
				}
				p {
					color: var(--color-tertiary);
				}
				.players {
					margin: 8px 0 16px;
					font-size: 14px;
				}
				button {
					width: 100%;
					color: #fff;
					border: none;
					cursor: pointer;
					padding: 4px 0;
					background: #00b06f;
					border-radius: 8px;
				}

				.share {
					margin: auto 8px 8px;
					display: flex;
					align-items: center;
					justify-content: space-between;
					p {
						gap: 4px;
						color: var(--color-primary);
						margin: 0;
						display: flex;
						font-size: .9em;
						align-items: center;
						flex-direction: column;
					}
					.rating {
						width: 50%;
						.buttons {
							display: flex;
							justify-content: space-between;
							p {
								gap: 8px;
								display: flex;
								font-size: .8em;
								align-items: end;
								line-height: 1.5;
								flex-direction: row;
							}
						}
						.ratio {
							width: 100%;
							height: 4px;
							margin: 6px 0;
							background: linear-gradient(90deg, #fff var(--rating), var(--background-secondary) var(--rating));
							border-radius: 2px;
						}
						p {
							font-size: .7em;
						}
					}
				}
			}
		}
		.description {
			width: 100%;
			p {
				color: var(--color-tertiary);
				margin: 32px 0 64px;
				overflow: hidden;
				word-break: break-word;
				line-height: 1.25;
				white-space: pre-wrap;
			}
		}
	}
</style>