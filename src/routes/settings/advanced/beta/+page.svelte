<script lang="ts">
	import { t } from '$lib/localisation';
	import type { GetVoiceChatSettingsResponse } from '$lib/api/types';
	import { getVoiceChatSettings, changeVoiceChatOptIn } from '$lib/api/misc';

	import Radio from '$lib/components/Radio.svelte';

	import Mic from '$lib/icons/Mic.svelte';
	import EmojiSmile from '$lib/icons/EmojiSmile.svelte';

	let voiceSettings: GetVoiceChatSettingsResponse | null;
	getVoiceChatSettings().then(data => voiceSettings = data);

	let updatingVoice = false;
	const updateVoiceChatOptIn = async (value: boolean) => {
		updatingVoice = true;
		await changeVoiceChatOptIn(value);
		updatingVoice = false, voiceSettings!.isVoiceEnabled = value;
	};
</script>

<div class="main">
	<h1>{$t('settings.advanced.beta')}</h1>
	<p class="summary">{$t('settings.advanced.beta.summary')}</p>

	<div class="features">
		<div class="item">
			<Mic size={32}/>
			<div class="details">
				<h1>{$t('beta_feature.voice')}</h1>
				<p>{$t('beta_feature.voice.summary')}</p>
			</div>
			{#if voiceSettings}
				{#if voiceSettings.isOptInDisabled}
					<p class="status">{$t('beta_feature.status.1')}</p>
				{:else}
					<p class="radio-label">{$t(`radio.${voiceSettings.isVoiceEnabled}`)}</p>
					<Radio value={voiceSettings.isVoiceEnabled} on:change={event => updateVoiceChatOptIn(event.detail)} disabled={updatingVoice}/>
				{/if}
			{:else}
				<p class="status">{$t('beta_feature.status.0')}</p>
			{/if}
		</div>
		<div class="item">
			<EmojiSmile size={32}/>
			<div class="details">
				<h1>{$t('beta_feature.avatar_video')}</h1>
				<p>{$t('beta_feature.avatar_video.summary')}</p>
			</div>
			<p class="status">{$t('beta_feature.status.1')}</p>
		</div>
	</div>
</div>

<style lang="scss">
	.main {
		margin: 32px 128px 32px 64px;
		.summary {
			color: var(--color-secondary);
			font-size: .9em;
		}
		.features {
			gap: 16px;
			display: flex;
			margin-top: 32px;
			flex-direction: column;
			.item {
				padding: 16px;
				display: flex;
				background: var(--background-secondary);
				align-items: center;
				border-radius: 16px;
				.details {
					margin-left: 16px;
					margin-right: auto;
					h1 {
						margin: 0;
						font-size: 1em;
						font-weight: 500;
					}
					p {
						color: var(--color-secondary);
						margin: 4px 0 0;
						font-size: .9em;
					}
				}
				.radio-label {
					color: var(--color-tertiary);
					margin: 0 16px;
					font-size: .9em;
				}
				.status {
					color: var(--color-tertiary);
					margin: 0 0 0 16px;
					font-size: .9em;
					white-space: nowrap;
				}
			}
		}
	}
</style>