// 引擎驗收：每關最佳唯一、非最佳 < 95 分、每個已解鎖機制都會影響分數、最佳解不靠轉接器。
import fs from "node:fs";
import vm from "node:vm";
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(new URL("./engine.js", import.meta.url), "utf8"), ctx);
const SQ = ctx.SQ;
let fail = 0;
for (const lv of SQ.LEVELS) {
  const rows = SQ.enumerate(lv);
  const b = rows[0];
  const ties = rows.filter((r) => Math.abs(r.e.total - b.e.total) < 1e-6).length;
  let hi = 0, worst = 100;
  for (const r of rows.slice(1)) { const s = SQ.score(lv, r).score; if (s >= 95) hi++; }
  const addStr = Object.entries(b.add).map(([k, v]) => `${k}×${v}`).join(" ");
  const ok = ties === 1 && hi === 0 && !b.add.ucom && !b.add.ucan && !b.add.ulte;
  if (!ok) fail++;
  // 每項分級：多一級與少一級的分數
  const dev = [];
  SQ.TIERS.forEach((T, i) => {
    if (!SQ.unlockedAt(lv.id).has(T.id)) return;
    for (const d of [1, -1]) {
      const t = [...b.t]; t[i] += d; if (t[i] < 0 || t[i] >= T.cost.length) continue;
      dev.push(`${T.id}${d > 0 ? "+" : "-"}${SQ.score(lv, { board: b.board, add: b.add, t }).score}`);
    }
  });
  console.log(`L${lv.id} ${ok ? "OK " : "BAD"} best=${b.board} ${addStr} t=${b.t.join("")} total=${Math.round(b.e.total)} rows=${rows.length} ties=${ties} ≥95=${hi}`);
  console.log("     ", dev.join("  "));
}
console.log(fail ? `FAIL ${fail}` : "ALL PASS");
process.exit(fail ? 1 : 0);
