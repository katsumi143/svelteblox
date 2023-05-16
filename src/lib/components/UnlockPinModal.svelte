<script lang="ts">
	import { Button, TextInput } from '@voxelified/voxeliface';

	import { t } from '../localisation';
	import { unlockPin } from '$lib/api/auth';
	import { unlockPinModal } from '../store';
	import { PinUnlockResult } from '$lib/api/enums';

	import X from '../icons/X.svelte';
	import Modal from './Modal.svelte';
	import Check from '../icons/Check.svelte';

	let close: () => void;
	let value = '';
	let trigger: () => void;
	let incorrect = false;
	let unlocking = false;
	let ratelimited = false;
	const finish = () => {
		unlocking = true;
		incorrect = false;
		unlockPin(value).then(result => {
			if (result === PinUnlockResult.Success) {
				close();
				unlocking = false;
				$unlockPinModal = false;
			} else {
				unlocking = false;

				if (result === PinUnlockResult.Incorrect)
					incorrect = true;
				else
					ratelimited = true;
			}
		});
	};
	const cancel = () => {
		close();
		$unlockPinModal = false;
	};
	unlockPinModal.subscribe(value => {
		if (value)
			trigger();
	});
</script>

<Modal bind:close bind:trigger>
	<h1>{$t('unlock_pin')}</h1>
	<p>{$t('unlock_pin.summary')}</p>
	{#if incorrect}
		<p class="error">{$t('unlock_pin.incorrect')}</p>
	{/if}
	{#if ratelimited}
		<p class="error">{$t('unlock_pin.ratelimited')}</p>
	{/if}
	<TextInput bind:value placeholder={$t('unlock_pin.placeholder')}/>

	<div class="buttons">
		<Button on:click={finish} disabled={ratelimited || unlocking || value.length !== 4}>
			<Check/>
			{$t('action.continue')}
		</Button>
		<Button on:click={cancel} disabled={unlocking}>
			<X/>
			{$t('action.cancel')}
		</Button>
	</div>
</Modal>

<style lang="scss">
	h1 {
		margin-bottom: 8px;
	}
	p {
		color: var(--color-secondary);
		margin: 0 0 24px;
		&.error {
			color: #e98686;
			font-size: .9em;
			margin-bottom: 8px;
		}
	}
	.buttons {
		gap: 8px;
		display: flex;
		margin-top: 16px;
	}
</style>