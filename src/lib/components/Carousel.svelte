<script lang="ts">
	import { t } from '$lib/localisation';
	import { onMount } from 'svelte';

	import CaretLeft from '$lib/icons/CaretLeft.svelte';
	import CaretRight from '$lib/icons/CaretRight.svelte';
	export let index: number;
	export let length: Promise<number>;

	onMount(async () => {
		const size = await length;
		const interval = setInterval(() => index = (index + 1) % size, 5000);
		return () => clearInterval(interval);
	});
</script>

<div class="carousel">
	<slot/>
	{#await length then length}
		<button type="button" title={$t('carousel.prev')} on:click={() => index === 0 ? index = length - 1 : index--}><CaretLeft/></button>
		<button type="button" title={$t('carousel.next')} on:click={() => index = (index + 1) % length}><CaretRight/></button>
	{/await}
</div>

<style lang="scss">
	.carousel {
		position: relative;
		button {
			top: 50%;
			left: 8px;
			color: #fff;
			border: none;
			cursor: pointer;
			opacity: 0;
			padding: 24px 2px;
			position: absolute;
			transform: translateY(-50%);
			background: #0000004d;
			transition: opacity .25s;
			border-radius: 6px;
		}
		button:last-child {
			left: unset;
			right: 8px;
		}
		&:hover button {
			opacity: 1;
		}
	}
</style>