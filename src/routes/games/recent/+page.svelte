<script lang="ts">
	import { t } from '$lib/localization';
	import ExperienceItem from '$lib/components/ExperienceItem.svelte';
	import { getExperienceIcons, getRecentExperiences } from '$lib/api/games';

	const recentExperiences = getRecentExperiences();
	const experienceIcons = recentExperiences.then(data => getExperienceIcons(data.map(i => i.universeId)));
</script>

<div class="experiences">
	<h2 class="header">{$t('home.recent')}</h2>
	<div class="items">
		{#await recentExperiences then items}
			{#each items as item}
				<ExperienceItem
					id={item.universeId}
					name={item.name}
					icon={experienceIcons.then(i => i.find(i => i.targetId === item.universeId))}
					voting={{
						id: item.universeId,
						upVotes: item.totalUpVotes,
						downVotes: item.totalDownVotes
					}}
					playing={item.playerCount}
					rootPlaceId={item.placeId}
				/>
			{/each}
		{/await}
	</div>
</div>

<style lang="scss">
	.experiences {
		margin: 32px 40px;
		.items {
			gap: 32px 16px;
			display: flex;
			flex-wrap: wrap;
		}
	}

	.header {
		width: 100%;
		margin: 0 0 24px;
	}
</style>