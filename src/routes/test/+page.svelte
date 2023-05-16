<script lang="ts">
	import { Button, TextInput } from '@voxelified/voxeliface';

	import * as toast from '$lib/toast';
	import { USERS_CACHE } from '$lib/api/users';
	import { GAMES_CACHE } from '$lib/api/games';
	import { GROUPS_CACHE } from '$lib/api/groups';
	import { IMAGES_CACHE } from '$lib/api/images';

	import Description from '$lib/components/Description.svelte';

	let desc = 'こんにちは世界！';
	const clearAllCaches = () => {
		USERS_CACHE.invalidateAll();
		GAMES_CACHE.invalidateAll();
		GROUPS_CACHE.invalidateAll();
		IMAGES_CACHE.invalidateAll();
		toast.success('all caches have been fully invalidated');
	};
</script>

<div>
	<Button on:click={() => toast.success('yay', 'yippee')}>
		Success Toast
	</Button>
	<Button on:click={clearAllCaches}>
		Clear All Caches
	</Button>
</div>
<div class="description">
	<TextInput multiline bind:value={desc}/>
	<Description input={desc}/>
</div>

<style>
	div {
		margin: 64px;
	}
</style>