<script lang="ts">
	import { t } from '$lib/localization';
	import Avatar from '$lib/components/Avatar.svelte';
	import ExperienceItem from '$lib/components/ExperienceItem.svelte';
	import ExperienceCard from '$lib/components/ExperienceCard.svelte';
	import type { PageData } from './$types';
	import { getExperiences } from '$lib/api/games';
	import { getUserIcon, getUserPresences, getUserFullBodies, getUserFavourites, getUserFriendCount, getUserFollowerCount, getUserFollowingCount } from '$lib/api/users';

	export let data: PageData;

	$: icon = getUserIcon(data.id);
	$: presence = getUserPresences([data.id]).then(data => data[0]);
	$: fullBody = getUserFullBodies([data.id]);
	$: currentExperience = presence.then(p => p ? getExperiences([p.universeId]).then(e => e[0]) : null);
</script>

<div class="main">
	<div class="landing">
		<Avatar src={icon.then(i => i?.imageUrl)} circle/>
		<div class="name">
			<h1>
				{data.displayName}
				{#await presence then presence}
					<p class="status">{$t(`user_status.${presence.userPresenceType}`)}</p>
				{/await}
			</h1>
			<p>@{data.name}</p>
		</div>
	</div>
	<div class="details">
		{#await getUserFriendCount(data.id) then count}
			<a href={`/users/${data.id}/friends`}>{count}</a> <p>{$t('user.friends')}</p>
		{/await}
		{#await getUserFollowerCount(data.id) then count}
			<a href={`/users/${data.id}/friends`}>{count}</a> <p>{$t('user.followers')}</p>
		{/await}
		{#await getUserFollowingCount(data.id) then count}
			<a href={`/users/${data.id}/friends`}>{count}</a> <p>{$t('user.following')}</p>
		{/await}
	</div>
	<p class="description">{data.description}</p>

	{#await currentExperience then experience}
		{#if experience}
			<div class="experience">
				<p class="header">{$t('user.experience')}</p>
				<ExperienceCard data={experience} friendId={data.id} friendName={data.displayName}/>
			</div>
		{/if}
	{/await}

	<div class="avatar">
		<p class="header">{$t('user.avatar')}</p>
		<Avatar src={fullBody.then(f => f[0]?.imageUrl)} size="xl"/>
	</div>
	
	<div class="favourites">
		<div class="header">
			<p>{$t('user.favourites')}</p>
			<a href="/">View All</a>
		</div>
		<div class="items">
			{#await getUserFavourites(data.id).then(f => getExperiences(f.map(e => e.id))) then items}
				{#each items as item}
					<ExperienceItem data={item}/>
				{/each}
			{/await}
		</div>
	</div>
</div>

<svelte:head>
	<title>{data.displayName}</title>
	{#await icon then icon}
		<link rel="icon" type="image/png" href={icon?.imageUrl}>
	{/await}
</svelte:head>

<style lang="scss">
	.main {
		margin: 32px 96px;

		.landing {
			display: flex;
			align-items: center;
			.name {
				margin-left: 32px;
				h1 {
					margin: 0;
					display: flex;
					font-size: 2.25em;
				}
				p {
					color: var(--color-tertiary);
					margin: 8px 0 0;
				}
				.status {
					margin: 1em 0 0 16px;
					font-size: .4em;
					font-weight: 400;
				}
			}
		}
		.details {
			color: var(--color-secondary);
			display: flex;
			margin-top: 16px;
			align-items: end;
			margin-left: 16px;
			a {
				color: var(--color-primary);
				margin-right: 4px;
				text-decoration: none;
			}
			p {
				margin: 0 16px 0 0;
				font-size: .9em;
				line-height: 1.25;
			}
		}
		.description {
			color: var(--color-tertiary);
			margin: 24px 0 0;
			overflow: hidden;
			word-break: break-word;
			line-height: 1.25;
			white-space: pre-wrap;
		}

		.experience {
			margin-top: 64px;
		}

		.avatar {
			margin-top: 64px;
		}

		.favourites {
			margin: 64px 0;
			.items {
				gap: 16px;
				height: 200px;
				display: flex;
				overflow: hidden;
			}
		}
	}
	.header {
		width: 100%;
		margin: 0 0 12px;
		display: flex;
		font-weight: 500;
		justify-content: space-between;
		p { margin: 0; }
		a {
			color: var(--color-primary);
			font-size: .9em;
			text-decoration: none;
		}
	}
</style>