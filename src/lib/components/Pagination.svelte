<script lang="ts">
	import type { PagedResponse } from '../api/types';

	import CaretLeft from '../icons/CaretLeft.svelte';
	import CaretRight from '../icons/CaretRight.svelte';
	export let data: Promise<PagedResponse<any>>;
	export let cursor: string | null = null;

	let pages: (string | null)[] = [cursor];
	$: data.then(({ nextCursor }) => {
		if (!pages.includes(nextCursor))
			pages = [...pages, nextCursor];
		if (!nextCursor && !cursor && pages.length > 1)
			pages = [cursor];
	});
</script>

<div class="pagination-container">
	<div class="pagination-items">
		<slot/>
	</div>
	<div class="buttons">
		{#await data}
			<button type="button" disabled>
				<CaretLeft/>
			</button>
		{:then { prevCursor }}
			<button type="button" disabled={!prevCursor} on:click={() => cursor = prevCursor}>
				<CaretLeft/>
			</button>
		{/await}

		{#each pages as page, key}
			<button type="button" class:selected={cursor === page} on:click={() => cursor = page}>
				{key + 1}
			</button>
		{/each}

		{#await data}
			<button type="button" disabled>
				<CaretRight/>
			</button>
		{:then { nextCursor }}
			<button type="button" disabled={!nextCursor} on:click={() => cursor = nextCursor}>
				<CaretRight/>
			</button>
		{/await}
	</div>
</div>

<style lang="scss">
	.pagination-container {
		.pagination-items {
			display: flex;
			overflow: auto;
			flex-wrap: wrap;
			align-content: flex-start;
		}
		.buttons {
			gap: 8px;
			display: flex;
			margin-top: 16px;
			button {
				width: 26px;
				color: var(--button-color);
				height: 26px;
				border: none;
				cursor: pointer;
				padding: 0;
				display: flex;
				background: var(--button-background);
				align-items: center;
				font-family: var(--font-primary);
				border-radius: 50%;
				justify-content: center;
				&:hover:not(:disabled):not(.selected) {
					background: var(--button-background-hover);
				}
				&:disabled {
					cursor: not-allowed;
					opacity: 0.5;
				}
				&.selected {
					color: var(--button-color-active);
					background: var(--button-background-active);
				}
			}
		}
	}
</style>