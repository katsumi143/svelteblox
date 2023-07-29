<script lang="ts">
	import { Select } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { clientChannel } from '$lib/settings';
	import { CLIENT_CHANNELS } from '$lib/constants';
</script>

<div class="main">
	<h1>{$t('settings.advanced.client')}</h1>

	<p class="input-label">{$t('settings.advanced.channel')}</p>
	<Select.Root bind:value={$clientChannel}>
		<p>{$t('settings.advanced.channel.category')}</p>
		{#each CLIENT_CHANNELS as item}
			<Select.Item value={item}>
				{$t(`client_channel.${item}`)} • {item}
			</Select.Item>
		{/each}
	</Select.Root>
</div>

<style lang="scss">
	.main {
		margin: 32px 128px 32px 64px;
	}
</style>