<script lang="ts">
	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import { getExperiences } from '$lib/api/games';
	import { getUserIcons, getUserFriends, getDisplayName, getUserPresences } from '$lib/api/users';

	import Friend from '$lib/components/User.svelte';
	$: friends = getUserFriends($page.params.id)
		.then(friends => friends.sort((a, b) => a.displayName.localeCompare(b.displayName)));
	$: friendAvatars = friends.then(f => getUserIcons(f.map(f => f.id)));
	
	$: presences = friends.then(f => getUserPresences(f.map(f => f.id)));
	$: presenceExperiences = presences.then(p => getExperiences(p.filter(p => !!p.universeId).map(p => p.universeId)));

	$: displayName = getDisplayName($page.params.id);
</script>

<div class="friends">
	{#await displayName then name}
		<h2 class="header">{$t('friends', [name])}</h2>
	{/await}
	<div class="items">
		{#await friends then friends}
			{#each friends as friend}
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
</div>

<style lang="scss">
	.friends {
		margin: 32px 40px;
		.items {
			gap: 32px 24px;
			display: flex;
			flex-wrap: wrap;
		}
	}

	.header {
		width: 100%;
		margin: 0 0 24px;
	}
</style>