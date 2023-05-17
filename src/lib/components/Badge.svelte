<script lang="ts">
	import Avatar from './Avatar.svelte';

	export let id: number;
	export let name: string;
	export let icon: Promise<string | undefined>;
	export let userId: number | null = null;
</script>

<a class="focusable" href={`/badge/${id}${userId ? `?targetUser=${userId}` : ''}`} title={name}>
	<Avatar src={icon} size="sm2" circle transparent/>
</a>

<style lang="scss">
	a {
		width: 50px;
		height: 50px;
	}
</style>