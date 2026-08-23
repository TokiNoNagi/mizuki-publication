# Tokinagi 出版室

基于 Mizuki 适配的个人综合博客第一阶段版本，聚焦开发记录、游戏、音乐与生活随笔。当前仅提供白日风格和本地内容流程。

## Quick Start

要求 Node.js 20+ 与 pnpm 11.3.0。

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

开发地址默认为 `http://localhost:3000/`。静态构建与本地预览：

```bash
corepack pnpm check
corepack pnpm type-check
corepack pnpm test
corepack pnpm build
corepack pnpm preview
```

## Deployment

`main` 分支同时部署到两个目标：GitHub Pages 提供项目站点，Cloudflare
Worker Static Assets 提供 `https://tokinonagi.dpdns.org/` 主站。GitHub 仓库需要将
Pages Source 设为 **GitHub Actions**，并配置 Actions secrets
`CLOUDFLARE_API_TOKEN` 与 `CLOUDFLARE_ACCOUNT_ID`。Cloudflare API token 只需
Workers Scripts Edit 和对应 zone 的 Workers Routes Edit 权限。

## Writing

文章位于 `src/content/posts/`。复制任一起步文章，至少保留以下 frontmatter：

```yaml
title: 文章标题
published: 2026-08-18
description: 一句话简介
tags: [标签]
category: 开发记录
draft: false
```

关于与友链说明位于 `src/content/spec/`，站点配置位于 `src/config/`。

## Routes

- `/articles/`：文章搜索与最新/最早排序
- `/archive/`：按年、月组织的本地文章时间线
- `/tags/`：可搜索标签目录
- `/friends/`、`/messages/`：友链与留言状态
- `/calendar/`、`/albums/`、`/sponsor/`、`/music/`、`/games/`、`/about/`：我的分区
- `/personal/`、`/tools/`：个人主站状态页与工具导航

## Privacy Defaults

- 不启用分析、广告、第三方评论、远程字体或远程音乐。
- 不连接 Meting、Memos、Bangumi、Bilibili、Live2D 或公共 PlantUML 服务。
- 不读取或使用用户本地壁纸。
- 不擅自下载图片；确定图片选题后，由用户按尺寸与格式清单下载并提供。
- 留言页不提交或保存访客数据。

## Deferred Features

复杂主页与个人主站、夜间主题、壁纸系统、交互式标签关系图、真实留言与账号系统、相册图片、音乐内容和具体小游戏均留到后续阶段。

## Upstream License

本项目基于 [Mizuki](https://github.com/matsuzaka-yuki/Mizuki) 固定提交适配。Apache-2.0、原 Fuwari MIT 许可证与第三方声明分别保存在 `LICENSE`、`LICENSE.MIT` 和 `THIRD_PARTY_NOTICES.md`。

导入来源和安装前审计记录见 `docs/upstream-audit.md`。
