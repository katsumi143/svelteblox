<script lang="ts">
	import { t } from '$lib/localization';
	import PlayIcon from '$lib/components/PlayIcon.svelte';
	import type { PageData } from './$types';
	import { getCreatorLink } from '$lib/api';

	export let data: PageData;
	/*const launchClient = async () => {
		const response = await request('https://gamejoin.roblox.com/v1/join-game', 'POST', {
			placeId: data.id,
			isTeleport: false,
			gameJoinAttemptId: v4()
		});
		console.log(response);*
	};*/
</script>

<div class="main">
	<div class="landing">
		<div class="thumbnails">
			<img src={data.thumbnails[0].imageUrl} alt="thumbnail">
		</div>
		<div class="details">
			<h1>{data.name}</h1>
			<p>by <a href={getCreatorLink(data.creator)}>{data.creator.name}</a></p>

			<p class="players">{data.playing} users are currently in-experience</p>
			<button type="button" on:click={() => location.href = `roblox://placeId=${data.rootPlaceId}`}>
				<PlayIcon/>
			</button>
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
		margin: 32px 96px;

		.landing {
			display: flex;
			.thumbnails {
				img {
					width: 640px;
					height: 360px;
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
					a {
						color: var(--color-primary);
						text-decoration: none;
					}
				}
				.players {
					margin: auto 0 12px;
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