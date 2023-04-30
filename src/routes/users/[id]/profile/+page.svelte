<script lang="ts">
	import { t } from '$lib/localisation';
	import { user } from '$lib/api/users';
	import * as toast from '$lib/toast';
	import { Button } from '@voxelified/voxeliface';
	import type { PageData } from './$types';
	import type { Friendship } from '$lib/api/types';
	import { getExperiences, getExperienceId } from '$lib/api/games';
	import { UserPresenceType, FriendshipStatus } from '$lib/api/types';
	import { sortFriends, getUserIcon, getUserIcons, getUserFriends, getUserPresences, removeFriendship, requestFriendship, getUserFullBodies, getUserFavourites, getUserFriendCount, acceptFriendRequest, getUserFollowerCount, declineFriendRequest, getUserFollowingCount, getFriendshipStatuses } from '$lib/api/users';

	import XIcon from '$lib/icons/X.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import Friend from '$lib/components/User.svelte';
	import ArrowRight from '$lib/icons/ArrowRight.svelte';
	import PersonPlus from '$lib/icons/PersonPlus.svelte';
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

	$: friendship = getFriendshipStatuses(user.id, [data.id]).then(s => s[0]);

	$: friendCount = getUserFriendCount(data.id);

	let friending = false;
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
		<Avatar src={icon.then(i => i?.imageUrl)} circle/>
		<div class="name">
			<h1>
				{data.displayName}
				{#if data.hasVerifiedBadge}
					<VerifiedBadge size={24}/>
				{/if}
				{#await presence then presence}
					<p class="status">{$t(`user_status.${presence.userPresenceType}`)}</p>
				{/await}
			</h1>
			<p>@{data.name}</p>
		</div>
		<div class="buttons">
			{#await friendship then friendship}
				<Button on:click={() => friend(friendship, false)} disabled={friending || friendship.status === FriendshipStatus.RequestSent}>
					<PersonPlus/>{$t(`action.friend.${friendship.status}`)}
				</Button>
				{#if friendship.status === FriendshipStatus.RequestReceived}
					<Button on:click={() => friend(friendship, true)} disabled={friending}>
						<XIcon/> Decline Friend Request
					</Button>
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

	<div class="friends">
		{#await sortedFriends then friends}
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
		{/await}
	</div>

	<div class="avatar">
		<div class="list-header">{$t('user.avatar')}</div>
		<Avatar src={fullBody.then(f => f[0]?.imageUrl)} size="xl"/>
	</div>
	
	<div class="favourites">
		<div class="list-header">
			<p>{$t('user.favourites')}</p>
			<a href="/">{$t('action.view_all')}<ArrowRight/></a>
		</div>
		<div class="items">
			{#await getUserFavourites(data.id).then(f => getExperiences(f.map(e => e.id))) then items}
				{#each items as item}
					<ExperienceItem id={item.id} name={item.name} playing={item.playing} rootPlaceId={item.rootPlaceId}/>
				{/each}
			{/await}
		</div>
	</div>
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