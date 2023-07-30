<script lang="ts">
	import { t } from '../localisation';
	import { page } from '$app/stores';

	import BoxArrowUpRight from '$lib/icons/BoxArrowUpRight.svelte';
	export let id: string;
	export let path: string;
	export let footer = false;

	$: active = $page.url.pathname === path;
</script>

<a href={path} class="focusable" target={path.startsWith('/') ? '_self' : '_blank'} class:active class:footer>
	<slot/>
	{$t(id)}
	{#if !path.startsWith('/')}
		<BoxArrowUpRight/>
	{/if}
</a>

<style lang="scss">
	a {
		gap: 12px;
		display: flex;
		padding: 8px 16px;
		font-size: .9em;
		transition: background .25s, box-shadow .25s;
		align-items: center;
		border-radius: 8px;
		text-decoration: none;
		&.active, &:hover {
			box-shadow: var(--button-shadow);
			background: var(--background-secondary);
			text-decoration: none;
		}
		&.footer {
			margin-top: auto;
		}
		:global(.icon-box-arrow-up-right) {
			margin-left: auto;
		}
	}
</style>