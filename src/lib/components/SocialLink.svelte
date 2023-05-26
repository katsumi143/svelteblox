<script lang="ts">
	import { t } from '../localisation';
	import { SocialLinkType } from '../api/enums';
	import type { SocialLink } from '../api/types';
	import { getDiscordInvite, getGuildedInvite } from '../api/misc';
	import { getGroupName, getGroupIcon, getGroupVerified } from '../api/groups';

	import Avatar from './Avatar.svelte';
	import VerifiedBadge from './VerifiedBadge.svelte';
	export let data: SocialLink;

	let url = data.url;
	let name = data.title;
	let icon: Promise<string | undefined>;
	let extra: string;
	let verified = false;
	if (data.type === SocialLinkType.Discord) {
		const invite = getDiscordInvite(data.url.split('/').reverse()[0]);
		invite.then(invite => {
			name = invite.guild.name;
			extra = `#${invite.channel.name}`;
		});
		icon = invite.then(invite =>
			`https://cdn.discordapp.com/icons/${invite.guild.id}/${invite.guild.icon}.${invite.guild.icon?.startsWith('a_') ? 'gif' : 'webp'}`
		);
	} else if (data.type === SocialLinkType.Guilded) {
		const invite = getGuildedInvite(data.url.split('/').reverse()[0]);
		invite.then(invite => name = invite.team.name);
		icon = invite.then(invite => invite.team.profilePicture);
	} else if (data.type === SocialLinkType.Group) {
		const groupId = data.url.split('/').reverse()[0];
		getGroupName(groupId).then(value => name = value);
		getGroupVerified(groupId).then(value => verified = value);

		url = `/group/${groupId}`;
		icon = getGroupIcon(groupId).then(i => i?.imageUrl);
	} else
		icon = Promise.resolve(`/social-link/${data.type}.svg`);
</script>

<a class="main" href={url} title={data.title} target={url === data.url ? '_blank' : undefined}>
	<Avatar src={icon} size="sm3"/>
	<div class="name">
		<h1>
			{name}
			{#if verified}
				<VerifiedBadge/>
			{/if}
		</h1>
		<p>
			{$t(`social_link.type.${data.type}`)}
			{data.title !== name ? `• ${data.title}` : ''}
			{extra ? `• ${extra}` : ''}
		</p>
	</div>
</a>

<style lang="scss">
	.main {
		gap: 16px;
		width: fit-content;
		padding: 8px 16px 8px 8px;
		display: flex;
		overflow: hidden;
		background: var(--background-tertiary);
		align-items: center;
		border-radius: 16px;
		:global(.avatar) {
			min-width: 48px;
		}
		.name {
			gap: 4px;
			display: flex;
			overflow: hidden;
			flex-direction: column;
			h1 {
				gap: 8px;
				margin: 0;
				display: flex;
				overflow: hidden;
				font-size: 1.1em;
				font-weight: 600;
				white-space: nowrap;
				text-overflow: ellipsis;
			}
			p {
				color: var(--color-tertiary);
				margin: 0;
				overflow: hidden;
				font-size: .8em;
				white-space: nowrap;
				text-overflow: ellipsis;
			}
		}
		&:hover {
			box-shadow: inset 0 0 0 1px var(--border-secondary);
			text-decoration: none;
		}
	}
</style>