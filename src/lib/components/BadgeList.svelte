<script lang="ts">
	import { Button } from '@voxelified/voxeliface';

	import { t } from '../localisation';
	import { getImages } from '../api/images';
	import { getUserBadges } from '../api/badges';
	import { user, getDisplayName } from '../api/users';

	import Modal from './Modal.svelte';
	import Badge from './Badge.svelte';
	import Pagination from './Pagination.svelte';

	import X from '../icons/X.svelte';
	export let close: () => void;
	export let userId: number;

	$: data = getUserBadges(userId, 100, cursor);
	$: icons = data.then(data => getImages(data.data.map(i => i.displayIconImageId), '150x150'));

	let cursor: string;
</script>

{#await getDisplayName(userId) then name}
	<Modal autoOpen>
		<h1>
			{$t('badge_list', [name])}
			<Button on:click={close}><X/>{$t('action.close')}</Button>
		</h1>
		<Pagination {data} bind:cursor>
			{#await data then { data }}
				{#each data as item}
					<Badge
						id={item.id}
						name={item.displayName}
						icon={icons.then(i => i.find(i => i.targetId === item.displayIconImageId)?.imageUrl)}
						userId={userId !== user.id ? userId : null}
					/>
				{/each}
			{/await}
		</Pagination>
	</Modal>
{/await}

<style lang="scss">
	h1 {
		display: flex;
		justify-content: space-between;
	}
	:global(.pagination-items) {
		gap: 8px;
		width: 572px;
		height: 282px;
	}
</style>