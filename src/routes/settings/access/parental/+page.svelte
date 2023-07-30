<script lang="ts">
	import { Select } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import type { GetUserSettingsResponse } from '$lib/api/types';
	import { getUserSettings, updateUserSettings } from '$lib/api/misc';

	let userSettings: GetUserSettingsResponse | null;
	getUserSettings().then(data => (userSettings = data, contentAgeRestriction = data.contentAgeRestriction));

	let contentAgeRestriction: GetUserSettingsResponse['contentAgeRestriction'];
	$: if (contentAgeRestriction !== userSettings?.contentAgeRestriction)
		updateUserSettings({ contentAgeRestriction });
</script>

<div class="main">
	<h1>{$t('settings.access.parental')}</h1>
	<p class="summary">{$t('settings.access.parental.summary')}</p>

	{#if userSettings}
		<p class="input-label">{$t('settings.access.parental.content_restriction')}</p>
		<p class="input-summary">{$t('settings.access.parental.content_restriction.summary')}</p>
		<Select.Root bind:value={contentAgeRestriction}>
			<Select.Item value="ThirteenPlus">
				{$t('settings.access.parental.content_restriction.type.ThirteenPlus')}
			</Select.Item>
			<Select.Item value="NinePlus">
				{$t('settings.access.parental.content_restriction.type.NinePlus')}
			</Select.Item>
			<Select.Item value="AllAges">
				{$t('settings.access.parental.content_restriction.type.AllAges')}
			</Select.Item>
		</Select.Root>
	{/if}
</div>

<style lang="scss">
	.main {
		margin: 32px 128px 32px 64px;
		.summary {
			color: var(--color-secondary);
			font-size: .9em;
		}
	}
</style>