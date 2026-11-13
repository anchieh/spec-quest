// 自動試玩：無頭 Edge＋DevTools 協定。真實點擊第 1 關，其餘關卡以最佳解與錯誤解各出貨一次；記錄主控台錯誤並截圖。
//   node play_test.mjs [寬] [高]
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const EDGE = ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find((p) => fs.existsSync(p));
const W = +(process.argv[2] || 1600), H = +(process.argv[3] || 900), PORT = 9341 + (W % 7);
const OUT = path.join(HERE, "shots", `${W}x${H}`); fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const edge = spawn(EDGE, ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${path.join(process.env.TEMP, "edge-sq-" + W)}`, `--window-size=${W},${H}`, "about:blank"]);
let targets;
for (let i = 0; i < 60; i++) { try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); if (targets.some((t) => t.type === "page")) break; } catch {} await sleep(200); }
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let seq = 0; const pending = new Map(); const errors = [];
ws.addEventListener("message", (m) => { const d = JSON.parse(m.data);
  if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
  if (d.method === "Runtime.exceptionThrown") errors.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text);
  if (d.method === "Runtime.consoleAPICalled" && d.params.type === "error") errors.push(d.params.args.map((a) => a.value || a.description).join(" ")); });
const cmd = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const ev = async (expr) => { const r = await cmd("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || "eval"); return r.result.result.value; };
const shot = async (name) => { const r = await cmd("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }); fs.writeFileSync(path.join(OUT, name + ".png"), Buffer.from(r.result.data, "base64")); };
const click = async (sel) => { const box = await ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)}); if(!e) return null; e.scrollIntoView({block:"center"}); const r=e.getBoundingClientRect(); return [r.x+r.width/2,r.y+r.height/2]})()`);
  if (!box) throw new Error("no element " + sel);
  for (const type of ["mousePressed", "mouseReleased"]) await cmd("Input.dispatchMouseEvent", { type, x: box[0], y: box[1], button: "left", clickCount: 1 }); await sleep(120); };

await cmd("Runtime.enable"); await cmd("Page.enable");
await cmd("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: W < 800 });
await cmd("Page.navigate", { url: "file:///" + path.join(HERE, "index.html").replace(/\\/g, "/") });
await sleep(2500);
await ev(`localStorage.clear(); location.reload()`).catch(() => {}); await sleep(2500);
await shot("00-title");
await click("#bStart"); await sleep(300); await shot("01-map");
// 第 1 關：真實點擊
await click('.lvl[data-l="1"]'); await sleep(400); await shot("02-brief");
await click("#bGo"); await sleep(200);
await click('#ffr .ff[data-b="pico"]'); await sleep(200);
await click('#ffr .ff[data-b="pico"] .var button[data-b="pico2"]'); await sleep(300); await shot("03-build-L1");
const shipEnabled = await ev(`!document.querySelector("#bShip").disabled`);
await click("#bShip"); await sleep(400); await click("#bSkip"); await sleep(1800); await shot("04-result-L1");
const s1 = await ev(`+document.querySelector("#scNum").textContent`);
const results = [{ lv: 1, real: s1, shipEnabled }];
await click("#bNext"); await sleep(400); await click("#bGo");
// 其餘關卡：最佳解（應 100）與「全買最高」（應 < 95）
for (let id = 2; id <= 10; id++) {
  const r = await ev(`(()=>{const lv=SQ.LEVELS[${id - 1}]; window.__sq.startLevel(${id}); document.querySelector("#mBrief").classList.remove("on");
    const b=SQ.best(lv); window.__sq.B={board:b.board,add:{...b.add},t:[...b.t]}; window.__sq.renderAll();
    const best=SQ.score(lv,window.__sq.B).score;
    const hi={board:b.board,add:{...b.add},t:b.t.map((x,i)=>SQ.unlockedAt(${id}).has(SQ.TIERS[i].id)?SQ.TIERS[i].cost.length-1:x)}; const over=SQ.score(lv,hi).score;
    const lo={board:b.board,add:{...b.add},t:b.t.map((x,i)=>SQ.unlockedAt(${id}).has(SQ.TIERS[i].id)?0:x)}; const under=SQ.score(lv,lo).score;
    return {best,over,under}})()`);
  await sleep(300); await shot(`1${id}-build-L${id}`);
  await click("#bShip"); await sleep(2600); await shot(`2${id}-sim-L${id}`);
  await click("#bSkip").catch(() => {}); await sleep(1500);
  const shown = await ev(`+document.querySelector("#scNum").textContent`);
  results.push({ lv: id, ...r, shown });
  await ev(`document.querySelector("#mSim").classList.remove("on")`);
}
await ev(`window.__sq.show("map"); window.__sq.renderMap()`); await sleep(300); await shot("30-map-after");
await click("#map .bLang"); await sleep(300); await shot("31-map-en");
console.log(JSON.stringify(results));
console.log("errors:", errors.length ? errors : "none");
ws.close(); edge.kill();
process.exit(errors.length ? 1 : 0);
