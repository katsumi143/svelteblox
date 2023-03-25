<script lang="ts">
	import { t } from '$lib/localization';
	import Avatar from '$lib/components/Avatar.svelte';
	import ExperienceItem from '$lib/components/ExperienceItem.svelte';
	import { getGreeting } from '$lib/util';
	import { user, request, getUserIcon, getUserIcons, getUserFriends, getUniverseIcons } from '$lib/api';

	const friends = getUserFriends(user.id);
	const friendAvatars = friends.then(f => getUserIcons(f.map(f => f.id)));

	const recentExperiences = request<{
		sorts: {
			name: string
			token: string
		}[]
	}>('https://games.roblox.com/v1/games/sorts?GameSortsContext=2')
		.then(data => request<{
			games: {
				name: string
				placeId: number
				universeId: number
				playerCount: number
				totalUpVotes: number
				totalDownVotes: number
			}[]
		}>(`https://games.roblox.com/v1/games/list?SortToken=${data.sorts.find(s => s.name === 'MyRecent')?.token}`))
		.then(data => data.games);
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
		<p class="header">{$t('home.friends', [friends.length])}</p>
		{#each friends.sort((a, b) => Number(b.isOnline) - Number(a.isOnline)) as friend}
			<a href={`/users/${friend.id}`} class={`friend status-${friend.presenceType}`}>
				<Avatar src={friendAvatars.then(f => f.find(i => i.targetId === friend.id)?.imageUrl)} size="md"/>
				<p>{friend.displayName}</p>
			</a>
		{/each}
	{/await}
</div>
<div class="experiences">
	<p class="header">{$t('home.recent')}</p>
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
		height: 140px;
		margin: 0 64px;
		display: flex;
		overflow: hidden;
		flex-wrap: wrap;
		.header {
			width: 100%;
			margin: 0 0 12px;
			font-weight: 500;
		}
		.friend {
			width: 80px;
			color: var(--color-primary);
			position: relative;
			text-align: center;
			margin-bottom: 100px;
			text-decoration: none;
			p {
				margin: 2px 0 0;
				overflow: hidden;
				font-size: .85em;
				line-height: 1.2;
				white-space: nowrap;
				text-overflow: ellipsis;
			}
			&.status-1, &.status-2 {
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
			}
		}
	}
	.experiences {
		margin: 16px 64px;
		.header {
			width: 100%;
			margin: 0 0 12px;
			font-weight: 500;
		}
		.items {
			gap: 16px;
			height: 200px;
			display: flex;
			overflow: hidden;
		}
	}
</style>