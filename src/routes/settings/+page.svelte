<script lang="ts">
	import { t } from '$lib/localisation';
	import { clientChannel } from '$lib/settings';
	import { CLIENT_CHANNELS } from '$lib/constants';
</script>

<div class="main">
	<p>{$t('settings.client_channel')}</p>
	<select bind:value={$clientChannel} on:change={() => null}>
		{#each CLIENT_CHANNELS as channel}
			<option value={channel}>
				{$t(`client_channel.${channel}`)} • {channel}
			</option>
		{/each}
	</select>
</div>

<style lang="scss">
	.main {
		margin: 32px 64px;
	}
</style>