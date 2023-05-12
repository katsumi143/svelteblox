<script lang="ts">
	import { t } from '$lib/localisation';
	import { Tabs } from '@voxelified/voxeliface';
	import { writable } from 'svelte/store';
	import { getUserIcon } from '$lib/api/users';
	import type { PageData } from './$types';
	import { GroupRelationship } from '$lib/api/enums';
	import type { ImageData } from '$lib/api/types';
	import { getGroupIcons, getRelatedGroups, getGroupExperiences2 } from '$lib/api/groups';

	import Avatar from '$lib/components/Avatar.svelte';
	import GroupItem from '$lib/components/GroupItem.svelte';
	import Description from '$lib/components/Description.svelte';
	import CreatorLink from '$lib/components/CreatorLink.svelte';
	import VerifiedBadge from '$lib/components/VerifiedBadge.svelte';
	import ExperienceItem from '$lib/components/ExperienceItem.svelte';

	import ArrowRight from '$lib/icons/ArrowRight.svelte';
	export let data: PageData;

	$: showShout = !!data.shout?.body;

	$: icon = getGroupIcons([data.id]).then(i => i[0]?.imageUrl);
	$: shoutIcon = showShout ? getUserIcon(data.shout!.poster.userId).then(i => i?.imageUrl) : null;
	$: experiences = getGroupExperiences2(data.id, 2);

	$: allies = getRelatedGroups(data.id, GroupRelationship.Allies);
	$: enemies = getRelatedGroups(data.id, GroupRelationship.Enemies);

	$: relatedIcons = new Promise<ImageData[]>(async resolve => {
		const groups = [...await allies, ...await enemies].map(g => g.id);
		if (groups.length > 0)
			return getGroupIcons(groups).then(resolve);
		resolve([]);
	});

	const tabValue = writable(0);
</script>

<div class="main">
	<div class="landing">
		<Avatar src={icon}/>
		<div class="details">
			<h1>
				{data.name}
				{#if data.hasVerifiedBadge}
					<VerifiedBadge size={24}/>
				{/if}
			</h1>
			<p>by <CreatorLink id={data.owner.userId} name={data.owner.username} type="User" displayName={data.owner.displayName} hasVerifiedBadge={data.owner.hasVerifiedBadge}/></p>
			<div class="extra">
				<p>{$t('group.members', [data])}</p>
			</div>
		</div>
		{#if !data.groups.some(group => group.id === data.id)}
			<button type="button" class="join">
				{$t('group.join')}
			</button>
		{/if}
	</div>
	<Tabs.Root value={tabValue}>
		<Tabs.Item value={0} title={$t('group.about')}>
			<p class="description"><Description input={data.description}/></p>
			{#if showShout && data.shout}
				<p class="shout">{$t('group.shout')}</p>
				<div class="shout">
					<Avatar src={shoutIcon} size="sm2" circle/>
					<div class="text">
						<CreatorLink id={data.shout.poster.userId} name={data.shout.poster.username} type="User" displayName={data.shout.poster.displayName}/>
						<p>{data.shout.body}</p>
						<p class="time">{$t('group.shout.time', [data.shout.updated])}</p>
					</div>
				</div>
			{/if}
		</Tabs.Item>
		<Tabs.Item value={1} title={$t('group.experiences')}>
			{#await experiences then items}
				{#if items.length > 0}
					<div class="experiences">
						<div class="list-header">
							<p>{$t('group.experiences')}</p>
							<a href={`/groups/${data.id}/games`}>{$t('action.view_all')}<ArrowRight/></a>
						</div>
						<div class="items">
							{#each items as item}
								<ExperienceItem id={item.id} name={item.name} playing={item.playing} rootPlaceId={item.rootPlaceId}/>
							{/each}
						</div>
					</div>
				{/if}
			{/await}
		</Tabs.Item>
		<Tabs.Item value={2} title={$t('group.related_groups')}>
			{#await allies then items}
				{#if items.length > 0}
					<div class="groups">
						<div class="list-header">
							<p>{$t('group_relationship.Allies')}</p>
							<a href={`/groups/${data.id}/games`}>{$t('action.view_all')}<ArrowRight/></a>
						</div>
						<div class="items">
							{#each items as item}
								<GroupItem
									id={item.id}
									name={item.name}
									icon={relatedIcons.then(d => d.find(i => i.targetId === item.id))}
									owner={item.owner}
									verified={item.hasVerifiedBadge}
									memberCount={item.memberCount}
								/>
							{/each}
						</div>
					</div>
				{/if}
			{/await}
			{#await enemies then items}
				{#if items.length > 0}
					<div class="groups">
						<div class="list-header">
							<p>{$t('group_relationship.Enemies')}</p>
							<a href={`/groups/${data.id}/games`}>{$t('action.view_all')}<ArrowRight/></a>
						</div>
						<div class="items">
							{#each items as item}
								<GroupItem
									id={item.id}
									name={item.name}
									icon={relatedIcons.then(d => d.find(i => i.targetId === item.id))}
									owner={item.owner}
									verified={item.hasVerifiedBadge}
									memberCount={item.memberCount}
								/>
							{/each}
						</div>
					</div>
				{/if}
			{/await}
		</Tabs.Item>
	</Tabs.Root>
</div>

<svelte:head>
	<title>{data.name}</title>
</svelte:head>

<style lang="scss">
	.main {
		margin: 32px 64px;

		.landing {
			display: flex;
			align-items: center;
			margin-bottom: 24px;
			.details {
				margin-left: 32px;
				h1 {
					margin: 0;
					font-size: 2.25em;
				}
				p {
					color: var(--color-tertiary);
					margin-top: 6px;
				}
				.extra {
					margin-top: 40px;
					p {
						margin: 0;
					}
				}
			}
			.join {
				color: var(--color-primary);
				height: fit-content;
				border: 1px solid var(--color-tertiary);
				padding: 6px 10px;
				font-size: 16px;
				background: none;
				font-weight: 400;
				margin-left: auto;
				font-family: var(--font-primary);
				border-radius: 8px;
			}
		}
		.description {
			color: var(--color-tertiary);
			margin: 16px 0 0;
			overflow: hidden;
			word-break: break-word;
			line-height: 1.25;
			white-space: pre-wrap;
		}
		p.shout {
			margin: 48px 0 12px;
			font-weight: 500;
		}
		div.shout {
			display: flex;
			padding: 16px;
			background: var(--background-secondary);
			border-radius: 16px;
			.text {
				margin-top: .25em;
				margin-left: 16px;
				p {
					color: var(--color-tertiary);
					margin: .25em 0 0;
				}
				.time {
					color: var(--color-secondary);
					font-size: .8em;
					margin-top: 24px;
				}
			}
		}
		.experiences, .groups {
			width: 100%;
			margin-top: 16px;
			.items {
				gap: 16px;
				width: 100%;
				display: flex;
			}
			&.groups .items {
				overflow: hidden;
			}
			&.experiences .items {
				flex-wrap: wrap;
			}
		}
	}
</style>