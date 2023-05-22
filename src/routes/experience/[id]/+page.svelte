<script lang="ts">
	import { t } from '$lib/localisation';
	import { request } from '$lib/api';
	import { getUserIcons } from '$lib/api/users';
	import { DropdownMenu } from '@voxelified/voxeliface';
	import type { PageData } from './$types';
	import { THUMBNAILS_BASE } from '$lib/api/images';
	import type { ApiDataList } from '$lib/api/types';
	import { getExperiencePermissions } from '$lib/api/develop';
	import { joinServer, joinExperience, editExperience, joinPrivateServer } from '$lib/launch';
	import { getExperienceVotes, getExperienceSocials, getExperienceThumbnails, getExperienceFriendServers, getExperiencePrivateServers } from '$lib/api/games';

	import Avatar from '$lib/components/Avatar.svelte';
	import Carousel from '$lib/components/Carousel.svelte';
	import SocialLink from '$lib/components/SocialLink.svelte';
	import Description from '$lib/components/Description.svelte';
	import CreatorLink from '$lib/components/CreatorLink.svelte';

	import Star from '$lib/icons/Star.svelte';
	import StarFill from '$lib/icons/StarFill.svelte';
	import ThumbsUp from '$lib/icons/ThumbsUp.svelte';
	import PlayIcon from '$lib/icons/PlayIcon.svelte';
	import ThreeDots from '$lib/icons/ThreeDots.svelte';
	import ThumbsDown from '$lib/icons/ThumbsDown.svelte';
	import RobloxIcon from '$lib/icons/RobloxIcon.svelte';
	import PencilSquare from '$lib/icons/PencilSquare.svelte';
	import RobloxStudio2 from '$lib/icons/RobloxStudio2.svelte';
	import ClipboardPlus from '$lib/icons/ClipboardPlus.svelte';

	export let data: PageData;

	$: votes = getExperienceVotes([data.id]);
	$: rating = votes.then(([v]) => Math.round(v.upVotes / (v.upVotes + v.downVotes) * 100));
	$: socials = getExperienceSocials(data.id);
	$: thumbnails = getExperienceThumbnails(data.id);
	$: permissions = getExperiencePermissions(data.id);
	$: friendServers = getExperienceFriendServers(data.rootPlaceId);
	$: privateServers = getExperiencePrivateServers(data.rootPlaceId);
	$: privateIcons = privateServers.then(servers => getUserIcons(servers.map(s => s.owner.id)));

	$: friendIcons = friendServers.then(servers => {
		if (servers.length === 0)
			return [];
		return request<ApiDataList<any>>(`${THUMBNAILS_BASE}/batch`, 'POST', servers.flatMap(s => s.playerTokens.map(token => ({
			size: '150x150',
			type: 'AvatarHeadShot',
			token,
			format: 'png',
			targetId: 0,
			requestId: `0:${token}:AvatarHeadshot:150x150:png:regular`
		})))).then(d => d.data);
	});

	let thumbnail = 0;
	let dropdownTrigger: () => void;
	let showAllPrivateServers = false;
	const CREATE_BASE = `https://create.roblox.com/dashboard/creations/experiences/${data.id}`;
</script>

<div class="main">
	<div class="landing">
		<Carousel length={thumbnails.then(t => t.length)} bind:index={thumbnail}>
			{#await thumbnails then items}
				{#each items as image, key}
					<img src={image.mediaAssetUrl} alt="thumbnail" class="thumbnail" class:show={key === thumbnail}>
				{/each}
			{/await}
		</Carousel>
		<div class="details">
			<h1>
				{data.name}
				<DropdownMenu bind:trigger={dropdownTrigger}>
					<button class="trigger" type="button" slot="trigger" on:click={dropdownTrigger}><ThreeDots/></button>
					<p>{data.name}</p>
					{#await permissions then permissions}
						{#if permissions.canCloudEdit}
							<button type="button" on:click={() => editExperience(data.rootPlaceId, data.id)}>
								<RobloxStudio2/>
								{$t('action.edit_studio')}
							</button>
						{/if}
						{#if permissions.canManage}
							<a href={`${CREATE_BASE}/places/${data.rootPlaceId}/configure`} target="_blank">
								<PencilSquare/>
								{$t('action.configure_place')}
							</a>
							<a href={`${CREATE_BASE}/configure`} target="_blank">
								<PencilSquare/>
								{$t('action.configure_universe')}
							</a>
							<div class="separator"/>
						{/if}
					{/await}
					<a href={`https://roblox.com/games/${data.rootPlaceId}`} target="_blank">
						<RobloxIcon/>
						{$t('action.view_roblox')}
					</a>
					<button type="button" on:click={() => navigator.clipboard.writeText(data.rootPlaceId.toString())}>
						<ClipboardPlus/>
						{$t('action.copy_place_id')}
					</button>
					<button type="button" on:click={() => navigator.clipboard.writeText(data.id.toString())}>
						<ClipboardPlus/>
						{$t('action.copy_universe_id')}
					</button>
				</DropdownMenu>
			</h1>
			<p class="creator">by <CreatorLink {...data.creator}/></p>

			<div class="share">
				<p>
					{#if data.isFavoritedByUser}
						<StarFill/>
					{:else}
						<Star size={24}/>
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
			<button class="play" type="button" on:click={() => joinExperience(data.rootPlaceId)}>
				<PlayIcon/>
			</button>
			<p class="players">{$t('experience.playing', [data.playing])}</p>
		</div>
	</div>
	<div class="description"><Description input={data.description}/></div>
	{#await socials then items}
		{#if items.length}
			<p class="list-header">{$t('experience.socials')}</p>
			<div class="socials">
				{#each items as item}
					<SocialLink data={item}/>
				{/each}
			</div>
		{/if}
	{/await}
	{#await friendServers then servers}
		{#if servers.length}
			<div class="servers">
				<div class="list-header">
					{$t('experience.friend_servers', [servers.length])}
				</div>
				{#each servers as server}
					<div class="server">
						<div class="header">
							<div class="users">
								{#await friendIcons then icons}
									{#each icons as image}
										<Avatar src={image.imageUrl} size="sm" circle/>
									{/each}
								{/await}
							</div>
							<button type="button" on:click={() => joinServer(data.rootPlaceId, server.id)}>
								<PlayIcon size={32}/>
							</button>
						</div>
						<div class="details">
							<div>{server.playing ?? server.playerTokens.length}/{server.maxPlayers}</div><p>playing</p>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{/await}
	{#await privateServers then servers}
		{#if servers.length > 0}
			<div class="servers">
				<div class="list-header">
					{$t('experience.private_servers', [servers.length])}
					{#if !showAllPrivateServers && servers.length > 2}
						<button type="button" class="show-all" on:click={() => showAllPrivateServers = true}>
							{$t('action.show_all')}
						</button>
					{/if}
				</div>
				{#each showAllPrivateServers ? servers : servers.slice(0, 2) as server}
					<div class="server">
						<div class="header">
							<Avatar src={privateIcons.then(i => i.find(i => i.targetId === server.owner.id)?.imageUrl)} size="sm2" circle/>
							<div class="name">
								<h1>{server.name}</h1>
								<p>{$t('server.owner', [server.owner.displayName])}</p>
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
			</div>
		{/if}
	{/await}
</div>

<svelte:head>
	<title>{data.name}</title>
</svelte:head>

<style lang="scss">
	.main {
		margin: 32px 48px;

		.landing {
			display: flex;
			:global(.carousel) {
				height: 432px;
				min-width: 768px;
			}
			.thumbnail {
				opacity: 0;
				display: flex;
				position: absolute;
				transition: opacity .5s;
				border-radius: 8px;
				&.show {
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
					display: flex;
					font-size: 2.5em;
					:global(.container) {
						margin: 0 8px 0 auto;
					}
					button.trigger {
						width: fit-content;
						color: var(--color-tertiary);
						border: none;
						cursor: pointer;
						height: fit-content;
						padding: 0;
						background: none;
						&:hover {
							color: var(--color-primary);
						}
					}
				}
				.creator {
					color: var(--color-tertiary);
				}
				.players {
					margin: 8px 0 16px;
					font-size: 14px;
				}
				button.play {
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
			margin: 32px 0 64px;
		}
		.socials {
			gap: 16px;
			display: flex;
			margin-bottom: 48px;
		}
		.servers {
			display: flex;
			flex-direction: column;
			.list-header {
				gap: 8px;
				align-items: end;
				justify-content: unset;
			}
			.server {
				padding: 16px;
				background: var(--background-tertiary);
				border-radius: 16px;
				margin-bottom: 16px;
				.header {
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
					.users {
						gap: 8px;
						display: flex;
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
			.show-all {
				width: fit-content;
				color: var(--color-primary);
				border: none;
				cursor: pointer;
				background: none;
				font-family: var(--font-primary);
				&:hover {
					text-decoration: underline;
				}
			}
		}
	}
</style>