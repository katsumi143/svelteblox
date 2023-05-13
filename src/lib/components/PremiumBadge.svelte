<script lang="ts">
	import Badge from './Badge.svelte';
	import PremiumBadge from '../icons/PremiumIcon.svelte';
	export let size = 16;
</script>

<Badge id="premium" link="https://en.help.roblox.com/hc/en-us/articles/360024256251">
	<PremiumBadge size={size}/>
	<PremiumBadge slot="modal-icon" size={32}/>
</Badge>