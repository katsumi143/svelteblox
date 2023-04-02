<script lang="ts">
	import Blocked from '$lib/icons/Blocked.svelte';
	export let src: Promise<string | undefined> | null = null;
	export let size: 'sm' | 'md' | 'lg' | 'lg2' | 'xl' = 'lg';
	export let circle = false;

	$: className = `avatar ${size}${circle ? ' circle' : ''}`;
</script>

{#if src}
	{#await src}
		<div class={className}><Blocked/></div>
	{:then image}
		{#if !image || image.includes('b48637b2a6266bd379a09afb5a8d5131') || image.includes('d5ffea87836a253a362647b6c8985786')}
			<div class={className}><Blocked/></div>
		{:else}
			<img src={image} alt="avatar" class={className}/>
		{/if}
	{/await}
{:else}
	<div class={className}><Blocked/></div>
{/if}

<style lang="scss">
	.avatar {
		color: var(--background-secondary);
		display: flex;
		background: var(--background-tertiary);
		align-items: center;
		justify-content: center;
		&.sm {
			width: 40px;
			height: 40px;
			border-radius: 4px;
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
	}
</style>