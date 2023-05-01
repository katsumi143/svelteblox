<script lang="ts">
	import { t } from '$lib/localisation';
	import { Select } from '@voxelified/voxeliface';
	import { theme, locale, clientChannel } from '$lib/settings';
	import { THEMES, LOCALES, CLIENT_CHANNELS } from '$lib/constants';
</script>

<div class="main">
	<p class="label">{$t('settings.locale')}</p>
	<Select.Root value={locale} placeholder="Choose Language">
		<p>{$t('settings.locale.label')}</p>
		{#each LOCALES as item}
			<Select.Item value={item}>
				{$t(`locale.${item}`)}
			</Select.Item>
		{/each}
	</Select.Root>

	<p class="label">{$t('settings.theme')}</p>
	<Select.Root value={theme} placeholder="Choose Theme">
		<p>{$t('settings.theme.label')}</p>
		{#each THEMES as item}
			<Select.Item value={item}>
				{$t(`theme.${item}`)}
			</Select.Item>
		{/each}
	</Select.Root>

	<p class="label">{$t('settings.client_channel')}</p>
	<Select.Root value={clientChannel} placeholder="Choose Channel">
		<p>{$t('settings.client_channel.label')}</p>
		{#each CLIENT_CHANNELS as item}
			<Select.Item value={item}>
				{$t(`client_channel.${item}`)} • {item}
			</Select.Item>
		{/each}
	</Select.Root>
</div>

<style lang="scss">
	.main {
		margin: 32px 64px;

		p.label {
			margin: 32px 0 8px;
		}
	}
</style>