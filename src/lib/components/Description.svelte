<script lang="ts">
	import './Description.css';
	import { t } from '$lib/localisation';
	import { getTopic } from '$lib/api/devforum';
	import { replaceAsync, prettifyName } from '$lib/util';
	import { getUser, getUserIcon, getDisplayName } from '$lib/api/users';
	import { getTalentProfile } from '$lib/api/talent';
	import { getGroup, getGroupIcon } from '$lib/api/groups';
	import { getExperience, getExperienceId, getExperienceIcons } from '$lib/api/games';

	export let input: string | undefined | null;
	
	const verifiedBadge = '<img src="/verified.svg" width="16" height="16"/>';
	$: description = input ? replaceAsync(input, /(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+/g, async url => {
		const userId = url.match(/(?:https:\/\/)(?:(?:www|web)\.)?roblox\.com\/users\/(\d*).*/)?.[1];
		if (userId) {
			const user = await getUser(userId);
			const icon = await getUserIcon(userId);
			return `<a class="cool-link" href="/users/${userId}"><img src="${icon?.imageUrl}" width="25" height="25"/>${prettifyName(user.displayName, user.name)}${user.hasVerifiedBadge ? verifiedBadge : ''}</a>`;
		}
		
		const groupId = url.match(/(?:https:\/\/)(?:(?:www|web)\.)?roblox\.com\/groups\/(\d*).*/)?.[1];
		if (groupId) {
			const group = await getGroup(groupId);
			const icon = await getGroupIcon(groupId);
			return `<a class="cool-link" href="/groups/${groupId}"><img src="${icon?.imageUrl}" width="25" height="25"/>${group.name}${group.hasVerifiedBadge ? verifiedBadge : ''}</a>`;
		}

		const placeId = url.match(/(?:https:\/\/)(?:(?:www|web)\.)?roblox\.com\/games\/(\d*).*/)?.[1];
		if (placeId) {
			const id = await getExperienceId(placeId);
			if (!id)
				throw new Error('uh oh');
			const data = await getExperience(id);
			const [icon] = await getExperienceIcons([id]);
			return `<a class="cool-link" href="/games/${placeId}"><img src="${icon?.imageUrl}" width="25" height="25"/>${data?.name}</a>`;
		}

		const topicId = url.match(/(?:https:\/\/)devforum\.roblox\.com\/t\/.*?\/(\d*).*/)?.[1];
		if (topicId) {
			const topic = await getTopic(topicId);
			return `<a class="cool-link" href="${url}" target="_blank"><img src="/devforum.svg" width="25" height="25"/>${topic.title}</a>`;
		}

		const talentId = url.match(/(?:https:\/\/)talent\.roblox\.com\/creators\/(\d*).*/)?.[1];
		if (talentId) {
			const name = await getDisplayName(talentId);
			const data = await getTalentProfile(talentId);
			return `<a class="cool-link" href="${url}" target="_blank"><img src="/devforum.svg" width="25" height="25"/>${$t('user.talent', [name])} • ${$t(`talent_status.${data.isOpenToWork}`)}</a>`;
		}
		return `<a href="${url}">${url}</a>`;
	}).then(text => text
		.replace(/(?:<a.*?<\/a>\n?){2,}/g, match => `<div class="cool-links">${match}</div>`)
		.replace(/\*\*.*?\*\*/g, match => `<strong>${match.slice(2, -2)}</strong>`)
	) : null;
</script>

<p class="description">
	{#await description then value}
		{#if value}
			{@html value}
		{/if}
	{/await}
</p>

<style lang="scss">
	p.description {
		color: var(--color-tertiary);
		margin: 0;
		overflow: hidden;
		word-break: break-word;
		line-height: 1.25;
		white-space: pre-wrap;
	}
</style>