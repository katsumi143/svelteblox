<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import X from '$lib/icons/X.svelte';
	import Check from '$lib/icons/Check.svelte';
	export let value: boolean;
	export let disabled = false;

	const dispatch = createEventDispatcher<{
		change: boolean
	}>();
</script>

<button type="button" class="focusable" class:value on:click={() => dispatch('change', value = !value)} {disabled}>
	{#if value}
		<Check/>
	{:else}
		<X size={12}/>
	{/if}
</button>

<style lang="scss">
	button {
		width: 24px;
		color: var(--color-secondary);
		border: none;
		height: 24px;
		cursor: pointer;
		padding: 0;
		display: flex;
		background: none;
		transition: color .25s, opacity .25s, background .25s, box-shadow .25s;
		box-shadow: inset 0 0 0 1px var(--border-secondary);
		align-items: center;
		border-radius: 4px;
		justify-content: center;
		&.value {
			color: var(--button-color);
			box-shadow: none;
			background: var(--button-background);
		}
		&:not(:disabled):hover {
			color: var(--button-color);
			box-shadow: inset 0 0 0 1px var(--button-background);
			&.value {
				background: none;
				box-shadow: inset 0 0 0 1px var(--button-background);
			}
		}
		&:disabled {
			cursor: not-allowed;
			opacity: 0.5
		}
	}
</style>