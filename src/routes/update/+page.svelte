<script lang="ts">
	const version = (globalThis as any).__ROSVELTE_VERSION__;
</script>

<div>
	<h1>Update Required</h1>
	<p>
		{#if version}
			Your version of the <b>svelteblox Extension ({version})</b> is outdated.
		{:else}
			You do not appear to have the <b>svelteblox Extension</b> installed.
		{/if}
	</p>
</div>

<style lang="scss">
	div {
		height: 100%;
		margin: 32px 64px;
	}
</style>