<script lang="ts">
	import { t } from '$lib/localization';
	import Avatar from '$lib/components/Avatar.svelte';
	import { getGroupIcons } from '$lib/api/groups';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	const icons = getGroupIcons(data.groups.map(group => group.id));
</script>

<div class="main">
	<div class="groups">
		<p>Your Groups</p>
		{#each data.groups as group}
			<a class="group" href={`/groups/${group.id}`}>
				<Avatar src={icons.then(i => i.find(icon => icon.targetId === group.id)?.imageUrl)} size="sm"/>
				<p>{group.name}</p>
			</a>
		{/each}
	</div>
	<div class="group">
		<slot/>
	</div>
</div>

<style lang="scss">
	.main {
		height: 100%;
		display: flex;
		.groups {
			width: 320px;
			height: 100%;
			display: flex;
			padding: 16px 0 16px 16px;
			overflow: hidden auto;
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
		.group {
			width: 100%;
		}
	}
</style>