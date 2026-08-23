# Mizuki 白日出版版第一阶段 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基于官方 Mizuki 模板交付一个本地优先、仅白日、可静态构建并可立即试用的个人综合博客第一阶段出版版。

**Architecture:** 保留 Mizuki 的 Astro 内容集合、文章渲染、Pagefind 搜索和响应式基础，关闭远程同步、壁纸、夜间主题、评论、音乐源与看板娘。新增一个小型 publication 组件层和本地数据层，承载文章归档、标签、文章列表以及联系/我的基础分区，复杂首页与个人主站仅保留诚实的建设中状态。

**Tech Stack:** Astro 7.1.3、TypeScript 6、Svelte 5、Tailwind CSS 4、Pagefind、Node 内置测试运行器、pnpm 11.5.3。

**Spec:** `docs/superpowers/specs/2026-08-18-publication-phase-one-design.md`

## Global Constraints

- 第一阶段只制作白日风格，不实现夜间主题。
- 不读取、复制或使用用户本地壁纸，壁纸适配明确延期。
- 不下载或使用未获用户确认的图片；本阶段使用文字、CSS 和本地图标。
- 不启用分析、广告、远程字体、远程音乐、Meting、Memos、Bangumi/Bilibili、Live2D、Twikoo、Giscus 或公共 PlantUML。
- 不修改 `/home/tokinagi/aero-room-blog`。
- 安装前检查仓库来源、提交签名、锁文件、生命周期脚本、允许构建依赖和许可证。
- 每个功能切片先写失败测试，再实现、验证并提交。

---

### Task 1: 引入经审计的 Mizuki 上游基线

**Files:**
- Merge: official `matsuzaka-yuki/Mizuki` `master` at `14da4262d8aa1d93dc8cff11705f14918ed7369f`
- Preserve: `docs/superpowers/specs/2026-08-18-publication-phase-one-design.md`
- Preserve: `docs/superpowers/plans/2026-08-18-publication-phase-one.md`
- Modify: `package.json`
- Modify: `astro.config.mjs`
- Create: `docs/upstream-audit.md`
- Test: `tests/publication-contract.test.mjs`

**Interfaces:**
- Consumes: approved design spec and official upstream Git history.
- Produces: reproducible Astro project, safe local scripts, and `publication-contract.test.mjs` used by later tasks.

- [ ] **Step 1: Record the pre-install audit**

Create `docs/upstream-audit.md` with the exact evidence already collected:

```markdown
# Mizuki upstream audit

- Source: https://github.com/matsuzaka-yuki/Mizuki.git
- Imported commit: 14da4262d8aa1d93dc8cff11705f14918ed7369f
- Commit metadata: GitHub merge commit dated 2026-08-10, RSA signature present; local GPG key database was unavailable, so trust verification is incomplete.
- License: Apache-2.0, with original Fuwari MIT license and third-party notices retained.
- Runtime: Node 20+ upstream; this machine uses Node 26.7.0.
- Package manager: pnpm 11.5.3, lockfile version 9.
- Direct dependencies: 50 runtime and 20 development dependencies.
- Lifecycle risks found: `predev` and `prebuild` run content synchronization; `build` runs anime updates; the original layout contains a hard-coded Google Tag Manager noscript URL.
- Allowed native builds: only `esbuild`, `sharp`, and `ttf2woff2` in `pnpm-workspace.yaml`.
- Decision: remove network-capable lifecycle hooks and analytics integration before installation; install with the frozen lockfile.
```

- [ ] **Step 2: Import upstream without replacing project history**

Run:

```bash
git remote add upstream https://github.com/matsuzaka-yuki/Mizuki.git
git fetch --depth=1 upstream 14da4262d8aa1d93dc8cff11705f14918ed7369f
git merge --allow-unrelated-histories --no-edit FETCH_HEAD
```

Expected: Mizuki files are present; both approved planning documents remain tracked.

- [ ] **Step 3: Write the failing privacy/script contract**

Create `tests/publication-contract.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("publication scripts do not trigger remote synchronization", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.equal(pkg.scripts.predev, undefined);
  assert.equal(pkg.scripts.prebuild, undefined);
  assert.equal(pkg.scripts.preinstall, undefined);
  assert.equal(pkg.scripts.build.includes("update-anime"), false);
});

test("the runtime shell contains no analytics beacon", () => {
  const layout = read("src/layouts/Layout.astro");
  assert.equal(layout.includes("googletagmanager.com"), false);
  assert.equal(layout.includes("AnalyticsScripts"), false);
});
```

- [ ] **Step 4: Run the contract and verify it fails**

Run: `node --test tests/publication-contract.test.mjs`

Expected: FAIL because upstream lifecycle hooks and analytics markup still exist.

- [ ] **Step 5: Remove network-capable build hooks and analytics**

Change `package.json` scripts to:

```json
{
  "dev": "astro dev",
  "start": "astro dev",
  "check": "astro check",
  "build": "astro build && node scripts/check-global-style-loading.mjs && pagefind --site dist && node scripts/check-font-loading.mjs",
  "preview": "astro preview",
  "type-check": "tsc --noEmit",
  "test": "node --experimental-strip-types --test tests/*.test.mjs tests/*.test.ts",
  "new-post": "node scripts/new-post.js",
  "format": "biome format --write ./src ./tests",
  "lint": "biome check ./src ./tests"
}
```

Remove the `oddmisc` import/integration from `astro.config.mjs`. Remove `AnalyticsScripts`, the hard-coded Google Tag Manager `<noscript>`, `MusicPlayer`, and `Pio` from `src/layouts/Layout.astro`; retain code/diagram managers needed by local Markdown.

- [ ] **Step 6: Pass the contract, inspect staged changes, and commit**

Run:

```bash
node --test tests/publication-contract.test.mjs
git diff --check
git add package.json astro.config.mjs src/layouts/Layout.astro tests/publication-contract.test.mjs docs/upstream-audit.md
git diff --cached --check
git commit -m "chore: import privacy-safe Mizuki baseline"
```

Expected: contract PASS and one atomic baseline commit.

---

### Task 2: 固定白日、本地优先配置

**Files:**
- Modify: `src/config/siteConfig.ts`
- Modify: `src/config/navBarConfig.ts`
- Modify: `src/config/backgroundWallpaper.ts`
- Modify: `src/config/commentConfig.ts`
- Modify: `src/config/musicConfig.ts`
- Modify: `src/config/pioConfig.ts`
- Modify: `src/config/markdownConfig.ts`
- Modify: `src/config/profileConfig.ts`
- Modify: `src/layouts/partials/HeadTags.astro`
- Modify: `src/components/organisms/navigation/Navbar.astro`
- Extend test: `tests/publication-contract.test.mjs`

**Interfaces:**
- Consumes: Mizuki configuration types and navigation renderer.
- Produces: fixed `zh_CN` daytime runtime, image-free brand, and the complete phase-one route map.

- [ ] **Step 1: Add failing configuration assertions**

Append:

```js
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
  for (const route of ["/articles/", "/tags/", "/friends/", "/messages/", "/calendar/", "/albums/", "/sponsor/", "/music/", "/games/", "/about/"]) {
    assert.ok(nav.includes(route), `missing ${route}`);
  }
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `node --test tests/publication-contract.test.mjs`

Expected: FAIL on language, wallpaper, and navigation assertions.

- [ ] **Step 3: Apply the safe publication configuration**

Set these exact values in `siteConfig.ts`:

```ts
title: "Tokinagi 出版室",
subtitle: "开发、游戏、音乐与生活随笔",
siteURL: "https://example.invalid/",
lang: "zh_CN",
themeColor: { hue: 196, fixed: true },
font: { mode: "system" },
wallpaperMode: { defaultMode: "none", showModeSwitchOnMobile: "off" },
banner: {
  src: "",
  position: "center",
  carousel: { enable: false, interval: 5, switchable: false },
  waves: { enable: false, performanceMode: true, mobileDisable: true, switchable: false },
  imageApi: { enable: false, url: "" },
  homeText: { enable: false, title: "", subtitle: "", typewriter: { enable: false, speed: 0, deleteSpeed: 0, pauseTime: 0 }, switchable: false },
  credit: { enable: false, text: "", url: "" },
  navbar: { transparentMode: "semi" },
},
thirdPartyAnalytics: { enable: false, clarityId: "" },
```

Disable all unused feature pages except `friends` and `albums`; set comments, music player, Pio, fullscreen wallpaper, and PlantUML `enable` fields to `false`. Remove all profile links and avatar; set profile name to `Tokinagi` and bio to the publication subtitle.

- [ ] **Step 4: Configure the approved navigation**

Replace `navBarConfig.links` with named objects for:

```ts
[
  { name: "主页", url: "/", icon: "material-symbols:home" },
  { name: "个人主站", url: "/personal/", icon: "material-symbols:open-in-new" },
  { name: "工具导航", url: "/tools/", icon: "material-symbols:handyman" },
  { name: "文章", url: "/articles/", icon: "material-symbols:article", children: [
    { name: "归档", url: "/archive/", icon: "material-symbols:archive" },
    { name: "标签", url: "/tags/", icon: "material-symbols:tag" },
    { name: "文章列表", url: "/articles/", icon: "material-symbols:format-list-bulleted" },
  ]},
  { name: "联系我", url: "/friends/", icon: "material-symbols:mail", children: [
    { name: "友链", url: "/friends/", icon: "material-symbols:group" },
    { name: "留言", url: "/messages/", icon: "material-symbols:chat" },
  ]},
  { name: "我的", url: "/about/", icon: "material-symbols:person", children: [
    { name: "日历", url: "/calendar/", icon: "material-symbols:calendar-month" },
    { name: "相册", url: "/albums/", icon: "material-symbols:photo-library" },
    { name: "赞助", url: "/sponsor/", icon: "material-symbols:favorite" },
    { name: "音乐", url: "/music/", icon: "material-symbols:graphic-eq" },
    { name: "小游戏", url: "/games/", icon: "material-symbols:stadia-controller" },
    { name: "关于", url: "/about/", icon: "material-symbols:person" },
  ]},
]
```

- [ ] **Step 5: Force the initial and only theme to light**

Replace the theme bootstrap in `HeadTags.astro` with:

```html
<script is:inline define:vars={{ configHue }}>
  document.documentElement.classList.remove("dark");
  document.documentElement.dataset.theme = "github-light";
  document.documentElement.style.setProperty("--hue", String(configHue));
</script>
```

Remove `ThemeSwitch` and `SettingsPanel` from `Navbar.astro`. When no brand icon is configured, render `<span class="publication-brand-mark" aria-hidden="true">◉</span>` instead of an empty image.

- [ ] **Step 6: Verify and commit**

Run:

```bash
node --test tests/publication-contract.test.mjs
git diff --check
git add src/config src/layouts/partials/HeadTags.astro src/components/organisms/navigation/Navbar.astro tests/publication-contract.test.mjs
git commit -m "feat: configure local-first daylight publication"
```

---

### Task 3: 建立出版版视觉组件与基础路由

**Files:**
- Create: `src/components/publication/PageHero.astro`
- Create: `src/components/publication/StatusPage.astro`
- Create: `src/styles/publication.css`
- Modify: `src/styles/main.css`
- Create: `src/pages/personal.astro`
- Create: `src/pages/tools.astro`
- Create: `src/pages/messages.astro`
- Create: `src/pages/calendar.astro`
- Create: `src/pages/sponsor.astro`
- Create: `src/pages/music.astro`
- Create: `src/pages/games.astro`
- Extend test: `tests/publication-contract.test.mjs`

**Interfaces:**
- `PageHero.astro` consumes `{ eyebrow: string; title: string; description: string; status?: string }`.
- `StatusPage.astro` consumes the same header fields plus `items: { label: string; detail: string; href?: string }[]`.
- Produces consistent route shells used by every deferred/basic section.

- [ ] **Step 1: Add failing route and accessibility assertions**

Append a test that checks each page file exists and contains `MainGridLayout`, `title=`, and either `PageHero` or `StatusPage`. Use `existsSync` and assert the seven route files above.

- [ ] **Step 2: Run the test and verify missing-route failure**

Run: `node --test tests/publication-contract.test.mjs`

Expected: FAIL with the first absent route.

- [ ] **Step 3: Implement focused shared components**

`PageHero.astro` renders one `<h1>`, a short eyebrow, description, optional status badge, and a breadcrumb slot. `StatusPage.astro` wraps `PageHero` and renders semantic `<ul>` cards; links are used only when `href` exists.

- [ ] **Step 4: Add the seven honest status pages**

Use these exact page states:

```ts
personal: { title: "个人主站", status: "最后制作", description: "复杂交互与视觉首页将在基础出版功能稳定后制作。" }
tools: { title: "工具导航", status: "本地目录", items: ["开发工具", "写作工具", "游戏工具"] }
messages: { title: "留言", status: "未启用收集", description: "第一阶段不接入第三方评论或访客数据存储。" }
calendar: { title: "日历", status: "本地文章日期", description: "只展示本站文章发布时间。" }
sponsor: { title: "赞助", status: "暂未接入", description: "不展示支付链接或未经确认的二维码。" }
music: { title: "音乐", status: "本地清单", description: "不请求远程音源，也不自动播放。" }
games: { title: "小游戏", status: "入口已建立", description: "具体游戏将在玩法确认后加入。" }
```

- [ ] **Step 5: Add the image-free daylight publication stylesheet**

Import `publication.css` from `main.css`. Define `--publication-surface`, `--publication-line`, `--publication-shadow`, a soft CSS radial/linear gradient page background, 720–820px reading rails, visible `:focus-visible`, 44px controls, refined dropdown panels, responsive status grids, and `prefers-reduced-motion` overrides. Do not add `url(...)` declarations.

- [ ] **Step 6: Verify and commit**

Run contract tests and `git diff --check`, then commit:

```bash
git add src/components/publication src/pages src/styles tests/publication-contract.test.mjs
git commit -m "feat: add publication section foundations"
```

---

### Task 4: 实现文章列表、标签与增强归档

**Files:**
- Create: `src/utils/publication-content.ts`
- Create: `tests/publication-content.test.ts`
- Create: `src/pages/articles.astro`
- Create: `src/pages/tags.astro`
- Modify: `src/pages/archive.astro`
- Create: `src/components/publication/PostDirectory.astro`
- Create: `src/components/publication/ArchiveTimeline.astro`

**Interfaces:**
- Produces `buildArchiveModel(posts, now): ArchiveModel`.
- `ArchiveModel` contains `total`, `spanDays`, `currentMonthCount`, and `years: { year; count; months: { month; label; posts }[] }[]`.
- Article and tag links reuse `getPostUrl()`/`getTagUrl()` from Mizuki utilities.

- [ ] **Step 1: Write failing model tests**

Create fixtures for posts dated `2026-08-01`, `2026-08-12`, and `2025-12-02`; assert total `3`, August count `2`, inclusive span days, descending years, and descending months.

- [ ] **Step 2: Run the model test and verify import failure**

Run: `node --experimental-strip-types --test tests/publication-content.test.ts`

Expected: FAIL because `buildArchiveModel` does not exist.

- [ ] **Step 3: Implement the pure archive model**

Implement `buildArchiveModel` without Astro imports so Node can test it. Normalize dates to UTC day boundaries, calculate inclusive span as `Math.floor((latest-earliest)/86400000)+1`, and sort years/months/posts descending.

- [ ] **Step 4: Implement the three article routes**

- `articles.astro`: fetch `getSortedPostsList()`, separate pinned posts, render search input and buttons for `最新`/`最早`; client script filters `data-search-text` and sorts `data-published` without network requests.
- `tags.astro`: fetch `getTagList()`, render count chips linking to `/archive/?tag=<encoded>`, and filter locally by input.
- `archive.astro`: replace the client-only archive panel with `ArchiveTimeline.astro`, display computed totals and year/month groups server-side so the page remains useful without JavaScript.

- [ ] **Step 5: Verify behavior and commit**

Run:

```bash
node --experimental-strip-types --test tests/publication-content.test.ts
node --test tests/publication-contract.test.mjs
git diff --check
git add src/utils/publication-content.ts tests/publication-content.test.ts src/pages/articles.astro src/pages/tags.astro src/pages/archive.astro src/components/publication
git commit -m "feat: add publication discovery pages"
```

---

### Task 5: 完成友链、相册和关于页的本地化边界

**Files:**
- Modify: `src/data/friends.ts`
- Modify: `src/components/features/friends/FriendCard.astro`
- Modify: `src/pages/friends.astro`
- Modify: `src/pages/albums.astro`
- Modify: `src/content/spec/about.md`
- Extend test: `tests/publication-contract.test.mjs`

**Interfaces:**
- `FriendItem.imgurl` becomes optional; missing images render a text initial.
- Friends filtering remains local and tag-based.
- Albums render an empty state until user-provided assets exist.

- [ ] **Step 1: Add failing remote-image assertions**

Add a contract that rejects `imgurl: "http://..."` and `imgurl: "https://..."` in `src/data/friends.ts`, while allowing ordinary external links in `siteurl`. Also assert that `src/content/spec/about.md` contains no Markdown image with an HTTP source.

- [ ] **Step 2: Run and observe the upstream friend-image failure**

Run: `node --test tests/publication-contract.test.mjs`

Expected: FAIL on GitHub, QQ, or other remote avatar URLs.

- [ ] **Step 3: Replace demo identity and image dependencies**

Use a single transparent attribution entry with no image:

```ts
{
  id: 1,
  title: "Mizuki",
  desc: "本出版版使用的开源主题底座",
  siteurl: "https://github.com/matsuzaka-yuki/Mizuki",
  tags: ["项目", "主题底座"],
}
```

Render `friend.title.slice(0, 1)` in a decorative initial block when `imgurl` is absent. Rewrite the friends introduction and application instructions as local Markdown/contact guidance. Remove upstream demo album references and show “等待你提供相册素材”的 empty state. Replace About content with the four approved topics and a note that the personal main site comes later.

- [ ] **Step 4: Verify and commit**

Run tests and commit:

```bash
git add src/data/friends.ts src/components/features/friends/FriendCard.astro src/pages/friends.astro src/pages/albums.astro src/content/spec/about.md tests/publication-contract.test.mjs
git commit -m "feat: localize publication identity pages"
```

---

### Task 6: 提供可删除的本地示例内容与使用说明

**Files:**
- Remove: upstream demo posts under `src/content/posts/`
- Create: `src/content/posts/start-here.md`
- Create: `src/content/posts/game-notes.md`
- Create: `src/content/posts/music-list.md`
- Create: `src/content/posts/life-note.md`
- Modify: `README.md`
- Create: `CHANGELOG.md`
- Extend test: `tests/publication-contract.test.mjs`

**Interfaces:**
- Produces four image-free sample posts exercising each approved content topic.
- README documents local commands, content paths, privacy boundaries, and deferred features.

- [ ] **Step 1: Add failing sample-content assertions**

Assert the four files exist, contain no `image:` value or external image syntax, and cover categories `开发记录`, `游戏`, `音乐`, and `生活随笔`.

- [ ] **Step 2: Run and verify missing-content failure**

Run: `node --test tests/publication-contract.test.mjs`

- [ ] **Step 3: Replace demo content with concise starter posts**

Each file must include `title`, `published`, `description`, `tags`, `category`, `draft: false`, and a first paragraph explicitly saying it is starter content that the user can replace. Do not include images, embeds, remote links, comments, or encrypted fields.

- [ ] **Step 4: Document use and release impact**

README sections: Quick Start, Writing, Routes, Privacy Defaults, Deferred Features, Upstream License. Add `CHANGELOG.md` with `0.1.0 - First daylight publication preview` and Added/Changed/Security sections.

- [ ] **Step 5: Verify and commit**

Run tests and commit:

```bash
git add src/content/posts README.md CHANGELOG.md tests/publication-contract.test.mjs
git commit -m "docs: add publication starter content"
```

---

### Task 7: 安装、全量验证与本地试用

**Files:**
- Modify if required: `pnpm-lock.yaml`
- Test artifacts: `/tmp/mizuki-publication-*.png`

**Interfaces:**
- Consumes all completed tasks.
- Produces a verified static build and a localhost preview for user acceptance.

- [ ] **Step 1: Confirm package manager and frozen lockfile**

Run:

```bash
corepack pnpm --version
corepack pnpm install --frozen-lockfile
corepack pnpm list --depth 0
```

Expected: pnpm 11.5.3, no lockfile mutation, only `esbuild`, `sharp`, and `ttf2woff2` allowed to build. If network is blocked, rerun only the install command with explicit approval outside the sandbox.

- [ ] **Step 2: Run the full quality gate**

Run:

```bash
corepack pnpm test
corepack pnpm check
corepack pnpm type-check
corepack pnpm build
git diff --check
```

Expected: all commands exit 0 and Pagefind indexes the static build.

- [ ] **Step 3: Verify the built privacy boundary**

Search built HTML for forbidden runtime hosts and wallpaper assets:

```bash
rg -n "googletagmanager|clarity|meting|memos|plantuml.com|twikoo|giscus|bilibili|bangumi|desktop-banner|mobile-banner" dist
```

Expected: no matches in rendered HTML/JavaScript. Canonical links to `example.invalid` are permitted until deployment configuration is supplied.

- [ ] **Step 4: Browser-check representative routes**

Start `corepack pnpm preview -- --host 127.0.0.1`, then inspect `/`, `/articles/`, `/archive/`, `/tags/`, `/friends/`, `/games/`, and one `/posts/.../` route at 320px, 768px, 1024px, and 1440px. Verify keyboard navigation, dropdown operation, visible focus, no horizontal overflow, clean console, and no remote image/network requests.

- [ ] **Step 5: Review scope and create the preview save point**

Run:

```bash
git status --short
git log --oneline --decorate -8
git diff HEAD~1..HEAD --stat
```

If verification required tracked fixes, commit only those fixes as `fix: complete publication preview verification`. Leave the local preview running and give the user its URL.
