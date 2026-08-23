import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

const astroConfig = await readFile(
	new URL("../astro.config.mjs", import.meta.url),
	"utf8",
);
const layoutSource = await readFile(
	new URL("../src/layouts/Layout.astro", import.meta.url),
	"utf8",
);
const mainStyles = await readFile(
	new URL("../src/styles/main.css", import.meta.url),
	"utf8",
);
const configTypes = await readFile(
	new URL("../src/types/config.ts", import.meta.url),
	"utf8",
);
const fontModeSource = await readFile(
	new URL("../src/utils/fontMode.ts", import.meta.url),
	"utf8",
);
const fontCheckSource = await readFile(
	new URL("../scripts/check-font-loading.mjs", import.meta.url),
	"utf8",
);

describe("Custom font loading boundary", () => {
	it("ships both local display fonts as complete WOFF2 files", async () => {
		for (const name of ["ZenMaruGothic-Medium.woff2", "loli.woff2"]) {
			const font = await readFile(
				new URL(`../src/assets/fonts/${name}`, import.meta.url),
			);
			assert.equal(font.subarray(0, 4).toString("ascii"), "wOF2");
			assert.ok(font.length > 100_000, `${name} must not be a tiny subset`);
			assert.ok(astroConfig.includes(`./src/assets/fonts/${name}`));
		}

		assert.doesNotMatch(astroConfig, /src: \[[^\]]+\.ttf/);
	});

	it("preserves PR #502's ZenMaru -> Loli fallback contract", () => {
		assert.equal((astroConfig.match(/fallbacks: \[\]/g) ?? []).length, 2);
		assert.equal(
			(astroConfig.match(/optimizedFallbacks: false/g) ?? []).length,
			2,
		);
		assert.match(
			astroConfig,
			/name: "ZenMaruGothic-Medium"[\s\S]*weight: "500"/,
		);
		assert.match(astroConfig, /name: "Loli"[\s\S]*weight: "400"/);

		const bodyIndex = mainStyles.indexOf("var(--font-body");
		const cjkIndex = mainStyles.indexOf("var(--font-cjk");
		assert.ok(bodyIndex >= 0 && cjkIndex > bodyIndex);
	});

	it("does not render Astro Font components in the fixed system-font layout", () => {
		assert.match(astroConfig, /fonts:\s*customFontsEnabled\s*\?\s*\[/);
		assert.doesNotMatch(layoutSource, /astro:assets/);
		assert.doesNotMatch(layoutSource, /<Font\b/);
	});

	it("defaults older configurations without a font block to custom mode", () => {
		assert.match(configTypes, /font\?:\s*{\s*mode\?:\s*"custom" \| "system"/);
		assert.match(
			fontModeSource,
			/environmentMode\s*\?\?\s*config\.font\?\.mode\s*\?\?\s*"custom"/,
		);
	});

	it("checks the font files referenced by output instead of a fixed directory", () => {
		assert.match(fontCheckSource, /FONT_REFERENCE_PATTERN/);
		assert.match(fontCheckSource, /CUSTOM_FONT_VARIABLE_PATTERN/);
		assert.match(fontCheckSource, /referencedFontFiles/);
		assert.doesNotMatch(
			fontCheckSource,
			/join\(distDir,\s*"_astro",\s*"fonts"\)/,
		);
	});
});
