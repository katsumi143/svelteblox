<script lang="ts">
	import { t } from '$lib/localization';
	import ExperienceItem from '$lib/components/ExperienceItem.svelte';
	import { getUniverseIcons, getRecentExperiences } from '$lib/api';

	const recentExperiences = getRecentExperiences();
	const experienceIcons = recentExperiences.then(data => getUniverseIcons(data.map(i => i.universeId)));
</script>

<div class="experiences">
	<h2 class="header">{$t('home.recent')}</h2>
	<div class="items">
		{#await recentExperiences}
			<p>loading recent experiences</p>
		{:then experiences}
			{#each experiences as item}
				<ExperienceItem data={{
					id: item.universeId,
					name: item.name,
					playing: item.playerCount,
					rootPlaceId: item.placeId,
					totalUpVotes: item.totalUpVotes,
					totalDownVotes: item.totalDownVotes
				}} icon={experienceIcons.then(i => i.find(i => i.targetId === item.universeId))}/>
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