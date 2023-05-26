<script lang="ts">
	import { Button, TextInput } from '@voxelified/voxeliface';

	import { t } from '../localisation';
	import { user, getUserIcons } from '../api/users';
	import { GROUPS_CACHE, postToGroupWall, deleteGroupPost, getGroupWallPosts } from '../api/groups';

	import Avatar from './Avatar.svelte';
	import Loading from './Loading.svelte';
	import Pagination from './Pagination.svelte';
	import Description from './Description.svelte';

	import Trash from '../icons/Trash.svelte';
	import Hourglass from '../icons/Hourglass.svelte';
	export let groupId: number;
	export let canView: boolean;
	export let canPost: boolean;
	export let canDelete: boolean;

	$: data = canView ? getGroupWallPosts(groupId, 100, cursor) : Promise.resolve({ data: [], nextCursor: null, prevCursor: null });
	$: icons = data.then(d => getUserIcons(d.data.filter(d => d.poster).map(d => d.poster!.user.userId)));
	let cursor: string | null = null;
	
	let value = '';
	let posting = false;
	let deleting: number[] = [];
	const post = () => {
		posting = true;
		postToGroupWall(groupId, value).then(response => {
			posting = false, value = '';
			const id = `group_posts_${groupId}_100_null`;
			if (GROUPS_CACHE.isValid(id) && cursor === null) {
				data = data.then(d => {
					d.data.unshift(response);
					return d;
				});
			} else {
				if (cursor === null)
					data = getGroupWallPosts(groupId, 100, null);
				else
					cursor = null;
			}
			GROUPS_CACHE.invalidate(id);
		});
	};
	const deletePost = (id: number) => {
		deleting = [...deleting, id];
		deleteGroupPost(groupId, id).then(success => {
			if (success) {
				GROUPS_CACHE.invalidate(`group_posts_${groupId}_100_${cursor}`);
				data = getGroupWallPosts(groupId, 100, cursor);
				deleting = deleting.filter(i => i !== id);
			}
			// TODO: add failure message thingy indicator yay 👻
		});
	}
</script>

{#if canPost}
	<div class="input">
		<TextInput bind:value multiline placeholder={$t('group_wall.input')}/>
		<Button on:click={post} disabled={posting}>
			{$t('action.post')}
		</Button>
	</div>
{:else if canView}
	<p class="cannot-post">{$t('group_wall.input.disabled')}</p>
{/if}

{#if canView}
	<Pagination {data} bind:cursor>
		{#await data}
			<Loading size={32}/>
		{:then { data }}
			{#each data as item}
				<div class="post">
					<Avatar src={icons.then(i => i.find(i => i.targetId === item.poster?.user.userId)?.imageUrl)} size="sm" circle/>
					{#if item.poster && item.body !== '[ Content Deleted ]'}
						<div>
							<p class="name">
								<a href={`/user/${item.poster?.user.username}`}>{item.poster?.user.displayName}</a>
								{$t('group_post.name', [item.created])}
							</p>
							<Description input={item.body}/>
						</div>
					{:else}
						<p class="moderated">{$t('group_post.moderated')}</p>
					{/if}
					{#if canDelete || item.poster?.user.userId === user.id}
						<button type="button" class="delete focusable" title={$t('group_post.delete')} disabled={deleting.includes(item.id)} on:click={() => deletePost(item.id)}>
							<Trash/>
						</button>
					{/if}
				</div>
			{/each}
		{/await}
	</Pagination>
{:else}
	<p class="cannot-post">{$t(canPost ? 'group_wall.disabled' : 'group_wall.disabled.full')}</p>
{/if}

<style lang="scss">
	.input {
		gap: 8px;
		width: 100%;
		display: flex;
		margin-bottom: 24px;
		:global(.text-input) {
			width: 100%;
		} 
	}
	.cannot-post {
		margin: 16px 8px;
		font-size: .95em;
	}
	.post {
		gap: 8px;
		width: 100%;
		padding: 8px;
		display: flex;
		position: relative;
		background: var(--background-secondary);
		border-radius: 16px;
		:global(.avatar) {
			background: var(--background-tertiary);
		}
		div {
			margin-top: 8px;
			.name {
				color: var(--color-secondary);
				margin: 0;
				font-size: .95em;
			}
			:global(.description) {
				margin-top: 4px;
				margin-bottom: 8px;
			}
		}
		.moderated {
			margin: auto 0;
		}
		.delete {
			top: 8px;
			right: 8px;
			color: var(--color-primary);
			border: none;
			cursor: pointer;
			padding: 8px;
			display: flex;
			position: absolute;
			transition: color .25s, background .25s;
			background: none;
			border-radius: 8px;
			&:hover {
				color: var(--button-color);
				background: var(--button-background);
			}
		}
	}

	:global(.pagination-items) {
		gap: 8px;
	}
</style>