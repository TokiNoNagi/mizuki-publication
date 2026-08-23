export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = Exclude<ThemePreference, "system">;

const DEFAULT_THEME: ThemePreference = "system";
const THEME_SEQUENCE: ThemePreference[] = ["light", "dark", "system"];

export function normalizeThemePreference(
	value: string | null,
): ThemePreference {
	return THEME_SEQUENCE.includes(value as ThemePreference)
		? (value as ThemePreference)
		: DEFAULT_THEME;
}

export function resolveTheme(
	preference: ThemePreference,
	systemPrefersDark: boolean,
): ResolvedTheme {
	if (preference === "system") {
		return systemPrefersDark ? "dark" : "light";
	}
	return preference;
}

export function nextThemePreference(
	preference: ThemePreference,
): ThemePreference {
	const currentIndex = THEME_SEQUENCE.indexOf(preference);
	return THEME_SEQUENCE[(currentIndex + 1) % THEME_SEQUENCE.length];
}
