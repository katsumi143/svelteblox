<script lang="ts">
	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import { Select } from '@voxelified/voxeliface';
	import { writable } from 'svelte/store';
	import { getExperiences } from '$lib/api/games';
	import { SortOrder, SortDirection } from '$lib/enums';
	import { getUserIcons, getUserFriends, getDisplayName, getUserPresences, sortFriends } from '$lib/api/users';

	import Friend from '$lib/components/User.svelte';
	$: friends = getUserFriends($page.params.id);
	$: friendAvatars = friends.then(f => getUserIcons(f.map(f => f.id)));
	
	$: presences = friends.then(f => getUserPresences(f.map(f => f.id)));
	$: presenceExperiences = presences.then(p => getExperiences(p.filter(p => !!p.universeId).map(p => p.universeId)));

	$: displayName = getDisplayName($page.params.id);

	const sortOrder = writable(SortOrder.Name);
	const sortDirection = writable(SortDirection.Descending);

	$: sortedFriends = friends.then(items => {
		if ($sortOrder === SortOrder.UserStatus)
			return presences.then(presences => sortFriends(items, presences));
		return items.sort((a, b) => a.displayName.localeCompare(b.displayName));
	});
</script>

<div class="friends">
	{#await displayName then name}
		{#await friends then friends}
			<h2 class="header">{$t('friends', [name, friends.length])}</h2>
		{/await}
	{/await}
	<div class="options">
		<div>
			<p>{$t('pagination.sort_order')}</p>
			<Select.Root value={sortOrder} placeholder="">
				<p>{$t('pagination.sort_order')}</p>
				{#each Object.values(SortOrder) as item}
					{#if typeof item === 'number'}
						<Select.Item value={item}>
							{$t(`sort_order.${item}`)}
						</Select.Item>
					{/if}
				{/each}
			</Select.Root>
		</div>
		<div>
			<p>{$t('pagination.sort_direction')}</p>
			<Select.Root value={sortDirection} placeholder="">
				<p>{$t('pagination.sort_direction')}</p>
				{#each Object.values(SortDirection) as item}
					{#if typeof item === 'number'}
						<Select.Item value={item}>
							{$t(`sort_direction.${item}`)}
						</Select.Item>
					{/if}
				{/each}
			</Select.Root>
		</div>
	</div>
	<div class="items">
		{#await sortedFriends then items}
			{#each $sortDirection === SortDirection.Descending ? items : [...items].reverse() as item}
				{#await presences.then(p => p.find(p => p.userId === item.id)) then presence}
					<Friend
						user={item}
						avatar={friendAvatars.then(f => f.find(i => i.targetId === item.id))}
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
		.options {
			gap: 16px;
			display: flex;
			margin-bottom: 24px;
			div {
				& > p {
					color: var(--color-secondary);
					margin: 0 0 6px;
					font-size: .9em;
				}
			}
		}
		.items {
			gap: 0 24px;
			display: flex;
			flex-wrap: wrap;
		}
	}

	.header {
		width: 100%;
		margin: 0 0 24px;
	}
</style>