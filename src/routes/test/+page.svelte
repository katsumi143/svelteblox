<script lang="ts">
	import * as toast from '$lib/toast';
	import { Button } from '@voxelified/voxeliface';
	import { USERS_CACHE } from '$lib/api/users';
	import { GAMES_CACHE } from '$lib/api/games';
	import { GROUPS_CACHE } from '$lib/api/groups';
	import { IMAGES_CACHE } from '$lib/api/images';

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

<style>
	div {
		margin: 64px;
	}
</style>