<script lang="ts">
	import '@voxelified/voxeliface/styles.scss';
	import Logo from '$lib/components/TextLogo.svelte';
	import { t } from '$lib/localization';
	import { Header } from '@voxelified/voxeliface';
	import PageLoader from '$lib/components/PageLoader.svelte';
</script>

<div class="app theme-dark">
	<Header>
		<a href="/" class="logo"><Logo/></a>
		<a href="/" class="nav-link">{$t('home')}</a>
	</Header>
	<main class="app-content">
		<slot/>
	</main>
	<footer>
		svelte svelte svelte blox blox blox
		<a href="/">placeholder</a>
	</footer>
</div>

<PageLoader/>

<style lang="scss">
	.app {
		display: flex;
		min-height: 100vh;
		background: var(--background-primary);
		flex-direction: column;
		--color-secondary: hsl(0 0% 70%);
		--color-tertiary: hsl(0 0% 80%);
		--background-secondary: hsl(0 0% 40%);
		--background-tertiary: hsl(0 0% 30%);
	}
	:global(body) {
		overflow: hidden auto;
	}

	:global(header) {
		display: flex;
	}
	.nav-link {
		color: var(--color-primary);
		margin: 14px 12px;
		text-decoration: none;
	}

	footer {
		gap: 4px;
		color: var(--color-secondary);
		display: flex;
		padding: 40px 24px;
		margin-top: auto;
		background: var(--background-header);
		flex-direction: column;
		justify-content: center;
		a {
			color: var(--color-tertiary);
			text-decoration: none;
		}
	}
</style>