<script lang="ts">
	import { t } from '$lib/localization';
	import Avatar from '$lib/components/Avatar.svelte';
	import ExperienceItem from '$lib/components/ExperienceItem.svelte';
	import { getGreeting } from '$lib/util';
	import { joinUser } from '$lib/launch';
	import { user, request, getUserIcon, getUserIcons, getUniverses, getUserFriends, getUserPresences, getUniverseIcons, getRecentExperiences } from '$lib/api';

	const friends = getUserFriends(user.id);
	const friendAvatars = friends.then(f => getUserIcons(f.map(f => f.id)));
	const presences = friends.then(f => getUserPresences(f.filter(f => f.isOnline).map(f => f.id)));
	const presenceExperiences = presences.then(p => getUniverses(p.filter(p => !!p.universeId).map(p => p.universeId)));
	presences.then(console.log);

	const recentExperiences = getRecentExperiences();
	const experienceIcons = recentExperiences.then(data => getUniverseIcons(data.map(i => i.universeId)));
</script>

<div class="landing">
	<Avatar src={getUserIcon(user.id).then(img => img?.imageUrl)}/>
	<div class="greeting">
		<h1>{$t(`home.greeting.${getGreeting()}`)}</h1>
		<h2>{user.displayName}!</h2>
	</div>
</div>
<div class="friends">
	{#await friends}
		<p>loading friends</p>
	{:then friends}
		<div class="header">
			<p>{$t('home.friends', [friends.length])}</p>
			<a href="/">View All</a>
		</div>
		{#each friends.sort((a, b) => Number(b.isOnline) - Number(a.isOnline)) as friend}
			<a href={`/users/${friend.id}`} class={`friend status-${friend.presenceType}`}>
				<Avatar src={friendAvatars.then(f => f.find(i => i.targetId === friend.id)?.imageUrl)} size="md"/>
				<p>{friend.displayName}</p>
				{#await presences.then(p => p.find(p => p.userId === friend.id)) then presence}
					{#if presence && presence.universeId}
						{#await presenceExperiences.then(e => e.find(e => e.id === presence.universeId)) then universe}
							<p class="status" title={`Join ${friend.name}`} on:click|preventDefault={() => joinUser(friend.id)}>{universe?.name}</p>
						{/await}
					{/if}
				{/await}
			</a>
		{/each}
	{/await}
</div>
<div class="experiences">
	<div class="header">
		<p>{$t('home.recent')}</p>
		<a href="/games/recent">View All</a>
	</div>
	<div class="items">
		{#await recentExperiences}
			<p>loading recent experiences</p>
		{:then experiences}
			{#each experiences as item}
				<ExperienceItem data={{
					id: item.universeId,
					name: item.name,
					playing: item.playerCount,
					rootPlaceId: item.placeId,
					totalUpVotes: item.totalUpVotes,
					totalDownVotes: item.totalDownVotes
				}} icon={experienceIcons.then(i => i.find(i => i.targetId === item.universeId))}/>
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
		.friend {
			width: 80px;
			color: var(--color-primary);
			position: relative;
			text-align: center;
			margin-bottom: 100px;
			text-decoration: none;
			p {
				margin: 4px 0 0;
				overflow: hidden;
				font-size: .85em;
				line-height: 1.2;
				white-space: nowrap;
				text-overflow: ellipsis;
			}
			.status {
				color: var(--color-secondary);
				font-size: .75em;
				&:hover {
					text-decoration: underline;
				}
			}
			&.status-1, &.status-2, &.status-3 {
				:before {
					top: 58px;
					right: 0;
					width: 14px;
					height: 14px;
					border: 4px solid var(--background-primary);
					content: '';
					display: block;
					position: absolute;
					background: var(--status-color);
					border-radius: 50%;
				}
				&.status-1 {
					--status-color: hsl(200, 60%, 60%);
				}
				&.status-2 {
					--status-color: hsl(130, 60%, 60%);
				}
				&.status-3 {
					--status-color: hsl(35, 80%, 60%);
				}
			}
		}
	}
	.experiences {
		margin: 16px 64px;
		.items {
			gap: 16px;
			height: 200px;
			display: flex;
			overflow: hidden;
		}
	}

	.header {
		width: 100%;
		margin: 0 0 12px;
		display: flex;
		font-weight: 500;
		justify-content: space-between;
		p { margin: 0; }
		a {
			color: var(--color-primary);
			font-size: .9em;
			text-decoration: none;
		}
	}
</style>