<script lang="ts">
	import { t } from '$lib/localisation';
	import { user } from '$lib/api/users';
	import { getGreeting } from '$lib/util';
	import type ContextMenu from 'svelte-contextmenu';
	import { getExperiences, getExperienceIcons, getRecentExperiences } from '$lib/api/games';
	import { sortFriends, getUserIcon, getUserIcons, getUserFriends, getUserPresences } from '$lib/api/users';

	import Avatar from '$lib/components/Avatar.svelte';
	import Friend from '$lib/components/User.svelte';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import ArrowRight from '$lib/icons/ArrowRight.svelte';
	import ExperienceItem from '$lib/components/ExperienceItem.svelte';

	const friends = getUserFriends(user.id);
	
	const presences = friends.then(f => getUserPresences(f.map(f => f.id)));
	const presenceExperiences = presences.then(p => getExperiences(p.filter(p => !!p.universeId).map(p => p.universeId)));

	const sortedFriends = friends.then(f => presences.then(p => sortFriends(f, p)));
	const friendAvatars = sortedFriends.then(f => getUserIcons(f.slice(0, 20).map(f => f.id)));

	const recentExperiences = getRecentExperiences();
	const experienceIcons = recentExperiences.then(data => getExperienceIcons(data.map(i => i.universeId)));

	let contextMenu: ContextMenu;
</script>

<div class="landing">
	<a href={`/users/${user.id}/profile`} on:contextmenu={contextMenu.createHandler()}>
		<Avatar src={getUserIcon(user.id).then(img => img?.imageUrl)} circle/>
		<UserMenu {...user} bind:contextMenu={contextMenu}/>
	</a>
	<div class="greeting">
		<h1>{$t(`home.greeting.${getGreeting()}`)}</h1>
		<h2>{user.displayName}!</h2>
	</div>
</div>
{#await sortedFriends then friends}
	{#if friends.length > 0}
		<div class="friends">
			<div class="list-header">
				<p>{$t('home.friends', [friends.length])}</p>
				<a href={`/users/${user.id}/friends`}>{$t('action.view_all')}<ArrowRight/></a>
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
<div class="experiences">
	<div class="list-header">
		<p>{$t('home.recent')}</p>
		<a href="/games/recent">{$t('action.view_all')}<ArrowRight/></a>
	</div>
	<div class="items">
		{#await recentExperiences then items}
			{#each items as item}
				<ExperienceItem
					id={item.universeId}
					name={item.name}
					icon={experienceIcons.then(i => i.find(i => i.targetId === item.universeId))}
					voting={{
						id: item.universeId,
						upVotes: item.totalUpVotes,
						downVotes: item.totalDownVotes
					}}
					playing={item.playerCount}
					rootPlaceId={item.placeId}
				/>
			{/each}
		{/await}
	</div>
</div>

<svelte:head>
	<title>svelteblox</title>
</svelte:head>

<style lang="scss">
	.landing {
		margin: 40px 64px;
		display: flex;
		align-items: center;
		.greeting {
			margin-left: 24px;
			h1 {
				margin: 0;
				font-size: 1.8em;
			}
			h2 {
				color: var(--color-secondary);
				margin: 4px 0 0;
				font-size: 1.4em;
				font-weight: 600;
			}
		}
	}
	.friends {
		gap: 0 16px;
		margin: 0 64px;
		display: flex;
		overflow: hidden;
		flex-wrap: wrap;
		min-height: 148px;
		max-height: 148px;
		:global(.friend) {
			margin-bottom: 100px;
		}
	}
	.experiences {
		margin: 32px 64px;
		.items {
			gap: 16px;
			height: 200px;
			display: flex;
			overflow: hidden;
		}
	}
</style>