<script lang="ts">
	let open = false;
	let position: [number, number] = [0, 0];
	const openMenu = (event: MouseEvent) => {
		open = true;
		position = [event.clientX, event.clientY];
	};
</script>

<div on:contextmenu|preventDefault={openMenu}>
	<slot/>
</div>