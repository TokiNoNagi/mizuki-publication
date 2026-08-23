import type { NavBarConfig } from "../types/config";

export const navBarConfig: NavBarConfig = {
	links: [
		{ name: "主页", url: "/", icon: "material-symbols:home" },
		{
			name: "个人主站",
			url: "/personal/",
			icon: "material-symbols:open-in-new",
		},
		{ name: "工具导航", url: "/tools/", icon: "material-symbols:handyman" },
		{
			name: "文章",
			url: "/articles/",
			icon: "material-symbols:article",
			children: [
				{ name: "归档", url: "/archive/", icon: "material-symbols:archive" },
				{ name: "标签", url: "/tags/", icon: "material-symbols:tag" },
				{
					name: "文章列表",
					url: "/articles/",
					icon: "material-symbols:format-list-bulleted",
				},
			],
		},
		{
			name: "联系我",
			url: "/friends/",
			icon: "material-symbols:mail",
			children: [
				{ name: "友链", url: "/friends/", icon: "material-symbols:group" },
				{ name: "留言", url: "/messages/", icon: "material-symbols:chat" },
			],
		},
		{
			name: "我的",
			url: "/about/",
			icon: "material-symbols:person",
			children: [
				{
					name: "日历",
					url: "/calendar/",
					icon: "material-symbols:calendar-month",
				},
				{
					name: "相册",
					url: "/albums/",
					icon: "material-symbols:photo-library",
				},
				{ name: "赞助", url: "/sponsor/", icon: "material-symbols:favorite" },
				{ name: "音乐", url: "/music/", icon: "material-symbols:graphic-eq" },
				{
					name: "小游戏",
					url: "/games/",
					icon: "material-symbols:stadia-controller",
				},
				{ name: "关于", url: "/about/", icon: "material-symbols:person" },
			],
		},
	],
};
