<script lang="ts">
	export const trigger = () => dialog.showModal();
	export const close = () => dialog.close();

	let dialog: HTMLDialogElement;
</script>

<dialog bind:this={dialog}>
	<slot/>
</dialog>

<style lang="scss">
	dialog {
		color: var(--color-primary);
		border: none;
		padding: 16px 24px;
		min-width: 40%;
		font-size: initial;
		animation: .5s show;
		background: var(--background-secondary);
		font-weight: initial;
		border-radius: 16px;
		:global(h1:first-child) {
			margin-top: 12px;
		}
		&::backdrop {
			animation: .5s show;
			background: #00000040;
		}
	}

	@keyframes show {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
</style>