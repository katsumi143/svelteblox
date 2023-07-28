import type { PartialType, SocialLinkType, UserPresenceType, FriendshipStatus, GroupAuditLogType } from './enums';
export interface GameListItem {
	name: string
	genre: string
	placeId: number
	creatorId: number
	imageToken: string
	universeId: number
	minimumAge: number
	creatorName: string
	playerCount: number
	creatorType: PartialType
	nativeAdData: string
	totalUpVotes: number
	totalDownVotes: number
	gameDescription: string
	analyticsIdentifier: null
	isShowSponsoredLabel: boolean
	creatorHasVerifiedBadge: boolean
	ageRecommendationDisplayName: string
}
export interface User {
	id: number
	name: string
	created: string
	isBanned: boolean
	displayName: string
	description: string
	hasVerifiedBadge: boolean
	externalAppDisplayName: string | null
}
export interface CurrentUser {
	id: number
	name: string
	displayName: string
}
export interface UserPresence {
	gameId: string
	userId: number
	placeId: number
	universeId: number
	lastOnline: string
	rootPlaceId: number
	lastLocation: string
	userPresenceType: UserPresenceType
}
export interface Friend {
	id: number
	name: string
	created: string
	isOnline: boolean
	isBanned: boolean
	isDeleted: boolean
	description: null
	displayName: string
	presenceType: UserPresenceType
	friendFrequentRank: number
	friendFrequentScore: number
	externalAppDisplayName: string | null
}
export interface Friendship {
	id: number,
	status: FriendshipStatus
}
export interface Group {
	id: number
	name: string
	owner: PartialUser
	shout: {
		body: string
		poster: PartialUser
		created: string
		updated: string
	} | null
	description: string
	memberCount: number
	hasVerifiedBadge: boolean
	isBuildersClubOnly: boolean
	publicEntryAllowed: boolean
}
export interface GroupV2 {
	id: number
	name: string
	owner: Partial
	created: string
	description: string
	hasVerifiedBadge: boolean
}
export interface PartialUser {
	userId: number
	username: string
	displayName: string
	hasVerifiedBadge: boolean
}
export interface PartialUser2 {
	id: number
	name: string
	displayName: string
	hasVerifiedBadge: boolean
}
export interface PartialExperience {
	id: number
	name: string
	votes?: [number, number]
	creator: Partial
	created?: string
	updated?: string
	rootPlaceId: number
	playerCount?: number
	description?: string | null
	playerVisits?: number
}
export interface Experience {
	id: number
	name: string
	price: number | null
	genre: 'All' // missing other genres
	visits: number
	playing: number
	created: string
	updated: string
	creator: ExperienceCreator
	maxPlayers: number
	isAllGenre: boolean
	sourceName: string | null
	description: string
	rootPlaceId: number
	favoritedCount: number
	copyingAllowed: boolean
	isGenreEnforced: boolean
	isFavoritedByUser: boolean
	allowedGearGenres: string[]
	sourceDescription: string | null
	universeAvatarType: 'MorphToR15' // missing other types
	allowedGearCategories: string[]
	createVipServersAllowed: boolean
	studioAccessToApisAllowed: boolean
}
export interface ExperienceServer {
	id: string
	fps: number
	ping: number
	players: []
	playing: number
	maxPlayers: number
	playerTokens: string[]
}
export interface PrivateExperienceServer extends ExperienceServer {
	name: string
	owner: PartialUser2
	accessCode: string
	vipServerId: number
}
export interface ExperienceVoting {
	id: number
	upVotes: number
	downVotes: number
}
export interface ExperienceCreator {
	id: number
	name: string
	type: 'User' | 'Group'
	isRNVAccount: boolean
	hasVerifiedBadge: boolean
}
export interface ExperiencePermissions {
	canManage: boolean
	canCloudEdit: boolean
}

export interface ExperienceId {
	universeId: number | null
}

export interface ExperienceV2 {
	id: number
	name: string
	created: string
	updated: string
	creator: Partial
	rootPlace: Partial
	placeVisits: number
	description: string | null
}

export interface Partial {
	id: number
	type: PartialType
}
export interface NamedPartial {
	id: number
	name: string
	type: PartialType
}

export interface ImageData {
	state: 'Completed'
	targetId: number
	imageUrl: string
}
export interface ApiDataList<T> {
	data: T[]
}

export interface RobloxBadge {
	id: number
	name: string
	imageUrl: string
	description: string
}

export interface ProfileExperience {
	Name: string
	Plays: number
	Price: number
	ImageId: 0
	PlaceID: number
	IsOwned: boolean
	Favorites: number
	CreatorID: number
	Thumbnail: {
		Url: string
		Final: boolean
		UserId: number
		RetryUrl: string
		EndpointType: 'Avatar'
	}
	UseDataSrc: false
	UniverseID: number
	CreatorName: null
	Description: string
	TotalBought: number
	PlayerCount: number
	TotalUpVotes: number
	TotalDownVotes: number
	IsVotingEnabled: boolean
	HasErrorOcurred: boolean
	HideGameCardInfo: false
	GamePageResources: null
	CreatorAbsoluteUrl: null
	GameDetailReferralUrl: string
	IsAsyncThumbnailEnabled: false
}

export interface MediaAsset {
	state: string
	mediaAssetId: string
	mediaAssetUrl: string
	mediaAssetAltText: string
}

export interface DiscourseTopic {
	title: string
}

export interface TalentProfile {
	isPublic: boolean
	jobTypes: string[]
	linkTypes: string[]
	createdUtc: string
	updatedUtc: string
	skillTypes: string[]
	socialLinks: string[]
	isOpenToWork: boolean
	creatorUserId: number
	requiresAction: 'NoAction'
	isContactAllowed: boolean
	creatorDescription: string
	interestDescription: string
	preferredContactLinkType: string
}

export interface UserBadge {
	id: number
	name: string
	created: string
	updated: string
	enabled: boolean
	awarder: NamedPartial
	statistics: {
		awardedCount: number
		winRatePercentage: number
		pastDayAwardedCount: number
	}
	iconImageId: number
	description: string
	displayName: string
	displayDescription: string
	displayIconImageId: number
}
export interface Badge {
	id: number
	name: string
	created: string
	updated: string
	enabled: boolean
	statistics: {
		awardedCount: number
		winRatePercentage: number
		pastDayAwardedCount: number
	}
	iconImageId: number
	description: string
	displayName: string
	awardingUniverse: {
		id: number
		name: string
		rootPlaceId: number
	}
	displayDescription: string
	displayIconImageId: number
}

export interface PagedResponse<T> {
	data: T[]
	nextCursor: string | null
	prevCursor: string | null
}
export interface ApiPageResponse<T> {
	data: T[]
	nextPageCursor: string
	previousPageCursor: string
}
export interface BadgeResponseV2 {
	id: number
	name: string
	created: string
	updated: string
	enabled: boolean
	awarder: NamedPartial
	statistics: {
		awardedCount: number
		winRatePercentage: number
		pastDayAwardedCount: number
	}
	iconImageId: number
	description: string
	displayName: string
	displayDescription: string
	displayIconImageId: number
}

export type Id = string | number;

export interface SocialLink {
	id: number
	url: string
	type: SocialLinkType
	title: string
}

export interface DiscordInvite {
	code: string
	type: number
	guild: {
		id: string
		name: string
		nsfw: boolean
		icon: string | null
		splash: string | null
		banner: string | null
		features: string[]
		nsfw_level: number
		description: string
		vanity_url_code: string | null
		verification_level: number
		premium_subscription_count: number
	}
	channel: {
		id: string
		name: string
		type: number
	}
	inviter: {
		id: string
		avatar: string | null
		username: string
		global_name: string | null
		public_flags: number
		discriminator: string
		avatar_decoration: string | null
	}
	expires_at: number | null
}

export interface GuildedInvite {
	team: {
		id: string
		name: string
		games: number[]
		ownerId: string
		members: {
			id: string
			name: string
			profilePicture: string
			membershipRole: string
		}[]
		profilePicture: string
	}
	user: {
		id: string
		name: string
		type: string
		createdAt: string
		profilePicture: string
		profilePictureSm: string
		profilePictureLg: string
		profilePictureBlur: string
	}
}

export interface GroupWallPost {
	id: number
	body: string
	poster: {
		user: PartialUser
		role: {
			id: number
			name: string
			rank: number
			description: string
			memberCount: number
		}
	} | null
	created: string
	updated: string
}

export interface GroupMembership {
	groupId: number
	userRole: {
		user: PartialUser
		role: PartialGroupRole
	}
	isPrimary: boolean
	permissions: GroupPermissions
	canConfigure: boolean
	isPendingJoin: boolean
	areEnemiesAllowed: boolean
	areGroupGamesVisible: boolean
	areGroupFundsVisible: boolean
}

export interface PartialGroupRole {
	id: number
	name: string
	rank: number
}

export interface GroupRole extends PartialGroupRole {
	description: string
	memberCount: number
}

export interface GroupPermissions {
	groupPostsPermissions: {
		viewWall: boolean
		postToWall: boolean
		viewStatus: boolean
		postToStatus: boolean
		deleteFromWall: boolean
	}
	groupEconomyPermissions: {
		createItems: boolean
		manageItems: boolean
		viewAnalytics: boolean
		addGroupPlaces: boolean
		advertiseGroup: boolean
		spendGroupFunds: boolean
		manageGroupGames: boolean
		viewGroupPayouts: boolean
	}
	groupOpenCloudPermissions: {
		useCloudAuthentication: boolean
		administerCloudAuthentication: boolean
	}
	groupMembershipPermissions: {
		changeRank: boolean
		inviteMembers: boolean
		removeMembers: boolean
	}
	groupManagementPermissions: {
		manageClan: boolean
		viewAuditLogs: boolean
		manageRelationships: boolean
	}
}

export interface BaseGroupAuditLog {
	actor: {
		user: PartialUser
		role: PartialGroupRole
	}
	created: string
	actionType: GroupAuditLogType
	description: {}
}

export type GroupAuditLog = BaseGroupAuditLog & {
	actionType: GroupAuditLogType.ChangeDescription
	description: {
		NewDescription: string
	}
} | BaseGroupAuditLog & {
	actionType: GroupAuditLogType.UpdateRole
	description: {
		OldName: string
		RoleSetId: number
		RoleSetName: string
		NewDescription: string
		OldDescription: string
	}
}

export interface QuickLoginResult {
	location: string
	deviceInfo: string
}