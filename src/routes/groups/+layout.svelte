<script lang="ts">
	import { t } from '$lib/localisation';
	import Avatar from '$lib/components/Avatar.svelte';
	import VerifiedBadge from '$lib/components/VerifiedBadge.svelte';
	import { getGroupIcons } from '$lib/api/groups';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	const icons = getGroupIcons(data.groups.map(group => group.id));
</script>

<div class="main">
	<div class="groups">
		<p>{$t('groups.list')}</p>
		{#each data.groups as group}
			<a class="group" href={`/groups/${group.id}`}>
				<Avatar src={icons.then(i => i.find(icon => icon.targetId === group.id)?.imageUrl)} size="sm"/>
				<div>
					<p>
						{group.name}
						{#if group.hasVerifiedBadge}
							<VerifiedBadge size={12}/>
						{/if}
					</p>
					<p class="owner">{$t('creator', [group.owner.displayName])}</p>
				</div>
			</a>
		{/each}
	</div>
	<div class="group-page">
		<slot/>
	</div>
</div>

<style lang="scss">
	.main {
		display: flex;
		.groups {
			height: 100%;
			margin: 16px 0 0 16px;
			display: flex;
			overflow: auto;
			min-width: 20%;
			padding-bottom: 12px;
			flex-direction: column;
			p {
				margin: 0 0 12px;
				font-size: 16px;
				font-weight: 500;
			}
			.group {
				width: auto;
				color: var(--color-primary);
				display: flex;
				padding: 6px 8px;
				font-size: 14px;
				background: var(--background-secondary);
				align-items: center;
				margin-bottom: 4px;
				border-radius: 8px;
				text-decoration: none;
				div {
					overflow: hidden;
					p {
						margin: 0 0 0 12px;
						overflow: hidden;
						font-size: 1.1em;
						font-weight: 450;
						white-space: nowrap;
						text-overflow: ellipsis;
					}
					.owner {
						color: var(--color-secondary);
						font-size: .85em;
						margin-top: .2em;
					}
				}
			}
		}
		.group-page {
			width: 100%;
			overflow: hidden;
		}
	}
</style>