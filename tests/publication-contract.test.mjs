import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) =>
	readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("publication scripts do not trigger remote synchronization", () => {
	const pkg = JSON.parse(read("package.json"));
	assert.equal(pkg.scripts.predev, undefined);
	assert.equal(pkg.scripts.prebuild, undefined);
	assert.equal(pkg.scripts.preinstall, undefined);
	assert.equal(pkg.scripts.build.includes("update-anime"), false);
	assert.equal(pkg.dependencies.oddmisc, undefined);
});

test("the runtime shell contains no analytics beacon", () => {
	const layout = read("src/layouts/Layout.astro");
	assert.equal(layout.includes("googletagmanager.com"), false);
	assert.equal(layout.includes("AnalyticsScripts"), false);
});

test("publication pages do not bundle disabled comments or music players", () => {
	for (const path of [
		"src/pages/about.astro",
		"src/pages/friends.astro",
		"src/pages/posts/[...slug].astro",
		"src/pages/[...permalink].astro",
	]) {
		const page = read(path);
		assert.equal(page.includes("@components/comment"), false, path);
		assert.doesNotMatch(page, /<Comment\b/, path);
	}

	const sidebar = read("src/components/layout/SidebarColumn.astro");
	const controls = read("src/components/control/FloatingControls.astro");
	const posts = read("src/pages/posts/[...slug].astro");
	const swupManager = read("src/scripts/swup-manager.ts");
	const imageResolver = read("src/utils/image-source-utils.ts");
	assert.doesNotMatch(sidebar, /MusicPlayer|MusicSidebarWidget/);
	assert.doesNotMatch(
		controls,
		/musicPlayerConfig|MusicFabButton|music-sidebar:state/,
	);
	assert.doesNotMatch(
		posts,
		/import\.meta\.glob<ImageMetadata>\("\.\.\/\.\.\/\*\*"/,
	);
	assert.match(posts, /\.\.\/\.\.\/content\/\*\*\/\*\.\{/);
	assert.match(posts, /const posterAvatarUrl = ""/);
	assert.doesNotMatch(swupManager, /widgetConfigs/);
	assert.doesNotMatch(imageResolver, /"\.\.\/\*\*\/\*\.\{/);
});

test("publication configuration is day-only and local-first", () => {
	const site = read("src/config/siteConfig.ts");
	const wallpaper = read("src/config/backgroundWallpaper.ts");
	const markdown = read("src/config/markdownConfig.ts");
	const nav = read("src/config/navBarConfig.ts");
	assert.match(site, /const SITE_LANG = "zh_CN"/);
	assert.match(site, /defaultMode: "none"/);
	assert.match(site, /mode: "system"/);
	assert.match(wallpaper, /enable: false/);
	assert.match(markdown, /plantuml:[\s\S]*enable: false/);
	for (const route of [
		"/articles/",
		"/tags/",
		"/friends/",
		"/messages/",
		"/calendar/",
		"/albums/",
		"/sponsor/",
		"/music/",
		"/games/",
		"/about/",
	]) {
		assert.ok(nav.includes(route), `missing ${route}`);
	}
});

test("publication shell icons and favicon stay offline", () => {
	for (const path of [
		"src/components/widgets/calendar/Calendar.svelte",
		"src/components/organisms/navigation/Search.svelte",
		"src/components/features/toc/MobileTOC.svelte",
	]) {
		const component = read(path);
		assert.match(component, /atoms\/Icon\/LocalIcon\.svelte/);
		assert.doesNotMatch(component, /from ["']@iconify\/svelte["']/);
	}

	const localIcon = read("src/components/atoms/Icon/LocalIcon.svelte");
	assert.match(localIcon, /@iconify\/svelte\/dist\/OfflineIcon\.svelte/);
	assert.doesNotMatch(localIcon, /@vite-ignore|icons\.json/);

	const defaultIcons = read("src/constants/icon.ts");
	assert.match(defaultIcons, /data:image\/svg\+xml/);
	assert.doesNotMatch(defaultIcons, /\/favicon\.ico/);

	const mainGrid = read("src/layouts/MainGridLayout.astro");
	assert.doesNotMatch(mainGrid, /IconifyLoader/);
	assert.doesNotMatch(mainGrid, /code\.iconify\.design/);

	for (const path of [
		"src/pages/ai-tools.astro",
		"src/pages/diary.astro",
		"src/pages/projects.astro",
		"src/pages/skills.astro",
		"src/pages/timeline.astro",
	]) {
		const page = read(path);
		assert.doesNotMatch(page, /loadIconify/, path);
	}

	const sharePoster = read("src/components/misc/SharePoster.svelte");
	assert.match(sharePoster, /atoms\/Icon\/LocalIcon\.svelte/);
	assert.doesNotMatch(sharePoster, /from ["']@iconify\/svelte["']/);

	const astroConfig = read("astro.config.mjs");
	assert.match(astroConfig, /devToolbar:\s*\{\s*enabled:\s*false/);

	const search = read("src/components/organisms/navigation/Search.svelte");
	assert.match(
		search,
		/id="search-input-desktop"[\s\S]*?name="search-desktop"/,
	);
	assert.match(search, /id="search-input-mobile"[\s\S]*?name="search-mobile"/);
});

test("publication foundation routes use an accessible shared shell", () => {
	for (const route of [
		"personal",
		"tools",
		"messages",
		"calendar",
		"sponsor",
		"music",
		"games",
	]) {
		const path = `src/pages/${route}.astro`;
		assert.equal(
			existsSync(new URL(`../${path}`, import.meta.url)),
			true,
			`missing ${path}`,
		);
		const page = read(path);
		assert.ok(
			page.includes("MainGridLayout"),
			`${path} must use MainGridLayout`,
		);
		assert.ok(page.includes("title="), `${path} must set a page title`);
		assert.ok(
			page.includes("PageHero") || page.includes("StatusPage"),
			`${path} must use the publication page shell`,
		);
	}
});

test("identity pages do not depend on remote images", () => {
	const friends = read("src/data/friends.ts");
	const about = read("src/content/spec/about.md");
	assert.doesNotMatch(friends, /imgurl:\s*["']https?:\/\//);
	assert.doesNotMatch(about, /!\[[^\]]*\]\(https?:\/\//);
});

test("starter content covers the approved image-free topics", () => {
	const expected = new Map([
		["start-here.md", "开发记录"],
		["game-notes.md", "游戏"],
		["music-list.md", "音乐"],
		["life-note.md", "生活随笔"],
	]);
	for (const [file, category] of expected) {
		const path = `src/content/posts/${file}`;
		assert.equal(
			existsSync(new URL(`../${path}`, import.meta.url)),
			true,
			`missing ${path}`,
		);
		const content = read(path);
		assert.match(content, new RegExp(`category:\\s*["']?${category}["']?`));
		assert.doesNotMatch(content, /^image:\s*\S+/m);
		assert.doesNotMatch(content, /!\[[^\]]*\]\(https?:\/\//);
	}
});

test("the published asset tree contains no upstream demo media", () => {
	for (const path of [
		"public/assets/anime",
		"public/assets/desktop-banner",
		"public/assets/home",
		"public/assets/mobile-banner",
		"public/assets/music",
		"public/assets/projects",
		"public/images",
		"public/pio",
		"public/favicon",
		"public/sakura.webp",
		"public/assets/js/twikoo.all.min.js",
		"src/assets/public/assets/desktop-banner",
		"src/assets/public/assets/mobile-banner",
	]) {
		assert.equal(
			existsSync(new URL(`../${path}`, import.meta.url)),
			false,
			`unapproved public asset remains: ${path}`,
		);
	}
});
