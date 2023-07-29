<script lang="ts">
	import Time from 'svelte-time';
	import { t } from '$lib/localisation';
	import { getAssetIcon } from '$lib/api/assets';
	import type { PageData } from './$types';
	export let data: PageData;

	import Avatar from '$lib/components/Avatar.svelte';
	import Description from '$lib/components/Description.svelte';
	import CreatorLink from '$lib/components/CreatorLink.svelte';

	import Star from '$lib/icons/Star.svelte';
	import Sunrise from '$lib/icons/Sunrise.svelte';
	import PencilSquare from '$lib/icons/PencilSquare.svelte';
	$: icon = getAssetIcon(data.asset.id);
</script>

<div class="main">
	<div class="card">
		<div class="header">
			<Avatar src={icon.then(i => i?.imageUrl)} hover/>
			<div class="name">
				<h1>
					{data.asset.name}
				</h1>
			</div>
		</div>
		<p class="author">{$t('creator', [''])} <CreatorLink id={data.creator.id} name={data.creator.name} type={data.creator.type === 1 ? 'User' : 'Group'}/></p>
		<div class="separator"/>
		{#if data.asset.description}
			<Description input={data.asset.description}/>
			<div class="separator"/>
		{/if}
		<div class="counter">
			<Sunrise/>
			<p>{$t('created_date', [data.asset.createdUtc])}</p>
			<p class="hover"><Time format={$t('date_format')} timestamp={data.asset.createdUtc}/></p>
		</div>
		<div class="counter">
			<PencilSquare/>
			<p>
				{$t('updated_date', [data.asset.updatedUtc])}
				{#if data.creator.latestGroupUpdaterUserName}
					{$t('creator', [''])} <CreatorLink id={data.creator.latestGroupUpdaterUserId} type="User" name={data.creator.latestGroupUpdaterUserName}/>
				{/if}
			</p>
			<p class="hover"><Time format={$t('date_format')} timestamp={data.asset.updatedUtc}/></p>
		</div>
		<div class="separator"/>
		<div class="counter">
			<Star/>
			<p>{$t('asset.id', [data.asset.id])}</p>
		</div>
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
			.author {
				color: var(--color-secondary);
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
		}
	}
</style>