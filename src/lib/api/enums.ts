export enum UserRole {
	Staff,
	BetaTester,
	DeveloperRelations,
	EventOrganiser,
	Banned,
	Contributor
}

export enum GroupRelationship {
	Allies = 'Allies',
	Enemies = 'Enemies'
}

export enum PinUnlockResult {
	Success,
	Incorrect,
	Ratelimited
}

export enum ChangeDisplayNameResult {
	Success,
	InvalidName,
	Ratelimited,
	BadLength
}

export enum SocialLinkType {
	Group = 'RobloxGroup',
	Discord = 'Discord',
	Facebook = 'Facebook',
	Guilded = 'Guilded',
	Twitter = 'Twitter',
	Twitch = 'Twitch',
	YouTube = 'YouTube'
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

export enum FriendshipStatus {
	NotFriends,
	Friends,
	RequestSent,
	RequestReceived
}

export enum PartialType {
	User = 'User',
	Group = 'Group',
	Place = 'Place'
}

export enum GroupAuditLogType {
	ChangeDescription = 'Change Description',
	UpdateRole = 'Update Roleset Data'
}