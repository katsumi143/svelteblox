<script lang="ts">
	import { t } from '../localisation';
	import { Button } from '@voxelified/voxeliface';

	import X from '../icons/X.svelte';
	import Modal from './Modal.svelte';
	import Question from '../icons/Question.svelte';
	export let id: string;
	export let link: string;

	let openModal: () => void;
	let closeModal: () => void;
</script>

<button type="button" class="focusable" title={$t(`badge.${id}`)} tabindex="0" on:click|preventDefault={openModal}>
	<slot/>
</button>

<Modal bind:trigger={openModal} bind:close={closeModal}>
	<h1><slot name="modal-icon"/>{$t(`badge.${id}`)}</h1>
	<p>{$t(`badge.${id}.summary`)}</p>
	<div class="buttons">
		<Button href={link} target="_blank">
			<Question/>
			{$t('action.learn_more')}
		</Button>
		<Button on:click={closeModal}><X/>{$t('action.close')}</Button>
	</div>
</Modal>

<style lang="scss">
	:global(dialog h1 svg) {
		margin-right: .5em;
		margin-bottom: -.1em;
	}
	.buttons {
		gap: 8px;
		display: flex;
		margin-top: 24px;
	}
	button {
		border: none;
		cursor: pointer;
		padding: 0;
		display: inline-flex;
		background: none;
		border-radius: 4px;
	}
</style>