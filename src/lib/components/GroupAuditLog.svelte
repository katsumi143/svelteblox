<script lang="ts">
	import { t } from '../localisation';
	import { getUserIcons } from '../api/users';
	import { getGroupAuditLog } from '../api/groups';

	import Avatar from './Avatar.svelte';
	import Loading from './Loading.svelte';
	import Pagination from './Pagination.svelte';
	export let groupId: number;

	$: data = getGroupAuditLog(groupId, 100, cursor);
	$: icons = data.then(d => getUserIcons(d.data.map(d => d.actor.user.userId)));
	let cursor: string | null = null;
</script>

<Pagination {data} bind:cursor>
	{#await data}
		<Loading size={32}/>
	{:then { data }}
		{#each data as item}
			<div class="post">
				<Avatar src={icons.then(i => i.find(i => i.targetId === item.actor.user.userId)?.imageUrl)} size="sm" circle/>
				<div>
					<p class="name">
						<a href={`/user/${item.actor.user.username}`}>{item.actor.user.displayName}</a>
						{$t(`group_audit.action.${item.actionType}`, [item.created, item.description])}
					</p>
					<p class="description">{$t('group_audit.summary')}</p>
				</div>
			</div>
		{/each}
	{/await}
</Pagination>

<style lang="scss">
	.post {
		gap: 8px;
		width: 100%;
		padding: 8px;
		display: flex;
		position: relative;
		background: var(--background-secondary);
		border-radius: 16px;
		:global(.avatar) {
			background: var(--background-tertiary);
		}
		div {
			margin-top: 8px;
			.name {
				color: var(--color-secondary);
				margin: 0;
				font-size: .95em;
			}
			.description {
				color: var(--color-tertiary);
				font-size: .9em;
				margin-top: 6px;
				margin-bottom: 8px;
			}
		}
	}
</style>