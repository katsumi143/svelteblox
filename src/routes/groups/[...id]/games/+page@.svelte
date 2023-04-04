<script lang="ts">
	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import ExperienceItem from '$lib/components/ExperienceItem.svelte';
	import { getExperienceIcons } from '$lib/api/games';
	import { getGroupExperiences } from '$lib/api/groups';

	$: experiences = getGroupExperiences($page.params.id, 2);
	$: experienceIcons = experiences.then(data => getExperienceIcons(data.map(i => i.id)));
</script>

<div class="experiences">
	<h2 class="header">{$t('group.experiences')}</h2>
	<div class="items">
		{#await experiences then items}
			{#each items as item}
				<ExperienceItem
					id={item.id}
					name={item.name}
					icon={experienceIcons.then(i => i.find(i => i.targetId === item.id))}
					rootPlaceId={item.rootPlace.id}
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