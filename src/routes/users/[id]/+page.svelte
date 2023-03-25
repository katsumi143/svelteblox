<script lang="ts">
	import { t } from '$lib/localization';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="main">
	<div class="landing">
		<img src={data.icon?.imageUrl} alt="user icon" width="120" height="120"/>
		<div class="details">
			<h1>{data.displayName}</h1>
			<p>@{data.name}</p>
		</div>
	</div>
	<p class="description">{data.description}</p>
</div>

<svelte:head>
	<title>{data.displayName}</title>
	<link rel="icon" type="image/png" href={data.icon?.imageUrl}>
</svelte:head>

<style lang="scss">
	.main {
		margin: 32px 96px;

		.landing {
			display: flex;
			align-items: center;
			img {
				background: var(--background-secondary);
				border-radius: 50%;
			}
			.details {
				margin-left: 32px;
				h1 {
					margin: 0;
					font-size: 2.25em;
				}
				p {
					color: var(--color-tertiary);
					margin: 8px 0 0;
				}
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