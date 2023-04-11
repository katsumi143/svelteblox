<script lang="ts">
	import { t } from '$lib/localisation';
	import { user } from '$lib/api/auth';
	import { joinUser } from '$lib/launch';
	import { getGreeting } from '$lib/util';
	import { getExperiences, getExperienceIcons, getRecentExperiences } from '$lib/api/games';
	import { getUserIcon, getUserIcons, getUserFriends, getUserPresences } from '$lib/api/users';

	import Avatar from '$lib/components/Avatar.svelte';
	import ArrowRight from '$lib/icons/ArrowRight.svelte';
	import ExperienceItem from '$lib/components/ExperienceItem.svelte';

	const friends = getUserFriends(user.id);
	const friendAvatars = friends.then(f => getUserIcons(f.map(f => f.id)));
	
	const presences = friends.then(f => getUserPresences(f.map(f => f.id)));
	const presenceExperiences = presences.then(p => getExperiences(p.filter(p => !!p.universeId).map(p => p.universeId)));

	const typeSort = [0, 1, 3, 2];
	const sortedFriends = friends.then(friends => presences.then(presences => {
		const sorted = friends.map((friend, index) => {
			friend.presenceType = presences[index]?.userPresenceType ?? 0;
			return friend;
		}).sort((a, b) => a.displayName.localeCompare(b.displayName));
		const online = sorted.filter(friend => friend.presenceType > 0);
		const offline = sorted.filter(f => !online.includes(f));
		return [...online.sort((a, b) => typeSort[b.presenceType] - typeSort[a.presenceType]), ...offline];
	}));

	const recentExperiences = getRecentExperiences();
	const experienceIcons = recentExperiences.then(data => getExperienceIcons(data.map(i => i.universeId)));
</script>

<div class="landing">
	<a href={`/users/${user.id}/profile`}><Avatar src={getUserIcon(user.id).then(img => img?.imageUrl)} circle/></a>
	<div class="greeting">
		<h1>{$t(`home.greeting.${getGreeting()}`)}</h1>
		<h2>{user.displayName}!</h2>
	</div>
</div>
<div class="friends">
	{#await sortedFriends then friends}
		<div class="list-header">
			<p>{$t('home.friends', [friends.length])}</p>
			<a href={`/users/${user.id}/friends`}>{$t('action.view_all')}<ArrowRight/></a>
		</div>
		{#each friends as friend}
			{#await presences.then(p => p.find(p => p.userId === friend.id)) then presence}
				<a href={`/users/${friend.id}`} class={`friend status-${presence?.userPresenceType ?? friend.presenceType}`} title={`${friend.displayName} (@${friend.name}) • ${$t(`user_status.${presence?.userPresenceType ?? friend.presenceType ?? 0}`)}`}>
					<Avatar src={friendAvatars.then(f => f.find(i => i.targetId === friend.id)?.imageUrl)} size="md" circle/>
					<p>{friend.displayName}</p>
					{#if presence && presence.universeId && presence.userPresenceType > 0}
						{#await presenceExperiences.then(e => e.find(e => e.id === presence.universeId)) then universe}
							<button class="status" type="button" title={`Join ${friend.name} in ${universe?.name}`} on:click|preventDefault={() => joinUser(friend.id)}>{universe?.name}</button>
						{/await}
					{/if}
				</a>
			{/await}
		{/each}
	{/await}
</div>
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
				border: none;
				cursor: pointer;
				padding: 0;
				font-size: .75em;
				background: none;
				font-family: var(--font-primary);
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
		margin: 32px 64px;
		.items {
			gap: 16px;
			height: 200px;
			display: flex;
			overflow: hidden;
		}
	}
</style>