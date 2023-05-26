<script lang="ts">
	import { Select } from '@voxelified/voxeliface';
	import { writable } from 'svelte/store';
	import { onDestroy } from 'svelte';

	import { t } from '../localisation';
	import { getUserIcons } from '../api/users';
	import { getGroupRoles, getGroupMembers } from '../api/groups';

	import User from './User.svelte';
	import Loading from './Loading.svelte';
	import Pagination from './Pagination.svelte';
	export let groupId: number;

	$: roles = getGroupRoles(groupId).then(data => data.slice(1));
	$: users = roles.then(roles => getGroupMembers(groupId, roles[$value].id, 50, cursor));
	$: userIcons = users.then(users => getUserIcons(users.data.map(u => u.userId)));

	let value = writable(0);
	let cursor: string | null = null;
	onDestroy(value.subscribe(() => cursor = null));
</script>

<div class="members">
	{#await roles then items}
		<Select.Root bind:value>
			<p>{$t('group_users.select')}</p>
			{#each items as item, key}
				<Select.Item value={key}>
					{$t('group_users.role', [item.name, item.memberCount])}
				</Select.Item>
			{/each}
		</Select.Root>
	{/await}
	<Pagination data={users} bind:cursor>
		{#await users}
			<Loading size={32}/>
		{:then items}
			{#each items.data as item}
				<User
					id={item.userId}
					name={item.username}
					avatar={userIcons.then(u => u.find(i => i.targetId === item.userId))}
					displayName={item.displayName}
				/>
			{/each}
		{/await}
	</Pagination>
</div>

<style lang="scss">
	.members {
		:global(.pagination-items) {
			gap: 0 16px;
			flex-wrap: wrap;
			margin-top: 16px;
		}
	}
</style>