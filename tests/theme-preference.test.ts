import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
	nextThemePreference,
	normalizeThemePreference,
	resolveTheme,
} from "../src/utils/theme-preference.ts";

describe("theme preference", () => {
	it("accepts light, dark, and system while rejecting stored garbage", () => {
		assert.equal(normalizeThemePreference("light"), "light");
		assert.equal(normalizeThemePreference("dark"), "dark");
		assert.equal(normalizeThemePreference("system"), "system");
		assert.equal(normalizeThemePreference("sepia"), "system");
		assert.equal(normalizeThemePreference(null), "system");
	});

	it("resolves system without overriding explicit preferences", () => {
		assert.equal(resolveTheme("light", true), "light");
		assert.equal(resolveTheme("dark", false), "dark");
		assert.equal(resolveTheme("system", false), "light");
		assert.equal(resolveTheme("system", true), "dark");
	});

	it("cycles through all three preferences", () => {
		assert.equal(nextThemePreference("light"), "dark");
		assert.equal(nextThemePreference("dark"), "system");
		assert.equal(nextThemePreference("system"), "light");
	});
});
