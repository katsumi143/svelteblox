<script lang="ts">
	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import { getDisplayName, getUserFavourites } from '$lib/api/users';
	import { getExperiences, getExperienceVotes } from '$lib/api/games';
	
	import ExperienceItem from '$lib/components/ExperienceItem.svelte';
	$: userId = $page.params.id;
	$: favourites = getUserFavourites(userId).then(f => getExperiences(f.map(e => e.id)));
	$: favouriteVotes = favourites.then(items => {
		if (items.length === 0)
			return [];
		return getExperienceVotes(items.map(i => i.id));
	});
</script>

{#await favourites then items}
	<div class="favourites">
		{#await getDisplayName(userId) then name}
			<h2>{$t('favourites', [name, items.length])}</h2>
		{/await}
		<div class="items">
			{#await favouriteVotes then votes}
				{#each items as item, key}
					<ExperienceItem
						id={item.id}
						name={item.name}
						voting={votes[key]}
						playing={item.playing}
						rootPlaceId={item.rootPlaceId}
					/>
				{/each}
			{/await}
		</div>
	</div>
{/await}

<style lang="scss">
	.favourites {
		margin: 32px 40px;
		h2 {
			width: 100%;
			margin: 0 0 24px;
		}
		.items {
			gap: 0 16px;
			display: flex;
			flex-wrap: wrap;
		}
	}
</style>