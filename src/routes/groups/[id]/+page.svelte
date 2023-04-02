<script lang="ts">
	import { t } from '$lib/localization';
	import Avatar from '$lib/components/Avatar.svelte';
	import CreatorLink from '$lib/components/CreatorLink.svelte';
	import { getUserIcon } from '$lib/api/users';
	import type { PageData } from './$types';
	import { getGroupIcons } from '$lib/api/groups';

	export let data: PageData;

	$: icon = getGroupIcons([data.id]).then(i => i[0]?.imageUrl);
	$: shoutIcon = data.shout ? getUserIcon(data.shout.poster.userId).then(i => i?.imageUrl) : null;
</script>

<div class="main">
	<div class="landing">
		<Avatar src={icon}/>
		<div class="details">
			<h1>{data.name}</h1>
			<p>by <CreatorLink id={data.owner.userId} name={data.owner.username} type="User" displayName={data.owner.displayName}/></p>
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
	<p class="description">{@html $t('description', [data.description])}</p>
	{#if data.shout}
		<h3 class="shout">{$t('group.shout')}</h3>
		<div class="shout">
			<Avatar src={shoutIcon} size="sm2" circle/>
			<div class="text">
				<CreatorLink id={data.shout.poster.userId} name={data.shout.poster.username} type="User" displayName={data.shout.poster.displayName}/>
				<p>{data.shout.body}</p>
				<p class="time">{$t('group.shout.time', [data.shout.updated])}</p>
			</div>
		</div>
	{/if}
</div>

<svelte:head>
	<title>{data.name}</title>
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
		h3.shout {
			margin: 48px 0 8px;
			font-weight: 500;
		}
		div.shout {
			display: flex;
			padding: 16px;
			background: var(--background-tertiary);
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
	}
</style>