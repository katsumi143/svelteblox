<script lang="ts">
	import { t } from '$lib/localization';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="main">
	<div class="landing">
		<img src={data.icon?.imageUrl} alt="group icon"/>
		<div class="details">
			<h1>{data.name}</h1>
			<p>by <a href={`/users/${data.owner.userId}`}>{data.owner.displayName}</a></p>
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
	<link rel="icon" type="image/png" href={data.icon?.imageUrl}>
</svelte:head>

<style lang="scss">
	.main {
		margin: 32px 96px;

		.landing {
			display: flex;
			align-items: center;
			img { border-radius: 8px; }
			.details {
				margin-left: 32px;
				h1 {
					margin: 0;
					font-size: 2.25em;
				}
				p {
					color: var(--color-tertiary);
					margin-top: 6px;
					a {
						color: var(--color-primary);
						text-decoration: none;
					}
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