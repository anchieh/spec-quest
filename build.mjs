// 組出單一檔 index.html：內嵌引擎、預先算好的最佳解、圖示。玩家端不需安裝任何東西。
import fs from "node:fs";
import vm from "node:vm";
const here = (f) => new URL("./" + f, import.meta.url);
const engine = fs.readFileSync(here("engine.js"), "utf8");
const ctx = {}; vm.createContext(ctx); vm.runInContext(engine, ctx);
const SQ = ctx.SQ;
const best = {};
for (const lv of SQ.LEVELS) { const r = SQ.enumerate(lv)[0]; best[lv.id] = { board: r.board, add: r.add, t: r.t }; }
const bestJs = "window.SQ_BEST=" + JSON.stringify(best) + ";";
let html = fs.readFileSync(here("index.src.html"), "utf8");
// 引擎先讀到 SQ_BEST：把最佳解放在引擎之前
html = html.replace(/<script>\/\*ENGINE\*\/<\/script>\r?\n<script>\/\*BEST\*\/<\/script>/, () =>`<script>${bestJs}</script>\n<script>${engine}</script>`);
html = html.replace("<!--SPRITE-->", () => fs.readFileSync(here("sprite.svg"), "utf8"));
if (html.includes("/*ENGINE*/") || html.includes("<!--SPRITE-->")) throw new Error("placeholder left");
fs.writeFileSync(here("index.html"), html);
console.log("index.html", Math.round(html.length / 1024), "KB", JSON.stringify(best));
