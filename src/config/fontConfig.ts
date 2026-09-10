/**
 * 字体配置（统一入口）
 *
 * 所有字体相关配置都在此文件中定义：
 *   详细用法请参考 Astro 官方文档：https://docs.astro.build/en/guides/fonts
 * - fonts：Astro Font API 字体定义（自动下载、缓存、优化加载）
 * - fontConfig：字体选择与区域覆盖
 *
 * 添加新字体只需编辑本文件：
 * 1. 在下方 fonts 数组中添加字体定义
 * 2. 在 fontConfig.selected 或区域字段中引用对应的 cssVariable
 *
 * 支持的 provider：https://docs.astro.build/en/reference/font-provider-reference/#built-in-providers
 *   "google"     - Google Fonts
 *   "fontsource" - Fontsource
 *   "local"      - 本地字体文件
 *   "bunny"      - Bunny Fonts
 *   "fontshare"  - Fontshare
 *   "npm"        - NPM 包（如 @fontsource/*）
 *
 * 本地字体子集化：在 fontConfig.subsetFonts 中添加对应 cssVariable 的配置，
 * 构建时脚本会自动扫描页面字符并生成轻量 woff2 子集。
 */
import type {
	FontDefinition,
	FontSelectionConfig,
	SelfHostedFont,
} from "@/types/fontConfig";

// ─── Astro Font API 字体定义 ───────────────────────────────
// 适用于 Astro Font API 的字体配置，支持自动下载、缓存和优化加载
// 本地开发调试的情况下，修改后需要每次重启开发服务器才能生效
export const fontsList: FontDefinition[] = [
	{
		name: "Zen Maru Gothic",
		cssVariable: "--font-zen-maru-gothic",
		provider: "fontsource",
		weights: ["300", "400", "500", "600", "700"],
		styles: ["normal"],
		subsets: ["latin", "cyrillic"],
		fallbacks: ["sans-serif"],
	},
	{
		name: "Inter",
		cssVariable: "--font-inter",
		provider: "fontsource",
		weights: ["300", "400", "500", "600", "700"],
		styles: ["normal"],
		subsets: ["latin", "cyrillic"],
		fallbacks: ["sans-serif"],
	},
	{
		name: "JetBrains Mono",
		cssVariable: "--font-jetbrains-mono",
		provider: "fontsource",
		weights: ["400", "700"],
		styles: ["normal"],
		subsets: ["latin", "cyrillic"],
		fallbacks: [
			"ui-monospace",
			"SFMono-Regular",
			"Menlo",
			"Monaco",
			"Consolas",
			"Liberation Mono",
			"Courier New",
			"monospace",
		],
	},
	{
		// Maple Mono：带连字（ligatures）的圆润等宽字体，用于代码块 / 行内代码
		name: "Maple Mono",
		cssVariable: "--font-maple-mono",
		provider: "fontsource",
		weights: ["400", "700"],
		styles: ["normal"],
		subsets: ["latin"],
		fallbacks: [
			"ui-monospace",
			"SFMono-Regular",
			"Menlo",
			"Monaco",
			"Consolas",
			"Liberation Mono",
			"Courier New",
			"monospace",
		],
	},
	// ─── 本地字体示例 ───
	// 使用步骤：
	// 1. 将 TTF/OTF/WOFF2 字体文件放在 public/assets/fonts/ 目录下
	// 2. 参考下方配置填写正确的字体信息
	// 3. 在 fontConfig.selected 或区域字段中引用 cssVariable
	{
		name: "GreatVibes Regular 2",
		cssVariable: "--font-greatvibes",
		provider: "local",
		options: {
			variants: [
				{
					src: ["./public/assets/fonts/GreatVibes-Regular-2.otf"],
				},
			],
		},
		fallbacks: ["sans-serif"],
	},
];

// ─── 字体选择与区域覆盖 ─────────────────────────────────────
export const fontConfig: FontSelectionConfig = {
	// 是否启用自定义字体功能
	enable: true,
	// 当前选择的字体 CSS 变量名（对应上方 fonts 中的 cssVariable）
	// 使用 "system" 表示系统字体（不加载任何自定义字体）
	selected: ["system"],

	// 各区域独立字体设置（填写上方 fonts 中的 cssVariable，留空则使用全局 selected 字体）
	// 例如：bannerTitleFont: "--font-inter", 表示主页横幅主标题使用 Inter 字体
	// 主页横幅主标题字体
	bannerTitleFont: "--font-zen-maru-gothic",
	// 主页横幅副标题字体
	bannerSubtitleFont: "--font-inter",
	// 导航栏标题字体
	navbarTitleFont: "",
	// 代码块字体（用于代码高亮和等宽字体场景）
	codeFont: "--font-maple-mono",

	// 本地字体子集化配置（构建时由 scripts/subset-fonts.ts 处理）
	// key 为 fonts 数组中对应的 cssVariable，value 为子集化选项
	subsetFonts: {
		"--font-greatvibes": {
			// 额外包含的字符
			extraChars: "",
		},
	},
};

// ─── 自托管分片字体（不走 Astro Font API）─────────────────────
//
// 中文字体无法用 Astro Font API 管理：Fontsource 上的中文字体包大多只有
// latin 子集，而整包 TTF/WOFF2 动辄 5~20MB，直接全量加载会严重拖慢首屏。
//
// 因此中文正文改用「分片（unicode-range）webfont」：
//   - 字体被切成 97 个小分片，每个分片带 unicode-range 声明
//   - 浏览器只下载当前页面文字实际命中的分片（通常 10~25 个，约 200~800KB）
//   - 字符覆盖完整，评论、搜索等动态内容也不会缺字
//
// public/assets/fonts/lxgw-wenkai/ 目录结构：
//   lxgw-wenkai.css   194 条 @font-face（Regular 400 + Bold 700），由包内 CSS 生成
//   files/*.woff2     194 个分片
//   OFL.txt           字体授权（SIL Open Font License 1.1）
//
// ⚠️ 更换字体时：整个目录替换即可，并同步修改下方 family / cssHref。
// ⚠️ 升级 Firefly 主题后若本文件被覆盖，请重新加回这段配置。
export const selfHostedFonts: SelfHostedFont[] = [
	{
		family: "LXGW WenKai",
		cssHref: "/assets/fonts/lxgw-wenkai/lxgw-wenkai.css",
		// 文楷未收录的极少数生僻字，回退到各平台自带中文字体
		fallbacks: ["PingFang SC", "Hiragino Sans GB", "Microsoft YaHei"],
	},
];
