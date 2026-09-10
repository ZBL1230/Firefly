import type { AnnouncementConfig } from "../types/announcementConfig";

export const announcementConfig: AnnouncementConfig = {
	// 公告标题，留空则走i18n默认标题
	title: "",

	// 公告内容
	content: "🎉 神奇宝库开放评论啦！对网站有任何建议，或者就想打个招呼，都欢迎来留言板说两句～",

	// 是否允许用户关闭公告
	closable: true,

	link: {
		// 启用链接
		enable: true,
		// 链接文本
		text: "去留言",
		// 链接 URL
		url: "/guestbook/",
		// 内部链接
		external: false,
	},
};
