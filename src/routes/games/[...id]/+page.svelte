<script lang="ts">
	import { t } from '$lib/localization';
	import { onMount } from 'svelte';
	import { getUserIcons } from '$lib/api/users';
	import type { PageData } from './$types';
	import { joinPrivateServer } from '$lib/launch';
	import { getExperienceVotes, getExperienceThumbnails, getExperiencePrivateServers } from '$lib/api/games';

	import Star from '$lib/icons/Star.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import StarFill from '$lib/icons/StarFill.svelte';
	import ThumbsUp from '$lib/icons/ThumbsUp.svelte';
	import PlayIcon from '$lib/icons/PlayIcon.svelte';
	import CaretLeft from '$lib/icons/CaretLeft.svelte';
	import CaretRight from '$lib/icons/CaretRight.svelte';
	import ThumbsDown from '$lib/icons/ThumbsDown.svelte';
	import CreatorLink from '$lib/components/CreatorLink.svelte';

	export let data: PageData;

	$: votes = getExperienceVotes([data.id]);
	$: rating = votes.then(([v]) => Math.round(v.upVotes / (v.upVotes + v.downVotes) * 100));
	$: thumbnails = getExperienceThumbnails(data.id);
	$: privateServers = getExperiencePrivateServers(data.rootPlaceId);
	$: privateIcons = privateServers.then(servers => getUserIcons(servers.map(s => s.owner.id)));

	let thumbnail = 0;
	onMount(async () => {
		const images = await thumbnails;
		const interval = setInterval(() => thumbnail = (thumbnail + 1) % images.length, 5000);
		return () => clearInterval(interval);
	});
</script>

<div class="main">
	<div class="landing">
		<div class="thumbnail">
			{#await thumbnails then thumbnails}
				{#each thumbnails as data, key}
					<img src={data.imageUrl} alt="thumbnail" class:show={key === thumbnail}>
				{/each}
				<button type="button" title="Previous Thumbnail" on:click={() => thumbnail === 0 ? thumbnail = thumbnails.length - 1 : thumbnail--}><CaretLeft/></button>
				<button type="button" title="Next Thumbnail" on:click={() => thumbnail = (thumbnail + 1) % thumbnails.length}><CaretRight/></button>
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
								<p><ThumbsUp size={24}/>{$t('number', [votes.upVotes])}</p>
								<p>{$t('number', [votes.downVotes])}<ThumbsDown size={24}/></p>
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
			<p class="players">{$t('experience.playing', [data])}</p>
		</div>
	</div>
	<div class="description">
		<p>{@html $t('description', [data.description])}</p>
	</div>
	<div class="servers">
		<h2>Private Servers</h2>
		{#await privateServers then servers}
			{#each servers as server}
				<div class="server">
					<div class="owner">
						<Avatar src={privateIcons.then(i => i.find(i => i.targetId === server.owner.id)?.imageUrl)} size="sm2" circle/>
						<div class="name">
							<h1>{server.name}</h1>
							<p>Created by {server.owner.displayName}</p>
						</div>
						<button type="button" on:click={() => joinPrivateServer(data.rootPlaceId, server.accessCode)}>
							<PlayIcon size={32}/>
						</button>
					</div>
					<div class="details">
						<div>{server.playing ?? server.playerTokens.length}/{server.maxPlayers}</div><p>playing</p>
					</div>
				</div>
			{/each}
		{/await}
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
			.thumbnail {
				height: 432px;
				position: relative;
				min-width: 768px;
				img {
					opacity: 0;
					display: flex;
					position: absolute;
					transition: opacity .5s;
					border-radius: 8px;
				}
				img.show {
					opacity: 1;
				}
				button {
					top: 50%;
					left: 8px;
					color: #fff;
					border: none;
					cursor: pointer;
					opacity: 0;
					padding: 24px 2px;
					position: absolute;
					transform: translateY(-50%);
					background: #0000004d;
					transition: opacity .25s;
					border-radius: 6px;
				}
				button:last-child {
					left: unset;
					right: 8px;
				}
				&:hover button {
					opacity: 1;
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
					display: flex;
					padding: 4px 0;
					background: #00b06f;
					border-radius: 8px;
					justify-content: center;
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
		.servers {
			gap: 16px;
			display: flex;
			flex-direction: column;
			.server {
				padding: 16px;
				background: var(--background-tertiary);
				border-radius: 16px;
				.owner {
					display: flex;
					.name {
						margin-top: 8px;
						margin-left: 12px;
						h1 {
							margin: 0;
							font-size: 1.2em;
						}
						p {
							color: var(--color-secondary);
							margin: 0;
							font-size: .8em;
							margin-top: .2em;
							font-weight: 500;
						}
					}
					button {
						color: #fff;
						border: none;
						cursor: pointer;
						height: fit-content;
						padding: 4px;
						display: flex;
						background: #00b06f;
						margin-left: auto;
						border-radius: 8px;
						justify-content: center;
					}
				}
				.details {
					display: flex;
					margin-top: 16px;
					align-items: end;
					div {
						font-weight: 400;
						margin-right: 4px;
					}
					p {
						color: var(--color-secondary);
						margin: 0 16px 0 0;
						font-size: .9em;
						line-height: 1.25;
					}
				}
			}
		}
	}
</style>