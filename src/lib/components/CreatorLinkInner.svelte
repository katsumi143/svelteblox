<script lang="ts">
	import VerifiedBadge from './VerifiedBadge.svelte';
	export let id: number;
	export let name: string;
	export let type: 'User' | 'Group';
	export let trigger: () => void;
	export let displayName: string = '';
	export let hasVerifiedBadge = false;

	$: link = type === 'User' ? `/user/${name}` : `/group/${id}`;
</script>

<a href={link} title={displayName ? `${displayName} (@${name})` : `@${name}`} on:contextmenu|preventDefault={trigger}>
	{!displayName && type === 'User' ? '@' : ''}{displayName || name}
	{#if hasVerifiedBadge}
		<VerifiedBadge/>
	{/if}
</a>

<style>
	a {
		gap: 8px;
		display: inline-flex;
		align-items: center;
	}
</style>