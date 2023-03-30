<script lang="ts">
	import { t } from '$lib/localization';
	import Avatar from '$lib/components/Avatar.svelte';
	import CreatorLink from '$lib/components/CreatorLink.svelte';
	import type { PageData } from './$types';
	import { getGroupIcons } from '$lib/api/groups';

	export let data: PageData;

	$: icon = getGroupIcons([data.id]).then(i => i[0]?.imageUrl);
</script>

<div class="main">
	<div class="landing">
		<Avatar src={icon}/>
		<div class="details">
			<h1>{data.name}</h1>
			<p>by <CreatorLink id={data.owner.userId} name={data.owner.username} type="User" displayName={data.owner.displayName}/></p>
			<div class="extra">
				<p>{data.memberCount} members</p>
			</div>
		</div>
		{#if !data.groups.some(group => group.id === data.id)}
			<button type="button" class="join">
				{$t('group.join')}
			</button>
		{/if}
	</div>
	<p class="description">{data.description}</p>
</div>

<svelte:head>
	<title>{data.name}</title>
	{#await icon then icon}
		<link rel="icon" type="image/png" href={icon}>
	{/await}
</svelte:head>

<style lang="scss">
	.main {
		margin: 32px 96px;

		.landing {
			display: flex;
			align-items: center;
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
			margin: 24px 0 0;
			overflow: hidden;
			word-break: break-word;
			line-height: 1.25;
			white-space: pre-wrap;
		}
	}
</style>