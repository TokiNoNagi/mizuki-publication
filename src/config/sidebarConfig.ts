import type { SidebarLayoutConfig } from "../types/config";

/**
 * 第一阶段出版版只保留内容发现与阅读所需组件。
 * 个人资料、站点统计和音乐播放器等待个人主站阶段再适配。
 */
export const sidebarLayoutConfig: SidebarLayoutConfig = {
	properties: [
		{
			type: "profile",
			position: "top",
			class: "onload-animation",
			animationDelay: 0,
		},
		{
			type: "categories",
			position: "sticky",
			class: "onload-animation",
			animationDelay: 0,
			responsive: { collapseThreshold: 5 },
		},
		{
			type: "tags",
			position: "top",
			class: "onload-animation",
			animationDelay: 50,
			responsive: { collapseThreshold: 20 },
		},
		{
			type: "card-toc",
			position: "sticky",
			class: "onload-animation",
			animationDelay: 100,
		},
		{
			type: "calendar",
			position: "top",
			class: "onload-animation",
			animationDelay: 150,
		},
	],
	components: {
		left: ["profile", "tags", "card-toc"],
		right: ["calendar", "categories"],
		drawer: ["profile", "categories", "tags"],
	},
	defaultAnimation: {
		enable: true,
		baseDelay: 0,
		increment: 50,
	},
	responsive: {
		breakpoints: {
			mobile: 768,
			tablet: 1280,
			desktop: 1280,
		},
	},
};
