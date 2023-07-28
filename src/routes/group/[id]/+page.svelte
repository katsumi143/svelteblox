<script lang="ts">
	import Time from 'svelte-time';
	import { writable } from 'svelte/store';
	import { Tabs, Button, DropdownMenu } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { getUserIcon } from '$lib/api/users';
	import type { PageData } from './$types';
	import { getExperienceThumbnails2 } from '$lib/api/games';
	import { joinGroup, GROUPS_CACHE, getGroupIcons, getGroupSocials, getGroupExperiences2 } from '$lib/api/groups';
	export let data: PageData;

	import Avatar from '$lib/components/Avatar.svelte';
	import GroupWall from '$lib/components/GroupWall.svelte';
	import SocialLink from '$lib/components/SocialLink.svelte';
	import CreatorLink from '$lib/components/CreatorLink.svelte';
	import Description from '$lib/components/Description.svelte';
	import GroupMembers from '$lib/components/GroupMembers.svelte';
	import GroupAuditLog from '$lib/components/GroupAuditLog.svelte';
	import VerifiedBadge from '$lib/components/VerifiedBadge.svelte';
	import ExperienceCard from '$lib/components/ExperienceCard.svelte';

	import Eye from '$lib/icons/Eye.svelte';
	import Star from '$lib/icons/Star.svelte';
	import Burger from '$lib/icons/Burger.svelte';
	import Person from '$lib/icons/Person.svelte';
	import People from '$lib/icons/People.svelte';
	import Sunrise from '$lib/icons/Sunrise.svelte';
	import PersonPlus from '$lib/icons/PersonPlus.svelte';
	import RobloxIcon from '$lib/icons/RobloxIcon.svelte';
	import ClipboardPlus from '$lib/icons/ClipboardPlus.svelte';
	import RobloxStudio2 from '$lib/icons/RobloxStudio2.svelte';
	$: group = data.group;
	$: icons = getGroupIcons([group.id, ...data.groups.map(g => g.group.id)]);
	
	$: socials = getGroupSocials(group.id);
	$: experiences = getGroupExperiences2(group.id, 2);
	$: experienceThumbnails = experiences.then(i => i.length ? getExperienceThumbnails2(i.map(e => e.id)) : []);
	
	$: shouter = data.group.shout?.poster;
	$: shouterIcon = shouter ? getUserIcon(shouter.userId) : null;

	$: selfRole = data.membership.userRole.role;

	let joining = false;
	let tabValue = 0;
	let menuTrigger: () => void;
	const join = () => {
		joining = true;
		joinGroup(group.id).then(() => {
			GROUPS_CACHE.invalidate(`group/${group.id}`);
			GROUPS_CACHE.invalidate(`group/${group.id}/membership`);
			GROUPS_CACHE.invalidate('roles');
			location.reload();
		});
	};
</script>

<div class="main">
	<div class="cards">
		<div class="card">
			<div class="header">
				<Avatar src={icons.then(i => i[0]?.imageUrl)} hover/>
				<h1>
					{group.name}
					{#if group.hasVerifiedBadge}
						<VerifiedBadge size={32}/>
					{/if}
				</h1>
			</div>
			<div class="buttons">
				{#if !data.membership.userRole.role.rank}
					<Button disabled={joining} on:click={join}><PersonPlus/>{$t(`group.join.${group.publicEntryAllowed}`)}</Button>
				{/if}
				<DropdownMenu bind:trigger={menuTrigger}>
					<Button slot="trigger" on:click={menuTrigger}><Burger/></Button>
					<p>{group.name}</p>
					<a href={`https://roblox.com/groups/${group.id}`} target="_blank">
						<RobloxIcon/>
						{$t('action.view_roblox')}
					</a>
					{#if data.membership.permissions.groupEconomyPermissions.manageGroupGames}
						<a href={`https://create.roblox.com/dashboard/creations?groupId=${group.id}`} target="_blank">
							<RobloxStudio2/>
							{$t('action.view_creations')}
						</a>
					{/if}
					<button type="button" on:click={() => navigator.clipboard.writeText(group.id.toString())}>
						<ClipboardPlus/>{$t('action.copy_id')}
					</button>
				</DropdownMenu>
			</div>
			<div class="counter">
				<Eye/>
				<p>{$t(`group_entry.${group.publicEntryAllowed}`)}</p>
			</div>
			<div class="counter">
				<Person/>
				<p>{$t('group.owner')}</p>
				<CreatorLink id={data.group.owner.userId} type="User" name={data.group.owner.username} displayName={data.group.owner.displayName}/>
				{#if group.owner.hasVerifiedBadge}
					<VerifiedBadge/>
				{/if}
			</div>
			{#if selfRole.rank > 0}
				<div class="separator"/>
				<div class="counter">
					<Star/>
					<p>{$t('group.role', [selfRole.name])}</p>
				</div>
			{/if}
			<div class="separator"/>
			<div class="counter">
				<People/>
				<p>{$t('group.members.count', [data.group.memberCount])}</p>
			</div>
			<div class="counter">
				<Sunrise/>
				<p>{$t('created_date', [data.group2.created])}</p>
				<p class="hover"><Time format={$t('date_format')} timestamp={data.group2.created}/></p>
			</div>
			<div class="separator"/>
			<div class="counter">
				<Star/>
				<p>{$t('group.id', [group.id])}</p>
			</div>
		</div>
		{#if group.shout?.body}
			<div class="shout">
				<div class="user">
					<Avatar src={shouterIcon?.then(i => i?.imageUrl)} size="sm2" hover circle/><p class="name">
						<a href={`/user/${shouter?.username}`}>{shouter?.displayName}</a>
						{$t('group_post.name', [group.shout.updated])}
					</p>
				</div>
				<Description input={group.shout.body}/>
			</div>
		{/if}
		<div class="groups">
			<p class="list-header">{$t('groups.list')}</p>
			{#each data.groups as item}
				<a href={`/group/${item.group.id}`} title={item.group.name}>
					<Avatar src={icons.then(i => i.find(i => i.targetId === item.group.id)?.imageUrl)} size="sm2"/>
				</a>
			{/each}
		</div>
	</div>
	<Tabs.Root bind:value={tabValue}>
		<Tabs.Item value={0} title={$t('profile.overview')}>
			{#if group.description}
				<Description input={group.description}/>
			{/if}
			{#await socials then items}
				{#if items.length}
					<p class="list-header">{$t('experience.socials')}</p>
					<div class="socials">
						{#each items as item}
							<SocialLink data={item}/>
						{/each}
					</div>
				{/if}
			{/await}
		</Tabs.Item>
		<Tabs.Item value={1} title={$t('group.wall')}>
			<GroupWall
				groupId={group.id}
				canView={data.membership.permissions.groupPostsPermissions.viewWall}
				canPost={data.membership.permissions.groupPostsPermissions.postToWall}
				canDelete={data.membership.permissions.groupPostsPermissions.deleteFromWall}
			/>
		</Tabs.Item>
		<Tabs.Item value={2} title={$t('group.experiences')}>
			{#await experiences then items}
				{#if items.length}
					<div class="experiences">
						{#each items as item}
							<ExperienceCard
								id={item.id}
								name={item.name}
								playing={item.playing}
								thumbnail={experienceThumbnails.then(t => t.find(i => i.universeId === item.id)?.thumbnails[0]?.imageUrl)}
								rootPlaceId={item.rootPlaceId}
							/>
						{/each}
					</div>
				{/if}
			{/await}
		</Tabs.Item>
		<Tabs.Item value={3} title={$t('group.members')}>
			<GroupMembers groupId={group.id}/>
		</Tabs.Item>
		{#if data.membership.permissions.groupManagementPermissions.viewAuditLogs}
			<Tabs.Item value={4} title={$t('group.audit')}>
				<GroupAuditLog groupId={group.id}/>
			</Tabs.Item>
		{/if}
	</Tabs.Root>
</div>

<svelte:head>
	<title>{group.name}</title>
</svelte:head>

<style lang="scss">
	.main {
		margin: 128px 32px 16px;
		display: flex;
		.card {
			width: 416px;
			height: fit-content;
			padding: 24px;
			position: relative;
			min-width: 416px;
			background: var(--background-secondary);
			padding-top: 48px;
			border-radius: 16px;
			.header {
				gap: 32px;
				top: -96px;
				display: flex;
				position: absolute;
				align-items: center;
				h1 {
					width: max-content;
					margin: 0;
					font-size: 2.5em;
				}
			}
			.buttons {
				gap: 8px;
				top: 24px;
				right: 24px;
				display: flex;
				position: absolute;
			}
			.separator {
				width: 100%;
				height: 1px;
				margin: 16px 0;
				background: var(--border-secondary);
			}
			.counter {
				gap: 6px;
				width: fit-content;
				display: flex;
				position: relative;
				align-items: end;
				margin-bottom: 12px;
				p {
					color: var(--color-tertiary);
					margin: 0;
					white-space: nowrap;
				}
				:global(a) {
					line-height: 100%;
				}
				.hover {
					top: calc(100% + 8px);
					left: 50%;
					color: var(--color-primary);
					border: 1px solid var(--border-primary);
					opacity: 0;
					z-index: 1000;
					padding: 8px 12px;
					position: absolute;
					font-size: 12px;
					transform: translateX(-50%);
					background: var(--background-primary);
					box-shadow: rgb(22 23 24 / 35%) 0px 0px 20px 4px;
					border-radius: 8px;
					pointer-events: none;
				}
				&:hover .hover {
					opacity: 1;
				}
			}
		}
		.shout {
			width: 416px;
			padding: 32px 24px 24px;
			position: relative;
			min-width: 416px;
			margin-top: 64px;
			background: var(--background-secondary);
			border-radius: 16px;
			.user {
				gap: 16px;
				top: -48px;
				display: flex;
				position: absolute;
				align-items: center;
				margin-bottom: 8px;
				:global(.avatar) {
					--avatar-size: 64px;
				}
				.name {
					color: var(--color-secondary);
					margin: 0;
					font-size: 1.1em;
					font-weight: 600;
				}
			}
		}
		.groups {
			gap: 8px;
			width: 416px;
			display: flex;
			padding: 24px;
			position: relative;
			flex-wrap: wrap;
			min-width: 416px;
			margin-top: 32px;
			background: var(--background-secondary);
			border-radius: 16px;
			.list-header {
				margin-top: 0;
			}
		}
		.socials {
			gap: 8px;
			display: flex;
		}
		.list-header {
			margin-top: 48px;
		}
		.experiences {
			gap: 8px;
			display: flex;
			flex-wrap: wrap;
			:global(.experience) {
				flex: 1 1 calc(50% - 8px);
				width: unset;
			}
		}
		:global(.tabs-container) {
			width: 100%;
			overflow: hidden;
			margin-left: 32px;
			margin-bottom: 64px;
			:global(.description) {
				margin-top: 16px;
			}
		}
	}
</style>