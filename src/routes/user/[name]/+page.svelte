<script lang="ts">
	import Time from 'svelte-time';
	import { writable } from 'svelte/store';
	import { Tabs, Button, TextInput, DropdownMenu } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import * as toast from '$lib/toast';
	import { getImages } from '$lib/api/images';
	import type { LayoutData } from './$types';
	import type { Friendship } from '$lib/api/types';
	import { getGroupIcon, getPrimaryGroup } from '$lib/api/groups';
	import { UserRole, ChangeDisplayNameResult } from '$lib/api/enums';
	import { FriendshipStatus, UserPresenceType } from '$lib/api/types';
	import { getExperiences, getExperienceId, getExperienceThumbnails } from '$lib/api/games';
	import { user, getBadges, hasPremium, USERS_CACHE, sortFriends, getUserIcon, getUserIcons, getUserRoles, getUserSocials, setDescription, getUserFriends, getUserPresences, removeFriendship, changeDisplayName, requestFriendship, getUserFollowerCount, acceptFriendRequest, declineFriendRequest, getUserFollowingCount, getFriendshipStatuses, getUserProfileExperiences } from '$lib/api/users';

	import User from '$lib/components/User.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import GroupCard from '$lib/components/GroupCard.svelte';
	import Description from '$lib/components/Description.svelte';
	import PremiumBadge from '$lib/components/PremiumBadge.svelte';
	import VerifiedBadge from '$lib/components/VerifiedBadge.svelte';
	import ExperienceCard from '$lib/components/ExperienceCard.svelte';

	import X from '$lib/icons/X.svelte';
	import Check from '$lib/icons/Check.svelte';
	import Heart from '$lib/icons/Heart.svelte';
	import Burger from '$lib/icons/Burger.svelte';
	import People from '$lib/icons/People.svelte';
	import Person from '$lib/icons/Person.svelte';
	import Twitch from '$lib/icons/Twitch.svelte';
	import Twitter from '$lib/icons/Twitter.svelte';
	import Sunrise from '$lib/icons/Sunrise.svelte';
	import Guilded from '$lib/icons/Guilded.svelte';
	import YouTube from '$lib/icons/YouTube.svelte';
	import Facebook from '$lib/icons/Facebook.svelte';
	import PersonPlus from '$lib/icons/PersonPlus.svelte';
	import ArrowRight from '$lib/icons/ArrowRight.svelte';
	import RobloxIcon from '$lib/icons/RobloxIcon.svelte';
	import PencilSquare from '$lib/icons/PencilSquare.svelte';
	import RobloxStudio2 from '$lib/icons/RobloxStudio2.svelte';
	import ClipboardPlus from '$lib/icons/ClipboardPlus.svelte';
	export let data: LayoutData;

	$: isSelf = data.id === user.id;

	$: avatar = getUserIcon(data.id);
	
	$: friends = getUserFriends(data.id);
	$: sortedFriends = friends.then(f => presences.then(p => sortFriends(f, p)));
	$: friendAvatars = sortedFriends.then(f => getUserIcons(f.slice(0, 20).map(f => f.id)));

	$: presences = friends.then(f => getUserPresences(f.map(f => f.id)));
	$: presenceExperiences = presences.then(p => getExperiences(p.filter(p => !!p.universeId).map(p => p.universeId)));

	$: followers = getUserFollowerCount(data.id);
	$: following = getUserFollowingCount(data.id);

	$: roles = getUserRoles(data.id, data.name, data.isBanned);
	$: badges = getBadges(data.id);
	$: premium = hasPremium(data.id);
	$: badgeIcons = badges.then(items => items.length ? getImages(items.map(i => i.displayIconImageId), '150x150') : Promise.resolve([]));

	$: friendship = isSelf || data.isBanned ? null : getFriendshipStatuses(user.id, [data.id]).then(s => s[0]);

	$: fullDescription = data.description.length <= 200;

	$: group = getPrimaryGroup(data.id);
	$: groupIcon = group.then(group => group ? getGroupIcon(group.id) : null);

	$: socials = getUserSocials(data.id);
	$: presence = getUserPresences([data.id]).then(data => data[0]);
	$: experience = presence.then(({ placeId, universeId }) => {
		if (universeId)
			return getExperiences([universeId]).then(e => e[0]);
		if (placeId)
			return getExperienceId(placeId).then(id => id ? getExperiences([id]).then(e => e[0]) : null);
	});

	$: experiences = getUserProfileExperiences(data.id);
	$: experienceThumbnails = experiences.then(async items => {
		if (items.length === 0)
			return [];
		const images = [];
		for (const item of items)
			images.push((await getExperienceThumbnails(item.UniverseID))[0]);
		return images;
	});

	let editName = data.displayName;
	let editAbout = data.description;

	let saving = false;
	let editing = false;
	let friending = false;
	let nameResult = ChangeDisplayNameResult.Success;
	let menuTrigger: () => void;
	const tabValue = writable(0);
	const saveProfile = async () => {
		saving = true;
		if (editName !== data.displayName) {
			const result = await changeDisplayName(editName);
			nameResult = result;
			
			if (result === ChangeDisplayNameResult.Success)
				USERS_CACHE.set(`display_name_${data.id}`, editName, 86400000);
			else {
				saving = false;
				return;
			}
		}
		if (editAbout !== data.description) {
			const finalValue = await setDescription(editAbout).catch(() => data.description);
			editAbout = finalValue;
			data.description = finalValue;
		}

		USERS_CACHE.invalidate(`user_${data.id}`);
		saving = false, editing = false;
	};
	const cancelEdit = () => {
		editing = false;
		editName = data.displayName;
		editAbout = data.description;
	};
	const friend = async (current: Friendship, decline: boolean) => {
		friending = true;
		let newStatus = current.status;
		if (current.status === FriendshipStatus.NotFriends) {
			newStatus = await requestFriendship(data.id).then(() => FriendshipStatus.RequestSent);
			toast.success($t('toast.success'), $t('toast.friend_request', [data.displayName]));
		} else if (current.status === FriendshipStatus.Friends) {
			newStatus = await removeFriendship(data.id).then(() => FriendshipStatus.NotFriends);
			friends = friends.then(d => d.filter(f => f.id !== user.id));
			toast.success($t('toast.success'), $t('toast.friend_removed', [data.displayName]));
		} else if (current.status === FriendshipStatus.RequestReceived) {
			if (decline) {
				newStatus = await declineFriendRequest(data.id).then(() => FriendshipStatus.NotFriends);
				toast.success($t('toast.success'), $t('toast.friend_decline', [data.displayName]));
			} else {
				newStatus = await acceptFriendRequest(data.id).then(() => FriendshipStatus.Friends);
				toast.success($t('toast.success'), $t('toast.friend_accept', [data.displayName]));
			}
		}

		friending = false;
		current.status = newStatus;
		friendship = Promise.resolve(current);
	};
</script>

<div class="main">
	<div class="card">
		<div class="header">
			<Avatar src={avatar.then(i => i?.imageUrl)} circle/>
			<div class="name">
				<h1>
					{editName}
					{#await premium then value}
						{#if value}
							<PremiumBadge size={32}/>
						{/if}
					{/await}
					{#if data.hasVerifiedBadge}
						<VerifiedBadge size={32}/>
					{/if}
				</h1>
				<p>@{data.name}</p>
			</div>
		</div>
		{#if !editing}
			<div class="buttons">
				{#await roles then roles}
					<div class="roles">
						{#each roles as role}
							<p class="role" class:red={data.isBanned} class:orange={role === UserRole.Contributor}>
								{$t(`user_role.${role}`)}
							</p>
						{/each}
					</div>
				{/await}
				{#await friendship then friendship}
					{#if friendship}
						<Button on:click={() => friend(friendship, false)} disabled={friending || friendship.status === FriendshipStatus.RequestSent}>
							<PersonPlus/>{$t(`action.friend.${friendship.status}`)}
						</Button>
						{#if friendship.status === FriendshipStatus.RequestReceived}
							<Button on:click={() => friend(friendship, true)} disabled={friending}>
								<X/>{$t('action.friend.5')}
							</Button>
						{/if}
					{/if}
				{/await}
				{#if isSelf}
					<Button on:click={() => editing = true}>
						<PencilSquare/>
						{$t('action.edit')}
					</Button>
				{/if}
				<DropdownMenu bind:trigger={menuTrigger}>
					<Button slot="trigger" on:click={menuTrigger}><Burger/></Button>
					<p>{data.displayName} (@{data.name})</p>
					<a href={`https://roblox.com/users/${data.id}/profile`} target="_blank">
						<RobloxIcon/>
						{$t('action.view_roblox')}
					</a>
					<a href={`https://devforum.roblox.com/u/${data.name}`} target="_blank">
						<RobloxStudio2/>
						{$t('action.view_devforum')}
					</a>
					<a href={`https://talent.roblox.com/creators/${data.id}`} target="_blank">
						<RobloxStudio2/>
						{$t('action.view_talent')}
					</a>
					<button type="button" on:click={() => navigator.clipboard.writeText(data.id.toString())}>
						<ClipboardPlus/>{$t('action.copy_id')}
					</button>
				</DropdownMenu>
			</div>
			{#if data.description}
				<div class="separator"/>
				<Description input={fullDescription ? data.description : data.description.slice(0, 200)}>
					{#if !fullDescription}
						<button class="show-more" type="button" on:click={() => fullDescription = true}>
							Show more
						</button>
					{/if}
				</Description>
			{/if}
			<div class="separator"/>
			<div class="counters">
				<div class="counter">
					<People/>
					{#await friends then items}
						<a href={`/users/${data.id}/friends`} class="focusable">{$t('number_small', [items.length])}</a>
					{/await}
					<p>{$t('user.friends.count')}</p>
				</div>
				<div class="counter">
					<Heart/>
					{#await followers then amount}
						<!-- svelte-ignore a11y-invalid-attribute -->
						<a href="#" class="focusable">{$t('number_small', [amount])}</a>
					{/await}
					<p>{$t('user.followers')}</p>
				</div>
				<div class="counter">
					<Heart/>
					{#await following then amount}
						<!-- svelte-ignore a11y-invalid-attribute -->
						<a href="#" class="focusable">{$t('number_small', [amount])}</a>
					{/await}
					<p>{$t('user.following')}</p>
				</div>
			</div>
			
			<div class="counter">
				<Sunrise/>
				<p>{$t('user.joined', [data.created])}</p>
				<p class="hover"><Time format={$t('date_format')} timestamp={data.created}/></p>
			</div>
			{#await badges then items}
				{#if items.length}
					<div class="separator"/>
					<div class="badges">
						<div class="list-header">
							<p>{$t('user.badges')}</p>
							<a href={`/user/${data.name}/badges`} class="focusable">{$t('action.view_all')}<ArrowRight/></a>
						</div>
						<div class="items">
							{#each items.slice(0, 6) as item}
								<a class="focusable" href={`/badge/${item.id}`} title={item.displayName}>
									<Avatar src={badgeIcons.then(b => b.find(i => i.targetId === item.displayIconImageId)?.imageUrl)} size="sm2" transparent/>
								</a>
							{/each}
						</div>
					</div>
				{/if}
			{/await}
			<div class="separator"/>
			<div class="socials">
				{#await socials then socials}
					{#if socials.twitter}
						<Button href={`https://twitter.com/${socials.twitter}`} target="_blank">
							<Twitter/>{socials.twitter}
						</Button>
					{/if}
					{#if socials.guilded}
						<Button href={socials.guilded} target="_blank">
							<Guilded/>{socials.guilded.split('/').reverse()[0]}
						</Button>
					{/if}
					{#if socials.facebook}
						<Button href={socials.facebook} target="_blank">
							<Facebook/>{socials.facebook.split('/').reverse()[0]}
						</Button>
					{/if}
					{#if socials.youtube}
						<Button href={socials.youtube} target="_blank">
							<YouTube/>YouTube
						</Button>
					{/if}
					{#if socials.twitch}
						<Button href={socials.twitch} target="_blank">
							<Twitch/>{socials.twitch.split('/').reverse()[0]}
						</Button>
					{/if}
				{/await}
			</div>
			<div class="counter">
				<Person/>
				<p>{$t('user.id')} {data.id}</p>
			</div>
		{:else}
			<p class="text-header">{$t('profile.name')}</p>
			{#if nameResult !== ChangeDisplayNameResult.Success}
				<p class="error">{$t(`name_change_result.${nameResult}`)}</p>
			{/if}
			<TextInput bind:value={editName}/>

			<p class="text-header">
				{$t('profile.about')}
			</p>
			<TextInput multiline placeholder={$t('profile.about.placeholder')} bind:value={editAbout}/>

			<div class="edit-buttons">
				<Button on:click={saveProfile} disabled={saving || (editName === data.displayName && editAbout === data.description)}>
					<Check/>
					{$t('action.save')}
				</Button>
				<Button on:click={cancelEdit} disabled={saving}>
					<X/>
					{$t('action.cancel')}
				</Button>
			</div>
		{/if}
	</div>
	<Tabs.Root value={tabValue}>
		<Tabs.Item value={0} title={$t('profile.overview')}>
			{#await experience then experience}
				{#if experience}
					<div class="experiences">
						{#await presence then presence}
							<p class="text-header">{$t(`user.experience_${presence.userPresenceType}`)}</p>
							<ExperienceCard
								id={experience.id}
								name={experience.name}
								creator={experience.creator}
								playing={experience.playing}
								friendId={presence.userPresenceType === UserPresenceType.InExperience ? data.id : null}
								friendName={data.displayName}
								rootPlaceId={experience.rootPlaceId}
							/>
						{/await}
					</div>
				{/if}
			{/await}
			{#await group then group}
				{#if group}
					<p class="text-header">{$t('user.group')}</p>
					<GroupCard icon={groupIcon} group={group}/>
				{/if}
			{/await}
			{#await sortedFriends then friends}
				{#if friends.length > 0}
					<div class="friends">
						<div class="list-header">
							<p>{$t('user.friends', [friends.length])}</p>
							<a href={`/users/${data.id}/friends`}>{$t('action.view_all')}<ArrowRight/></a>
						</div>
						{#each friends.slice(0, 20) as friend}
							{#await presences.then(p => p.find(p => p.userId === friend.id)) then presence}
								<User
									user={friend}
									avatar={friendAvatars.then(f => f.find(i => i.targetId === friend.id))}
									presence={presence}
									experience={presenceExperiences.then(e => e.find(e => e.id === presence?.universeId))}
								/>
							{/await}
						{/each}
					</div>
				{/if}
			{/await}
		</Tabs.Item>
		<Tabs.Item value={1} title={$t('profile.creations')}>
			{#await experiences then items}
				{#if items.length > 0}
					<p class="text-header">{$t('profile.creations.experiences')}</p>
					<div class="experiences">
						{#each items as item, key}
							<ExperienceCard
								id={item.UniverseID}
								name={item.Name}
								voting={{
									id: item.UniverseID,
									upVotes: item.TotalUpVotes,
									downVotes: item.TotalDownVotes
								}}
								playing={item.PlayerCount}
								creator={{
									id: data.id,
									type: 'User',
									name: data.displayName,
									isRNVAccount: false,
									hasVerifiedBadge: data.hasVerifiedBadge
								}}
								thumbnail={experienceThumbnails.then(t => t[key])}
								rootPlaceId={item.PlaceID}
							/>
						{/each}
					</div>
				{/if}
			{/await}
		</Tabs.Item>
	</Tabs.Root>
</div>

<style lang="scss">
	.main {
		margin: 128px 32px 16px;
		display: flex;
		.card {
			width: 416px;
			padding: 24px;
			position: relative;
			min-width: 416px;
			background: var(--background-secondary);
			padding-top: 16px;
			border-radius: 16px;
			.header {
				gap: 32px;
				top: -96px;
				display: flex;
				position: absolute;
				align-items: center;
				.name {
					margin-bottom: 16px;
					h1 {
						width: max-content;
						margin: 0;
						font-size: 2.5em;
					}
					p {
						color: var(--color-secondary);
						margin: 0;
						margin-top: 4px;
					}
				}
			}
			:global(.text-input) {
				width: 100%;
			}
			:global(.text-input[contenteditable]) {
				height: 128px;
				overflow: auto;
				max-height: 128px;
			}
			.edit-buttons {
				gap: 8px;
				display: flex;
				margin-top: 16px;
			}
			.buttons {
				gap: 8px;
				display: flex;
				justify-content: end;
				.roles {
					gap: 16px;
					height: auto;
					display: flex;
					margin-top: 24px;
					align-items: end;
					margin-right: auto;
					.role {
						color: #9eb6eb;
						margin: 0;
						font-weight: 600;
						&.red {
							color: hsl(0, 55%, 70%);
						}
						&.orange {
							color: hsl(15, 65%, 70%)
						}
					}
				}
			}
			.separator {
				width: 100%;
				height: 1px;
				margin: 16px 0;
				background: var(--border-secondary);
			}
			.show-more {
				color: var(--color-primary);
				border: none;
				cursor: pointer;
				padding: 0;
				font-size: .9em;
				background: none;
				font-family: var(--font-primary);
				&:hover {
					text-decoration: underline;
				}
			}
			.counters {
				gap: 16px;
				display: flex;
			}
			.counter {
				gap: 6px;
				width: fit-content;
				display: flex;
				position: relative;
				align-items: end;
				margin-bottom: 12px;
				a {
					font-size: 1.3em;
					line-height: .8;
					font-weight: 700;
				}
				p {
					color: var(--color-tertiary);
					margin: 0;
					white-space: nowrap;
				}
				.hover {
					top: calc(100% + 8px);
					left: 50%;
					color: var(--color-primary);
					border: 1px solid var(--border-primary);
					opacity: 0;
					z-index: 1000;
					padding: 8px 12px;
					position: absolute;
					font-size: 12px;
					transform: translateX(-50%);
					background: var(--background-primary);
					box-shadow: rgb(22 23 24 / 35%) 0px 0px 20px 4px;
					border-radius: 8px;
					pointer-events: none;
				}
				&:hover .hover {
					opacity: 1;
				}
			}
			.badges {
				.items {
					gap: 8px;
					display: flex;
					flex-wrap: wrap;
					a {
						border-radius: 50%;
					}
				}
			}
			.socials {
				gap: 8px;
				display: flex;
				:global(a) {
					margin-bottom: 16px;
				}
			}
		}
		:global(.tabs-container) {
			width: 100%;
			margin-left: 32px;
		}
		.experiences {
			gap: 8px;
			display: flex;
			flex-wrap: wrap;
			:global(.experience) {
				flex: 1 1 calc(50% - 8px);
				width: unset;
				height: 224px;
			}
		}
		.friends {
			gap: 0 16px;
			display: flex;
			overflow: hidden;
			flex-wrap: wrap;
			margin-top: 32px;
			min-height: 148px;
			max-height: 148px;
			:global(.friend) {
				margin-bottom: 100px;
			}
		}
		.text-header {
			margin: 24px 0 12px;
			display: flex;
			font-weight: 500;
		}
		p.error {
			color: #e98686;
			margin: 0 0 8px;
			font-size: .9em;
		}
	}
</style>