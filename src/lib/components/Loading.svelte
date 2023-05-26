<script lang="ts">
	import Hourglass from '../icons/Hourglass.svelte';
	export let size = 16;
</script>

<div class="loading">
	<Hourglass size={size}/>
</div>

<style lang="scss">
	.loading {
		color: var(--color-primary);
	}
</style>