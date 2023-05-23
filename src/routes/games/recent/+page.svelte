<script lang="ts">
	import { t } from '$lib/localisation';
	import ExperienceItem from '$lib/components/ExperienceItem.svelte';
	import { getExperienceIcons, getRecentExperiences } from '$lib/api/games';

	const recentExperiences = getRecentExperiences();
	const experienceIcons = recentExperiences.then(data => getExperienceIcons(data.map(i => i.id)));
</script>

<div class="experiences">
	<h2 class="header">{$t('home.recent')}</h2>
	<div class="items">
		{#await recentExperiences then items}
			{#each items as item}
				<ExperienceItem
					id={item.id}
					name={item.name}
					icon={experienceIcons.then(i => i.find(i => i.targetId === item.id))}
					voting={item.votes}
					playing={item.playerCount}
					rootPlaceId={item.rootPlaceId}
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