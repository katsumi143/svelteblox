<script lang="ts">
	import { t } from '$lib/localisation';
	import Blocked from '$lib/icons/Blocked.svelte';
	import Question from '$lib/icons/Question.svelte';
	import Hourglass from '$lib/icons/Hourglass.svelte';
	export let src: Promise<string | undefined> | null = null;
	export let size: 'xs' | 'sm' | 'sm2' | 'md' | 'lg' | 'lg2' | 'xl' = 'lg';
	export let circle = false;
	export let transparent = false;

	$: className = `avatar ${size}${circle ? ' circle' : ''}${transparent ? ' transparent' : ''}`;
	const deleted = /9fc30fe577bf95e045c9a3d4abaca05d|b48637b2a6266bd379a09afb5a8d5131|4ddecd2c3b001fe699e1d2ffb8379b9e|920be870da39e6a99a7e0065123a78ff/g;
	const pending = /(;)$/g;
	const unavailable = /bf5841143a43ff8b754b7026159a2a18|d5ffea87836a253a362647b6c8985786|48cfb097485466057bde81b5f1f209e7/g;
</script>

{#if src}
	{#await src}
		<div class={className} title={$t('image_status.0')} on:contextmenu><Hourglass/><slot/></div>
	{:then image}
		{#if !image || image.match(deleted)}
			<div class={className} title={$t('image_status.2')} on:contextmenu><Blocked/><slot/></div>
		{:else if image.match(pending)}
			<div class={className} title={$t('image_status.1')} on:contextmenu><Hourglass/><slot/></div>
		{:else if image.match(unavailable)}
			<div class={className} title={$t('image_status.3')} on:contextmenu><Question size={32}/><slot/></div>
		{:else}
			<div class={className} on:contextmenu>
				<img src={image} alt="avatar"/>
				<slot/>
			</div>
		{/if}
	{/await}
{:else}
	<div class={className} title={$t('image_status.3')} on:contextmenu><Question size={32}/></div>
{/if}

<style lang="scss">
	.avatar {
		color: var(--color-secondary);
		display: flex;
		position: relative;
		background: var(--background-secondary);
		align-items: center;
		justify-content: center;
		img {
			width: inherit;
			height: inherit;
			border-radius: inherit;
		}
		&.xs {
			width: 24px;
			height: 24px;
			border-radius: 4px;
			:global(svg) {
				width: 16px;
				height: 16px;
			}
		}
		&.sm {
			width: 40px;
			height: 40px;
			border-radius: 4px;
			:global(svg) {
				width: 24px;
				height: 24px;
			}
		}
		&.sm2 {
			width: 50px;
			height: 50px;
			border-radius: 4px;
			:global(svg) {
				width: 24px;
				height: 24px;
			}
		}
		&.md {
			width: 80px;
			height: 80px;
			border-radius: 8px;
		}
		&.lg {
			width: 120px;
			height: 120px;
			box-shadow: 0 8px 16px 2px #00000040;
			border-radius: 8px;
		}
		&.lg2 {
			width: 128px;
			height: 128px;
			border-radius: 8px;
		}
		&.xl {
			width: 250px;
			height: 250px;
			border-radius: 8px;
		}
		&.circle {
			border-radius: 50%;
		}
		&.transparent {
			background: none;
		}
	}
</style>