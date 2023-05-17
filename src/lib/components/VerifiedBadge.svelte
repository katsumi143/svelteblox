<script lang="ts">
	import Badge from './UserBadge.svelte';
	import VerifiedBadge from '../icons/VerifiedBadge.svelte';
	export let size = 16;
</script>

<Badge id="verified" link="https://en.help.roblox.com/hc/en-us/articles/7997207259156">
	<VerifiedBadge size={size}/>
	<VerifiedBadge slot="modal-icon" size={32}/>
</Badge>