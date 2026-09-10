/**
 * 横幅标题字体子集生成脚本
 *
 * ⚠️ 手动运行，不在构建链中：`npx tsx scripts/subset-banner-font.ts`
 *
 * 为什么需要它：
 *   首页横幅标题用的「马善政毛笔楷书」完整简体中文字集约 2.6 MB，
 *   而横幅文案只有固定几十个字。Firefly 内置的 scripts/subset-fonts.ts
 *   是按「全站字符」切子集的（实测约 197 KB），对一个只服务横幅的装饰字体来说太重。
 *
 *   所以这里先把源字体裁到「横幅文案 + 常用标点」，约 25 KB，
 *   输出为 public/assets/fonts/MaShanZheng-Banner.woff2；
 *   内置 subset-fonts.ts 之后再在它基础上二次子集化（结果只会更小）。
 *
 * 什么时候要重跑：
 *   改了 `backgroundWallpaper.ts` 的 homeText.title 或 homeText.subtitle 之后。
 *   忘记跑也没关系 —— 新字符会退回霞鹜文楷显示，不会出现方框。
 *
 * 源字体缓存：node_modules/.cache/ma-shan-zheng-cn.woff2（首次运行自动下载）
 */

import fs from "node:fs/promises";
import path from "node:path";
import subsetFont from "subset-font";
import { backgroundWallpaper } from "../src/config";

const SOURCE_URL =
	"https://cdn.jsdelivr.net/fontsource/fonts/ma-shan-zheng@latest/chinese-simplified-400-normal.woff2";
const CACHE_DIR = "node_modules/.cache";
const CACHE_FILE = path.join(CACHE_DIR, "ma-shan-zheng-cn.woff2");
const OUTPUT_FILE = "public/assets/fonts/MaShanZheng-Banner.woff2";

// 除文案外额外保留的字符：中文标点 + 常用符号 + 全部 ASCII 可打印字符。
// 多带这些只增加几 KB，但能让后续改文案（含英文/数字/标点）不用重跑本脚本。
const EXTRA_CHARS = [
	"，。！？、：；“”‘’（）《》〈〉—…·～",
	"　",
	Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join(""),
].join("");

async function getSourceFont(): Promise<Buffer> {
	try {
		return await fs.readFile(CACHE_FILE);
	} catch {
		console.log(`⬇ 下载源字体（首次运行）...`);
		const res = await fetch(SOURCE_URL);
		if (!res.ok) {
			throw new Error(`下载失败：HTTP ${res.status} ${SOURCE_URL}`);
		}
		const buf = Buffer.from(await res.arrayBuffer());
		await fs.mkdir(CACHE_DIR, { recursive: true });
		await fs.writeFile(CACHE_FILE, buf);
		return buf;
	}
}

async function main() {
	console.log("🔤 横幅字体子集生成...");

	const homeText = backgroundWallpaper.common?.homeText ?? {};
	const chars = [
		...new Set(
			[
				homeText.title ?? "",
				...(homeText.subtitle ?? []),
				EXTRA_CHARS,
			].join(""),
		),
	].join("");

	console.log(`   横幅文案：${homeText.title ?? "(未配置)"}`);
	console.log(`   字符集：${[...chars].length} 个字符`);

	const source = await getSourceFont();
	console.log(`   源字体：${(source.length / 1024).toFixed(1)} KB`);

	const subset = await subsetFont(source, chars, { targetFormat: "woff2" });
	await fs.writeFile(OUTPUT_FILE, subset);

	const saved = (
		((source.length - subset.length) / source.length) *
		100
	).toFixed(1);
	console.log(
		`   ✔ ${OUTPUT_FILE}\n     ${(subset.length / 1024).toFixed(1)} KB（原 ${(source.length / 1024).toFixed(1)} KB，省 ${saved}%）`,
	);
	console.log("✨ 完成。改回横幅文案后再跑一次本脚本即可。");
}

main().catch((err) => {
	console.error("❌ 生成失败：", err);
	process.exit(1);
});
