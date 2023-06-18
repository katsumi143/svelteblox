<script lang="ts">
	import { t } from '../localisation';
	import type { Group, ImageData } from '$lib/api/types';

	import Avatar from './Avatar.svelte';
	import VerifiedBadge from './VerifiedBadge.svelte';

	import Eye from '../icons/Eye.svelte';
	import People from '../icons/PeopleFill.svelte';
	export let icon: Promise<ImageData | null | undefined> | null = null;
	export let group: Group;
	export let userRole: [string, string] | null = null;
</script>

<a class="group focusable" href={`/group/${group.id}`} title={group.name}>
	<Avatar src={icon?.then(i => i?.imageUrl)} size="md" hover/>
	<div class="header">
		<h1>
			{group.name}
			{#if group.hasVerifiedBadge}
				<VerifiedBadge size={24}/>
			{/if}
		</h1>
		<p>{$t('creator', [group.owner.displayName])}</p>
	</div>
	<div class="details">
		<p><Eye/>{$t(`group_entry.${group.publicEntryAllowed}`)}</p>
		<p><People/>{$t('group.members.count', [group.memberCount])}</p>
		{#if userRole}
			<p class="role">{$t('group.user_role', userRole)}</p>
		{/if}
	</div>
</a>

<style lang="scss">
	.group {
		display: flex;
		padding: 16px;
		flex-wrap: wrap;
		background: var(--background-secondary);
		align-items: center;
		border-radius: 16px;
		.header {
			margin-left: 16px;
			h1, p { margin: 0; }
			h1 {
				font-weight: 800;
			}
			p {
				color: var(--color-tertiary);
				font-size: .95em;
			}
		}
		.details {
			gap: 16px;
			width: 100%;
			display: flex;
			margin-top: 16px;
			p {
				color: var(--color-secondary);
				margin: 0;
				font-size: .95em;
				font-weight: 500;
				:global(svg) {
					margin-right: 6px;
					margin-bottom: -2px;
				}
			}
			.role {
				margin-left: auto;
			}
		}
		&:hover {
			box-shadow: inset 0 0 0 1px var(--border-secondary);
			text-decoration: none;
		}
	}
</style>