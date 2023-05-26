<script lang="ts">
	import Time from 'svelte-time';
	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import { getImages } from '$lib/api/images';
	import type { PageData } from './$types';
	import { getExperience } from '$lib/api/games';
	import { user, getUser, userHasBadge } from '$lib/api/users';
	export let data: PageData;

	import Avatar from '$lib/components/Avatar.svelte';
	import Description from '$lib/components/Description.svelte';
	import ExperienceCard from '$lib/components/ExperienceCard.svelte';

	import Star from '$lib/icons/Star.svelte';
	import People from '$lib/icons/People.svelte';
	import Sunrise from '$lib/icons/Sunrise.svelte';
	import Percentage from '$lib/icons/Percentage.svelte';
	import PencilSquare from '$lib/icons/PencilSquare.svelte';
	$: icon = getImages([data.displayIconImageId], '150x150')
		.then(data => data[0]);

	$: targetId = $page.url.searchParams.get('targetUser');
	$: target = targetId && targetId !== user.id.toString() ? getUser(targetId) : null;
	$: targetDate = target?.then(target => target ? userHasBadge(target.id, data.id) : null);
	
	$: awardDate = userHasBadge(user.id, data.id);
	$: experience = getExperience(data.awardingUniverse.id);
</script>

<div class="main">
	<div class="card">
		<div class="header">
			<Avatar src={icon.then(i => i?.imageUrl)} circle/>
			<div class="name">
				<h1>
					{data.name}
				</h1>
			</div>
		</div>
		<div class="status">
			<p class:red={!data.enabled}>{$t(`badge.enabled.${data.enabled}`)}</p>
			{#await awardDate then date}
				{#if date}
					<p class="white">•</p>
					<p class="white">{$t('badge.user_has')}</p>
				{/if}
			{/await}
		</div>
		<div class="separator"/>
		{#if data.description}
			<Description input={data.description}/>
			<div class="separator"/>
		{/if}
		{#await awardDate then date}
			{#if date}
				<div class="counter">
					<Star/>
					<p>{$t('badge.earn_date', [date.valueOf()])}</p>
					<p class="hover"><Time format={$t('date_format')} timestamp={date}/></p>
				</div>
			{/if}
		{/await}
		{#await target then user}
			{#if user}
				{#await targetDate then date}
					{#if date}
						<div class="counter">
							<Star/>
							<p>{$t('badge.earn_date.target', [user.displayName, date.valueOf()])}</p>
						</div>
					{/if}
				{/await}
			{/if}
		{/await}
		<div class="counter">
			<People/>
			<p>{data.statistics.awardedCount ? $t('badge.given', [data.statistics.awardedCount, data.statistics.pastDayAwardedCount]) : $t('badge.given.none')}</p>
		</div>
		{#if data.statistics.awardedCount}
			<div class="counter">
				<Percentage/>
				<p>{$t('badge.earned', [(data.statistics.winRatePercentage * 100).toString().slice(0, 4)])}</p>
			</div>
		{/if}
		<div class="separator"/>
		<div class="counter">
			<Sunrise/>
			<p>{$t('created_date', [data.created])}</p>
			<p class="hover"><Time format={$t('date_format')} timestamp={data.created}/></p>
		</div>
		<div class="counter">
			<PencilSquare/>
			<p>{$t('updated_date', [data.updated])}</p>
			<p class="hover"><Time format={$t('date_format')} timestamp={data.updated}/></p>
		</div>
		<div class="separator"/>
		<div class="counter">
			<Star/>
			<p>{$t('badge.id')} {data.id}</p>
		</div>
	</div>
	<div class="summary">
		{#await experience then experience}
			{#if experience}
				<ExperienceCard
					id={experience.id}
					name={experience.name}
					playing={experience.playing}
					rootPlaceId={experience.rootPlaceId}
					creatorName={experience.creator.name}
				/>
			{/if}
		{/await}
	</div>
</div>

<style lang="scss">
	.main {
		margin: 128px 32px 16px;
		display: flex;
		.card {
			width: 416px;
			padding: 24px;
			position: relative;
			min-width: 416px;
			background: var(--background-secondary);
			padding-top: 40px;
			border-radius: 16px;
			.header {
				gap: 32px;
				top: -96px;
				display: flex;
				position: absolute;
				align-items: center;
				.name {
					h1 {
						width: max-content;
						margin: 0;
						font-size: 2.5em;
					}
				}
			}
			.status {
				p {
					margin: 0;
					display: inline-block;
					font-weight: 600;
					&:first-child {
						color: #9eb6eb;
					}
					&:nth-child(2) {
						margin: 0 2px;
					}
					&.red {
						color: #e4a3a3;
					}
				}
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
			:global(.confetti) {
				top: 50%;
				left: 50%;
				position: absolute;
			}
		}
		.summary {
			margin-left: 32px;
		}
	}
</style>