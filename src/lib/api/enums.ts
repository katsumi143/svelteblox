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