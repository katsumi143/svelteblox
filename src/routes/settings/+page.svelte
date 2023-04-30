<script lang="ts">
	import { t } from '$lib/localisation';
	import { theme, clientChannel } from '$lib/settings';
	import { THEMES, CLIENT_CHANNELS } from '$lib/constants';
</script>

<div class="main">
	<p>{$t('settings.theme')}</p>
	<select bind:value={$theme}>
		{#each THEMES as item}
			<option value={item}>
				{$t(`theme.${item}`)}
			</option>
		{/each}
	</select>

	<p>{$t('settings.client_channel')}</p>
	<select bind:value={$clientChannel}>
		{#each CLIENT_CHANNELS as item}
			<option value={item}>
				{$t(`client_channel.${item}`)} • {item}
			</option>
		{/each}
	</select>
</div>

<style lang="scss">
	.main {
		margin: 32px 64px;

		p {
			margin: 32px 0 4px;
		}
	}
</style>