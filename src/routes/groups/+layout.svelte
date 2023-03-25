<script lang="ts">
	import { t } from '$lib/localization';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
</script>

<div class="main">
	<div class="groups">
		<p>Your Groups</p>
		{#each data.groups as group}
			<a class="group" href={`/groups/${group.id}`}>
				<img src={data.icons.find(icon => icon.targetId === group.id)?.imageUrl} alt="group icon" width="40" height="40"/>
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
		display: flex;
		.groups {
			margin: 16px 0 16px 16px;
			display: flex;
			flex-direction: column;
			p {
				margin: 0 0 12px;
				font-size: 16px;
				font-weight: 500;
			}
			.group {
				color: var(--color-primary);
				display: flex;
				padding: 6px 8px;
				font-size: 14px;
				background: var(--background-secondary);
				align-items: center;
				margin-bottom: 4px;
				border-radius: 8px;
				text-decoration: none;
				img {
					display: flex;
					border-radius: 4px;
				}
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