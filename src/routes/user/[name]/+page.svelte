<script lang="ts">
	import Time from 'svelte-time';
	import { Tabs, Button, TextInput, DropdownMenu } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import * as toast from '$lib/toast';
	import { getImages } from '$lib/api/images';
	import type { PageData } from './$types';
	import { getUserBadges } from '$lib/api/badges';
	import { getGroupIcon, getPrimaryGroup, getGroupIcons, getUserGroupRoles } from '$lib/api/groups';
	import { UserRole, UserPresenceType, FriendshipStatus, ChangeDisplayNameResult } from '$lib/api/enums';
	import { getExperiences, getExperienceId, getExperienceIcons, getExperienceThumbnails2 } from '$lib/api/games';
	import type { ImageData, Friendship, GroupRole2, ProfileAsset, ProfileExperience, ExperienceThumbnails } from '$lib/api/types';
	import { user, hasPremium, USERS_CACHE, sortFriends, getUserIcon, getUserIcons, getUserRoles, getUserSocials, setDescription, getUserFriends, getUserPresences, removeFriendship, changeDisplayName, requestFriendship, getUserFavourites, getUserFollowerCount, acceptFriendRequest, declineFriendRequest, getUserProfileAssets, getUserFollowingCount, getFriendshipStatuses, getUserProfileExperiences } from '$lib/api/users';

	import User from '$lib/components/User.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import AssetItem from '$lib/components/AssetItem.svelte';
	import GroupCard from '$lib/components/GroupCard.svelte';
	import GroupItem from '$lib/components/GroupItem.svelte';
	import BadgeList from '$lib/components/BadgeList.svelte';
	import Description from '$lib/components/Description.svelte';
	import PremiumBadge from '$lib/components/PremiumBadge.svelte';
	import VerifiedBadge from '$lib/components/VerifiedBadge.svelte';
	import ExperienceCard from '$lib/components/ExperienceCard.svelte';
	import ExperienceItem from '$lib/components/ExperienceItem.svelte';

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
	export let data: PageData;

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
	$: badges = getUserBadges(data.id, 10).then(data => data.data);
	$: premium = hasPremium(data.id);
	$: badgeIcons = badges.then(items => items.length ? getImages(items.map(i => i.displayIconImageId), '150x150') : Promise.resolve([]));

	$: friendship = isSelf || data.isBanned ? null : getFriendshipStatuses(user.id, [data.id]).then(s => s[0]);

	$: fullDescription = data.description.length <= 200;

	$: group = getPrimaryGroup(data.id);
	$: groupIcon = group.then(g => g ? getGroupIcon(g[0].id) : null);

	$: socials = getUserSocials(data.id);
	$: presence = getUserPresences([data.id]).then(data => data[0]);
	$: experience = presence.then(({ placeId, universeId }) => {
		if (universeId)
			return getExperiences([universeId]).then(e => e[0]);
		if (placeId)
			return getExperienceId(placeId).then(id => id ? getExperiences([id]).then(e => e[0]) : null);
	});

	$: favourites = getUserFavourites(data.id);
	$: favouriteIcons = favourites.then(items => {
		if (!items.length)
			return [];
		return getExperienceIcons(items.map(i => i.id));
	});

	let groupIcons: ImageData[] | null = null;
	let groupRoles: GroupRole2[] | null = null;
	$: if (tabValue === 1 && !groupRoles)
		getUserGroupRoles(data.id)
			.then(items => groupRoles = items.sort((a, b) => a.group.name.localeCompare(b.group.name)))
			.then(items => getGroupIcons(items.map(item => item.group.id)))
			.then(items => groupIcons = items);

	let experiences: ProfileExperience[] | null = null;
	let experienceThumbnails: ExperienceThumbnails[] | null = null;
	$: if (tabValue === 2 && !experiences)
		getUserProfileExperiences(data.id)
			.then(items => experiences = items)
			.then(items => getExperienceThumbnails2(items.map(item => item.UniverseID)))
			.then(items => experienceThumbnails = items);

	let recentModels: ProfileAsset[] | null = null;
	$: if (tabValue === 2 && !recentModels)
		getUserProfileAssets(data.id, 10).then(items => recentModels = items);

	let recentClothing: ProfileAsset[] | null = null;
	$: if (tabValue === 2 && !recentClothing)
		getUserProfileAssets(data.id, 11).then(items => recentClothing = items);

	let editName = data.displayName;
	let editAbout = data.description;

	let saving = false;
	let editing = false;
	let tabValue = 0;
	let friending = false;
	let viewBadges = false;
	let nameResult = ChangeDisplayNameResult.Success;
	let menuTrigger: () => void;
	const saveProfile = async () => {
		saving = true;
		if (editName !== data.displayName) {
			const result = await changeDisplayName(editName);
			nameResult = result;
			
			if (result === ChangeDisplayNameResult.Success)
				USERS_CACHE.set(`displayname_${data.id}`, editName, 86400000);
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

	let style = '';
	let isOnline = false;
	$: presence.then(presence => {
		style = `--status-color: var(--user-status-${presence.userPresenceType})`;
		isOnline = !!presence.userPresenceType;
	});
</script>

<div class="main" class:isOnline {style}>
	<div class="card">
		<div class="header">
			<Avatar src={avatar.then(i => i?.imageUrl)} hover circle/>
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
				<p>
					@{data.name}
					{#await presence then presence}
						 • {$t(`user_status.${presence.userPresenceType}`)}
					{/await}
				</p>
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
							<!-- svelte-ignore a11y-invalid-attribute -->
							<a href="#" class="focusable" on:click={() => viewBadges = true}>{$t('action.view_all')}<ArrowRight/></a>
						</div>
						<div class="items">
							{#each items.slice(0, 6) as item}
								<Badge
									id={item.id}
									name={item.displayName}
									icon={badgeIcons.then(b => b.find(i => i.targetId === item.displayIconImageId)?.imageUrl)}
									userId={data.id !== user.id ? data.id : null}
								/>
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
	<Tabs.Root bind:value={tabValue}>
		<Tabs.Item value={0} title={$t('profile.overview')}>
			{#await experience then experience}
				{#if experience}
					{#await presence then presence}
						<p class="text-header">{$t(`user.experience_${presence.userPresenceType}`)}</p>
						<ExperienceCard
							id={experience.id}
							name={experience.name}
							playing={experience.playing}
							friendId={presence.userPresenceType === UserPresenceType.InExperience ? data.id : null}
							friendName={data.displayName}
							rootPlaceId={experience.rootPlaceId}
							creatorName={experience.creator.name}
						/>
					{/await}
				{/if}
			{/await}
			{#await group then group}
				{#if group}
					<p class="text-header">{$t('user.group')}</p>
					<GroupCard icon={groupIcon} group={group[0]} userRole={[data.displayName, group[1].name]}/>
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
									id={friend.id}
									name={friend.name}
									avatar={friendAvatars.then(f => f.find(i => i.targetId === friend.id))}
									presence={presence}
									experience={presenceExperiences.then(e => e.find(e => e.id === presence?.universeId))}
									displayName={friend.displayName}
								/>
							{/await}
						{/each}
					</div>
				{/if}
			{/await}
			{#await favourites then items}
				{#if items.length}
					<div class="experiences2">
						<p class="list-header">
							{$t('profile.overview.experiences')}
							<a href={`/users/${data.id}/favourites`}>{$t('action.view_all')}<ArrowRight/></a>
						</p>
						<div class="items">
							{#each items as item}
								<ExperienceItem
									id={item.id}
									name={item.name}
									icon={favouriteIcons.then(t => t.find(i => i.targetId === item.id))}
									rootPlaceId={item.rootPlaceId}
								/>
							{/each}
						</div>
					</div>
				{/if}
			{/await}
		</Tabs.Item>
		<Tabs.Item value={1} title={$t('profile.groups')}>
			{#if groupRoles?.length}
				<div class="groups">
					{#each groupRoles as { group }}
						<GroupItem id={group.id} name={group.name} icon={Promise.resolve(groupIcons?.find(item => item.targetId === group.id))} owner={group.owner} verified={group.hasVerifiedBadge} memberCount={group.memberCount}/>
					{/each}
				</div>
			{/if}
		</Tabs.Item>
		<Tabs.Item value={2} title={$t('profile.creations')}>
			{#if experiences?.length}
				<p class="text-header">{$t('profile.creations.experiences')}</p>
				<div class="experiences">
					{#each experiences as item}
						<ExperienceCard
							id={item.UniverseID}
							name={item.Name}
							votes={[item.TotalUpVotes, item.TotalDownVotes]}
							playing={item.PlayerCount}
							thumbnail={experienceThumbnails?.find(i => i.universeId === item.UniverseID)?.thumbnails[0]?.imageUrl}
							rootPlaceId={item.PlaceID}
							creatorName={data.displayName}
						/>
					{/each}
				</div>
			{/if}
			{#if recentModels?.length}
				<p class="text-header">{$t('profile.creations.models')}</p>
				<div class="assets">
					{#each recentModels as item}
						<AssetItem
							id={item.Id}
							name={item.Name}
							icon={item.Thumbnail.Url}
						/>
					{/each}
				</div>
			{/if}
			{#if recentClothing?.length}
				<p class="text-header">{$t('profile.creations.clothing')}</p>
				<div class="assets">
					{#each recentClothing as item}
						<AssetItem
							id={item.Id}
							name={item.Name}
							icon={item.Thumbnail.Url}
						/>
					{/each}
				</div>
			{/if}
		</Tabs.Item>
	</Tabs.Root>
</div>

{#if viewBadges}
	<BadgeList close={() => viewBadges = false} userId={data.id}/>
{/if}

<svelte:head>
	<title>{data.displayName}</title>
</svelte:head>

<style lang="scss">
	.main {
		margin: 128px 32px 16px;
		display: flex;
		.card {
			width: 416px;
			height: fit-content;
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
			overflow: hidden;
			margin-left: 32px;
		}
		.groups {
			gap: 16px;
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
		}
		.experiences {
			gap: 8px;
			display: flex;
			flex-wrap: wrap;
			:global(.experience) {
				flex: 1 1 calc(50% - 8px);
				width: unset;
			}
		}
		.assets {
			gap: 8px;
			display: flex;
			overflow: hidden;
		}
		.experiences2 {
			margin-top: 24px;
			.items {
				gap: 16px;
				width: 100%;
				display: flex;
				overflow: hidden;
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
		&.isOnline .card .header {
			:global(.avatar:before) {
				right: 8px;
				width: 16px;
				bottom: 8px;
				height: 16px;
				border: 4px solid var(--background-primary);
				content: '';
				display: block;
				position: absolute;
				background: var(--status-color);
				border-radius: 50%;
			}
		}
	}
</style>