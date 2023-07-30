<script lang="ts">
	import { Button } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { getUsers } from '$lib/api/users';
	import { getImages } from '$lib/api/images';
	import { getGroups } from '$lib/api/groups';
	import type { ImageData, OAuthAuthorisation } from '$lib/api/types';
	import { getOAuthAuthorisations, revokeOAuthAuthorisation } from '$lib/api/misc';

	import Avatar from '$lib/components/Avatar.svelte';
	import CreatorLink from '$lib/components/CreatorLink.svelte';

	import X from '$lib/icons/X.svelte';
	import FlagFill from '$lib/icons/FlagFill.svelte';

	let icons: ImageData[] = [];
	let names: Record<number, string> = {};
	let authorisations: OAuthAuthorisation[] = [];
	getOAuthAuthorisations()
		.then(items => authorisations = items)
		.then(items => {
			getUsers(items.filter(item => item.application.owner.type === 'User').map(item => item.application.owner.id))
				.then(items => {
					for (const item of items)
						names = { ...names, [item.id]: item.name };
				});
			getGroups(items.filter(item => item.application.owner.type === 'Group').map(item => item.application.owner.id))
				.then(items => {
					for (const item of items)
						names = { ...names, [item.id]: item.name };
				});
			return items;
		})
		.then(items => getImages(items.map(item => item.application.imageAssetId), '150x150'))
		.then(items => icons = items);

	let revoking: string[] = [];
</script>

<div class="main">
	<h1>{$t('settings.integrations.apps.header')}</h1>
	<p class="summary">{$t('settings.integrations.apps.summary')}</p>

	<div class="authorisations">
		{#each authorisations as item}
			<div class="item">
				<div class="header">
					<Avatar src={icons.find(data => data.targetId.toString() === item.application.imageAssetId)?.imageUrl} size="sm"/>
					<div class="details">
						<h1>
							{item.application.name}
							<p class="author">
								{$t('creator', [''])}<CreatorLink id={item.application.owner.id} name={names[item.application.owner.id]} type={item.application.owner.type}/>
							</p>
						</h1>
						<p>{item.application.summary || $t('oauth_app.no_summary')}</p>
					</div>
					<div class="buttons">
						<Button on:click={() => {
							revoking = [...revoking, item.authorizationId];
							revokeOAuthAuthorisation(item.authorizationId).then(() => {
								authorisations = authorisations.filter(i => i !== item);
								revoking = revoking.filter(i => i !== item.authorizationId);
							});
						}} disabled={revoking.includes(item.authorizationId)}>
							<X/>{$t('action.revoke')}
						</Button>
						<Button href={`https://www.roblox.com/my/account#!/app-permissions:~:text=${encodeURIComponent(item.application.name)},Report`} target="_blank">
							<FlagFill/>{$t('action.report')}
						</Button>
					</div>
				</div>
				<p class="permissions-header">{$t('oauth_app.permission')}</p>
				<div class="permissions">
					{#each item.scopes as scope}
						<p class="permission">
							{scope.operations.map(i => $t(`oauth_app.permission.operation.${i}`)).join(' & ')} {$t(`oauth_app.permission.type.${scope.scopeType}`)}
						</p>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	.main {
		width: 100%;
		padding: 32px 128px 32px 64px;
		overflow: auto;
		.summary {
			color: var(--color-secondary);
			font-size: .9em;
			margin-bottom: 32px;
		}
		.authorisations {
			gap: 16px;
			display: flex;
			margin-top: 16px;
			flex-direction: column;
			.item {
				background: var(--background-secondary);
				border-radius: 16px;
				.header {
					display: flex;
					padding: 16px;
					align-items: center;
					border-bottom: 1px solid var(--border-primary);
					.details {
						margin-left: 16px;
						margin-right: auto;
						h1 {
							gap: 8px;
							margin: 0;
							display: flex;
							font-size: 1em;
							font-weight: 500;
							align-items: end;
							.author {
								margin: 0;
							}
						}
						p {
							color: var(--color-secondary);
							margin: 4px 0 0;
							font-size: .9em;
						}
					}
					.buttons {
						gap: 16px;
						display: flex;
					}
				}
				.permissions-header {
					margin: 16px 16px 8px;
					font-size: .9em;
				}
				.permissions {
					gap: 16px;
					margin: 0 16px 16px;
					display: flex;
					.permission {
						margin: 0;
						padding: 6px 12px;
						font-size: .75em;
						background: var(--border-primary);
						border-radius: 16px;
					}
				}
			}
		}
	}
</style>