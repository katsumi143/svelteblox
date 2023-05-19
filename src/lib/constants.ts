export const THEMES = ['dark', 'light', 'color_purple'] as const;
export const LOCALES = ['en-AU', 'lv-LV', 'ru-RU', 'ja-JP'] as const;
export const CLIENT_CHANNELS = ['live', 'zcanary', 'zintegration', 'zwinplayer64'] as const;

export const LOCALE_MAP: Record<string, string> = {
	en: 'en-AU',
	ja: 'ja-JP',
	lv: 'lv-LV',
	ru: 'ru-RU',
	ja_jp: 'ja-JP'
};