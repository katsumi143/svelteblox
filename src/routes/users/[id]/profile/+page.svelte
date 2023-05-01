<script lang="ts">
	import { t } from '$lib/localisation';
	import { user } from '$lib/api/users';
	import * as toast from '$lib/toast';
	import { Button } from '@voxelified/voxeliface';
	import type ContextMenu from 'svelte-contextmenu';
	import type { PageData } from './$types';
	import { joinExperience } from '$lib/launch';
	import type { Friendship } from '$lib/api/types';
	import { UserPresenceType, FriendshipStatus } from '$lib/api/types';
	import { getExperiences, getExperienceId, getExperienceVotes, getExperienceThumbnails } from '$lib/api/games';
	import { hasPremium, sortFriends, getUserIcon, getUserIcons, getUserRoles, getUserFriends, getUserPresences, removeFriendship, requestFriendship, getUserFullBodies, getUserFavourites, getUserFriendCount, acceptFriendRequest, getUserFollowerCount, declineFriendRequest, getUserFollowingCount, getFriendshipStatuses, getUserProfileExperiences } from '$lib/api/users';

	import XIcon from '$lib/icons/X.svelte';
	import People from '$lib/icons/People.svelte';
	import Friend from '$lib/components/User.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import ThumbsUp from '$lib/icons/ThumbsUp.svelte';
	import PlayIcon from '$lib/icons/PlayIcon.svelte';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import ArrowRight from '$lib/icons/ArrowRight.svelte';
	import PersonPlus from '$lib/icons/PersonPlus.svelte';
	import PremiumBadge from '$lib/components/PremiumBadge.svelte';
	import VerifiedBadge from '$lib/components/VerifiedBadge.svelte';
	import ExperienceItem from '$lib/components/ExperienceItem.svelte';
	import ExperienceCard from '$lib/components/ExperienceCard.svelte';
	export let data: PageData;

	$: icon = getUserIcon(data.id);
	$: presence = getUserPresences([data.id]).then(data => data[0]);
	$: fullBody = getUserFullBodies([data.id]);
	$: currentExperience = presence.then(({ placeId, universeId }) => {
		if (universeId)
			return getExperiences([universeId]).then(e => e[0]);
		if (placeId)
			return getExperienceId(placeId).then(id => id ? getExperiences([id]).then(e => e[0]) : null);
	});

	$: friends = getUserFriends(data.id)
		.then(friends => friends.sort((a, b) => a.displayName.localeCompare(b.displayName)));
	$: sortedFriends = friends.then(f => presences.then(p => sortFriends(f, p)));
	$: friendAvatars = sortedFriends.then(f => getUserIcons(f.slice(0, 20).map(f => f.id)));
	
	$: presences = friends.then(f => getUserPresences(f.map(f => f.id)));
	$: presenceExperiences = presences.then(p => getExperiences(p.filter(p => !!p.universeId).map(p => p.universeId)));

	$: isSelf = data.id === user.id;
	$: roles = getUserRoles(data.id);
	$: premium = hasPremium(data.id);
	$: friendship = isSelf ? null : getFriendshipStatuses(user.id, [data.id]).then(s => s[0]);
	$: experiences = getUserProfileExperiences(data.id);
	$: experienceThumbnails = experiences.then(async items => {
		if (items.length === 0)
			return [];
		const images = [];
		for (const item of items)
			images.push((await getExperienceThumbnails(item.UniverseID))[0]);
		return images;
	});

	$: favourites = getUserFavourites(data.id).then(f => getExperiences(f.map(e => e.id)));
	$: favouriteVotes = favourites.then(items => {
		if (items.length === 0)
			return [];
		return getExperienceVotes(items.map(i => i.id));
	});

	$: friendCount = getUserFriendCount(data.id);

	let friending = false;
	let contextMenu: ContextMenu;
	const friend = async (current: Friendship, decline: boolean) => {
		friending = true;
		let newStatus = current.status;
		if (current.status === FriendshipStatus.NotFriends) {
			newStatus = await requestFriendship(data.id).then(() => FriendshipStatus.RequestSent);
			toast.success($t('toast.success'), $t('toast.friend_request', [data.displayName]));
		} else if (current.status === FriendshipStatus.Friends) {
			newStatus = await removeFriendship(data.id).then(() => FriendshipStatus.NotFriends);
			friendCount = friendCount.then(f => f - 1);
			toast.success($t('toast.success'), $t('toast.friend_removed', [data.displayName]));
		} else if (current.status === FriendshipStatus.RequestReceived) {
			if (decline) {
				newStatus = await declineFriendRequest(data.id).then(() => FriendshipStatus.NotFriends);
				toast.success($t('toast.success'), $t('toast.friend_decline', [data.displayName]));
			} else {
				newStatus = await acceptFriendRequest(data.id).then(() => FriendshipStatus.Friends);
				friendCount = friendCount.then(f => f + 1);
				toast.success($t('toast.success'), $t('toast.friend_accept', [data.displayName]));
			}
		}

		friending = false;
		current.status = newStatus;
		friendship = Promise.resolve(current);
	};
</script>

<div class="main">
	<div class="landing">
		<Avatar src={icon.then(i => i?.imageUrl)} circle on:contextmenu={contextMenu.createHandler()}/>
		<UserMenu {...data} bind:contextMenu={contextMenu}/>
		<div class="name">
			<h1>
				{data.displayName}
				{#await premium then premium}
					{#if premium}
						<PremiumBadge size={24}/>
					{/if}
				{/await}
				{#if data.hasVerifiedBadge}
					<VerifiedBadge size={24}/>
				{/if}
				{#await roles then roles}
					{#each roles as role}
						<p class="role">{$t(`user.role.${role}`)}</p>
					{/each}
				{/await}
				{#await presence then presence}
					<p class="status">{$t(`user_status.${presence.userPresenceType}`)}</p>
				{/await}
			</h1>
			<p>@{data.name}</p>
		</div>
		<div class="buttons">
			{#await friendship then friendship}
				{#if friendship}
					<Button on:click={() => friend(friendship, false)} disabled={friending || friendship.status === FriendshipStatus.RequestSent}>
						<PersonPlus/>{$t(`action.friend.${friendship.status}`)}
					</Button>
					{#if friendship.status === FriendshipStatus.RequestReceived}
						<Button on:click={() => friend(friendship, true)} disabled={friending}>
							<XIcon/> Decline Friend Request
						</Button>
					{/if}
				{/if}
			{/await}
		</div>
	</div>
	<div class="details">
		{#await friendCount then count}
			<a href={`/users/${data.id}/friends`}>{$t('number', [count])}</a><p>{$t('user.friends.count')}</p>
		{/await}
		{#await getUserFollowerCount(data.id) then count}
			<a href={`/users/${data.id}/friends`}>{$t('number', [count])}</a><p>{$t('user.followers')}</p>
		{/await}
		{#await getUserFollowingCount(data.id) then count}
			<a href={`/users/${data.id}/friends`}>{$t('number', [count])}</a><p>{$t('user.following')}</p>
		{/await}
	</div>
	<p class="description">{@html $t('description', [data.description])}</p>

	{#await currentExperience then experience}
		{#if experience}
			<div class="experience">
				{#await presence then presence}
					<p class="header">{$t(`user.experience_${presence.userPresenceType}`)}</p>
					<ExperienceCard data={experience} friendId={presence.userPresenceType === UserPresenceType.InExperience ? data.id : null} friendName={data.displayName}/>
				{/await}
			</div>
		{/if}
	{/await}

	{#await sortedFriends then friends}
		{#if friends.length > 0}
			<div class="friends">
				<div class="list-header">
					<p>{$t('user.friends', [friends.length])}</p>
					<a href={`/users/${data.id}/friends`}>{$t('action.view_all')}<ArrowRight/></a>
				</div>
				{#each friends.slice(0, 20) as friend}
					{#await presences.then(p => p.find(p => p.userId === friend.id)) then presence}
						<Friend
							user={friend}
							avatar={friendAvatars.then(f => f.find(i => i.targetId === friend.id))}
							presence={presence}
							experience={presenceExperiences.then(e => e.find(e => e.id === presence?.universeId))}
						/>
					{/await}
				{/each}
			</div>
		{/if}
	{/await}

	{#await experiences then items}
		{#if items.length > 0}
			<div class="experiences">
				<div class="list-header">Pinned Experiences</div>
				<div class="list">
					{#each items as item, key}
						<a class="experience" href={`/games/${item.PlaceID}`}>
							{#await experienceThumbnails then thumbnails}
								<img src={thumbnails[key].imageUrl} alt="thumbnail"/>
							{/await}
							<p class="name">{item.Name}</p>
							<div class="details">
								<p>
									<ThumbsUp/>
									{$t(`experience.rating2`, [Math.round(item.TotalUpVotes / (item.TotalUpVotes + item.TotalDownVotes) * 100)])}
								</p>
								<p><People/>{$t('experience.playing2', [item.PlayerCount])}</p>
							</div>
							<button type="button" class="play" on:click|preventDefault={() => joinExperience(item.PlaceID)}>
								{$t('experience.play')}
								<PlayIcon size={32}/>
							</button>
						</a>
					{/each}
				</div>
			</div>
		{/if}
	{/await}

	<div class="avatar">
		<div class="list-header">{$t('user.avatar')}</div>
		<Avatar src={fullBody.then(f => f[0]?.imageUrl)} size="xl"/>
	</div>
	{#await favourites then items}
		{#if items.length > 0}
			<div class="favourites">
				<div class="list-header">
					<p>{$t('user.favourites')}</p>
					<a href="/">{$t('action.view_all')}<ArrowRight/></a>
				</div>
				<div class="items">
					{#await favouriteVotes then votes}
						{#each items as item, key}
							<ExperienceItem
								id={item.id}
								name={item.name}
								voting={votes[key]}
								playing={item.playing}
								rootPlaceId={item.rootPlaceId}
							/>
						{/each}
					{/await}
				</div>
			</div>
		{/if}
	{/await}
</div>

<svelte:head>
	<title>{data.displayName}</title>
</svelte:head>

<style lang="scss">
	.main {
		margin: 32px 96px;

		.landing {
			display: flex;
			align-items: center;
			.name {
				margin-left: 32px;
				h1 {
					gap: 16px;
					margin: 0;
					display: flex;
					font-size: 2.25em;
					align-items: center;
				}
				p {
					color: var(--color-tertiary);
					margin: 8px 0 0;
				}
				.role {
					margin: 0;
					border: 1px solid var(--color-tertiary);
					padding: 5px 8px;
					font-size: .33333333333em;
					font-weight: 400;
					border-radius: 4px;
				}
				.status {
					margin: 0;
					font-size: .4em;
					font-weight: 400;
				}
			}
			.buttons {
				gap: 16px;
				display: flex;
				margin-left: auto;
			}
		}
		.details {
			color: var(--color-secondary);
			display: flex;
			margin-top: 16px;
			align-items: end;
			margin-left: 16px;
			a {
				color: var(--color-primary);
				margin-right: 4px;
				text-decoration: none;
				&:hover {
					text-decoration: underline;
				}
			}
			p {
				margin: 0 16px 0 0;
				font-size: .9em;
				line-height: 1.25;
			}
		}
		.description {
			color: var(--color-tertiary);
			margin: 24px 0 0;
			overflow: hidden;
			word-break: break-word;
			line-height: 1.25;
			white-space: pre-wrap;
		}

		.experience {
			margin-top: 64px;
		}

		.friends {
			gap: 0 16px;
			display: flex;
			overflow: hidden;
			flex-wrap: wrap;
			margin-top: 64px;
			min-height: 148px;
			max-height: 148px;
			:global(.friend) {
				margin-bottom: 100px;
			}
		}

		:global(.carousel) {
			width: 576px;
			height: 324px;
		}
		.experiences {
			margin-top: 64px;
			.list {
				gap: 16px;
				display: flex;
				flex-wrap: wrap;
				.experience {
					flex: 1 0 30%;
					height: 216px;
					display: flex;
					overflow: hidden;
					position: relative;
					max-width: 50%;
					margin-top: 0;
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
						-webkit-mask-image: -webkit-linear-gradient(#000, transparent);
					}
					.name {
						margin: 8px 16px 0;
						z-index: 1;
						overflow: hidden;
						font-size: 1.5em;
						max-height: 2.4em;
						font-weight: 700;
						line-height: 1.2em;
						white-space: nowrap;
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
					}
					.play {
						gap: 6px;
						right: 8px;
						color: #fff;
						bottom: 8px;
						border: none;
						cursor: pointer;
						opacity: 0;
						z-index: 1;
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
			}
		}

		.avatar {
			margin-top: 64px;
		}

		.favourites {
			margin: 64px 0;
			.items {
				gap: 16px;
				height: 200px;
				display: flex;
				overflow: hidden;
			}
		}
	}
</style>