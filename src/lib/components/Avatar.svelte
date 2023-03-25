<script lang="ts">
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
		<img src={image} alt="avatar" class={className}/>
	{/await}
{:else}
	<div class={className}/>
{/if}

<style lang="scss">
	.avatar {
		background: var(--background-tertiary);
		border-radius: 50%;
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