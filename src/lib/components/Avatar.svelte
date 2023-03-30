<script lang="ts">
	import Blocked from '$lib/icons/Blocked.svelte';
	export let src: Promise<string | undefined> | null = null;
	export let size: 'md' | 'lg' = 'lg';
	//export let size: number;

	let className: string;
	$: className = `avatar ${size}`;
</script>

{#if src}
	{#await src}
		<div class={className}/>
	{:then image}
		{#if !image || image.includes('b48637b2a6266bd379a09afb5a8d5131')}
			<div class={className}><Blocked/></div>
		{:else}
			<img src={image} alt="avatar" class={className}/>
		{/if}
	{/await}
{:else}
	<div class={className}/>
{/if}

<style lang="scss">
	.avatar {
		color: var(--background-secondary);
		display: flex;
		background: var(--background-tertiary);
		align-items: center;
		border-radius: 50%;
		justify-content: center;
		&.md {
			width: 80px;
			height: 80px;
		}
		&.lg {
			width: 120px;
			height: 120px;
		}
	}
</style>