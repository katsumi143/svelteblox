<script lang="ts">
	import { Select } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { theme, locale } from '$lib/settings';
	import { THEMES, LOCALES, COLOUR_THEME_HUES } from '$lib/constants';
</script>

<div class="main">
	<h1>{$t('settings.website.appearance')}</h1>

	<p class="input-label">{$t('settings.website.appearance.locale')}</p>
	<Select.Root bind:value={$locale}>
		<p>{$t('settings.website.appearance.locale.category')}</p>
		{#each LOCALES as item}
			<Select.Item value={item}>
				{$t(`locale.${item}`)}
			</Select.Item>
		{/each}
	</Select.Root>

	<p class="input-label">{$t('settings.theme')}</p>
	<Select.Root bind:value={$theme}>
		<p>{$t('settings.theme.label')}</p>
		{#each THEMES as item}
			<Select.Item value={item}>
				<div class={`theme-thing theme-${item.split('_')[0]}`} style={`--theme-hue: ${COLOUR_THEME_HUES[item.split('_')[1]] || 0}`}/>
				{$t(`theme.${item}`)}
			</Select.Item>
		{/each}
	</Select.Root>
</div>

<style lang="scss">
	.main {
		margin: 32px 128px 32px 64px;
		.theme-thing {
			width: 16px;
			height: 16px;
			background: color-mix(in srgb, var(--background-primary) 75%, #fff);
			border-radius: 4px;
		}
	}
</style>