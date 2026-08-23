import type { MusicPlayerConfig } from "../types/config";

// 音乐播放器配置
export const musicPlayerConfig: MusicPlayerConfig = {
	enable: false,
	showFloatingPlayer: false,
	floatingEntryMode: "fab", // 悬浮入口模式："default" 为独立悬浮播放器，"fab" 为集成到通用 FAB 组
	mode: "local", // 音乐播放器模式，可选 "local" 或 "meting"
	meting_api: "",
	id: "",
	server: "netease", // 音乐源服务器。有的meting的api源支持更多平台,一般来说,netease=网易云音乐, tencent=QQ音乐, kugou=酷狗音乐, xiami=虾米音乐, baidu=百度音乐
	type: "playlist", // 播单类型
};
