<script lang="ts">
	import { t } from '$lib/localisation';
	import Avatar from '$lib/components/Avatar.svelte';
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
				<p>{group.name}</p>
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
				p {
					margin: 0 0 0 12px;
					font-size: 1.1em;
					font-weight: 450;
				}
			}
		}
		.group-page {
			width: 100%;
			overflow: hidden;
		}
	}
</style>