<script lang="ts">
	import { Button, TextInput } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { confirmPasswordModal, confirmPasswordResult } from '$lib/store';

	import Modal from './Modal.svelte';

	import X from '$lib/icons/X.svelte';
	import Check from '$lib/icons/Check.svelte';

	let trigger: () => void;
	let password = '';
	const finish = () => {
		$confirmPasswordResult = password;
		$confirmPasswordModal = false;
	};

	confirmPasswordModal.subscribe(value => {
		if (value)
			trigger();
	});
</script>

<Modal bind:trigger>
	<h1>{$t('confirm_password')}</h1>
	<p>{$t('confirm_password.summary')}</p>

	<TextInput type="password" bind:value={password} placeholder={$t('confirm_password')}/>
	<form method="dialog">
		<Button on:click={finish} disabled={!password}>
			<Check/>{$t('action.continue')}
		</Button>
		<Button on:click={() => $confirmPasswordModal = !(password = '')}>
			<X/>{$t('action.cancel')}
		</Button>
	</form>
</Modal>

<style lang="scss">
	form {
		gap: 16px;
		display: flex;
		margin-top: 16px;
	}
</style>