export interface GameListItem {
	name: string
	placeId: number
	universeId: number
	playerCount: number
	totalUpVotes: number
	totalDownVotes: number
}
export interface User {
	id: number
	name: string
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
export enum UserPresenceType {
	Offline,
	Online,
	InExperience,
	InStudio
}
export enum UserPresenceLocation {
	Unknown = '',
	Website = 'Website'
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
	presenceType?: UserPresenceType
	friendFrequentRank: number
	friendFrequentScore: number
	externalAppDisplayName: string | null
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
	}
	description: string
	memberCount: number
	hasVerifiedBadge: boolean
	isBuildersClubOnly: boolean
	publicEntryAllowed: boolean
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
export enum PartialType {
	User = 'User',
	Group = 'Group',
	Place = 'Place'
}

export interface ImageData {
	state: 'Completed'
	targetId: number
	imageUrl: string
}
export interface ApiDataList<T> {
	data: T[]
}