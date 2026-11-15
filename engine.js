/* 選型大挑戰 Spec Quest：資料＋解題器＋計分。瀏覽器與 Node 共用（掛在 globalThis.SQ）。
   價格與損失為遊戲簡化值；名詞依 terms.md；情境取材自產業應用分類（去識別化）。 */
(function (G) {
  "use strict";

  // 板型：id、名稱、長邊 mm、COM、LAN、x16 槽、x4 槽、M.2 槽、單價（遊戲簡化值，非特定廠商真實規格）
  const BOARDS = [
    { id: "pico", ff: "pico", v: 0, len: 100, com: 1, lan: 1, x16: 0, x4: 0, m2: 1, price: 380 },
    { id: "pico2", ff: "pico", v: 1, len: 100, com: 2, lan: 2, x16: 0, x4: 0, m2: 1, price: 450 },
    { id: "sbc", ff: "sbc", v: 0, len: 146, com: 2, lan: 2, x16: 0, x4: 0, m2: 2, price: 520 },
    { id: "sbc6", ff: "sbc", v: 1, len: 146, com: 6, lan: 2, x16: 0, x4: 0, m2: 2, price: 640 },
    { id: "itx", ff: "itx", v: 0, len: 170, com: 2, lan: 2, x16: 1, x4: 0, m2: 2, price: 600 },
    { id: "itx6", ff: "itx", v: 1, len: 170, com: 6, lan: 2, x16: 1, x4: 0, m2: 2, price: 700 },
    { id: "matx", ff: "matx", v: 0, len: 244, com: 6, lan: 2, x16: 1, x4: 3, m2: 2, price: 880 },
    { id: "atx", ff: "atx", v: 0, len: 305, com: 6, lan: 2, x16: 2, x4: 5, m2: 2, price: 1050 },
    { id: "come", ff: "come", v: 0, len: 125, com: 0, lan: 0, x16: 0, x4: 0, m2: 0, price: 760, custom: true },
  ];
  const FORMS = ["pico", "sbc", "itx", "matx", "atx", "come"];
  const COME_NRE = 60000;

  // 可買的擴充：PCIe 卡（佔槽）、M.2 模組（佔 M.2）、USB 轉接器（不佔槽，但有現場損失）
  const ADDONS = {
    com4: { kind: "pcie", price: 120, give: { com: 4 } },
    lan2: { kind: "pcie", price: 90, give: { lan: 2 } },
    can: { kind: "m2", price: 60, give: { can: 1 } },
    lte: { kind: "m2", price: 90, give: { lte: 1 } },
    ucom: { kind: "usb", price: 25, give: { com: 1 }, loss: 600 },
    ucan: { kind: "usb", price: 30, give: { can: 1 }, loss: 900 },
    ulte: { kind: "usb", price: 40, give: { lte: 1 }, loss: 500 },
  };
  const ADDON_ORDER = ["com4", "lan2", "can", "lte", "ucom", "ucan", "ulte"];

  // 六項分級：成本（溫度為板價倍率）、少一級損失（少兩級 ×1.5）
  const TIERS = [
    { id: "temp", cost: [1.0, 1.3, 1.6], under: 2200, mult: true },
    { id: "power", cost: [180, 420, 650], under: 750 },
    { id: "prot", cost: [0, 30, 70], under: 380, perPort: true },
    { id: "store", cost: [150, 380, 680], under: 650 },
    { id: "supply", cost: [0, 600, 900], under: 2000 },
    { id: "cert", cost: [0, 400], under: 2200 },
  ];
  const OVER_K = 4;

  // 關卡：產業、圖示、機構上限、介面需求、必插卡（顧客自備，佔槽）、年量、六項需要級別、解鎖
  // need 順序：溫度、電源、防護、儲存、供貨、認證
  const LEVELS = [
    { id: 1, dom: "retail", icon: "kiosk", maxLen: 150, req: { com: 2, lan: 1, can: 0, lte: 0 }, cards: [], vol: 1500,
      need: [0, 0, 0, 0, 0, 0], unlock: ["board", "usb"] },
    { id: 2, dom: "retail", icon: "vending", maxLen: 200, req: { com: 4, lan: 1, can: 0, lte: 0 }, cards: ["ai"], vol: 3000,
      need: [0, 0, 0, 0, 0, 0], unlock: ["pcie"] },
    { id: 3, dom: "factory", icon: "gauge", maxLen: 260, req: { com: 2, lan: 2, can: 0, lte: 0 }, cards: ["daq", "daq"], vol: 300,
      need: [0, 2, 0, 2, 1, 0], unlock: ["store", "power"] },
    { id: 4, dom: "factory", icon: "agv", maxLen: 150, req: { com: 2, lan: 2, can: 1, lte: 0 }, cards: [], vol: 800,
      need: [1, 1, 0, 1, 1, 0], unlock: ["temp", "m2"] },
    { id: 5, dom: "medical", icon: "bed", maxLen: 150, req: { com: 2, lan: 2, can: 0, lte: 0 }, cards: [], vol: 600,
      need: [0, 1, 2, 1, 1, 1], unlock: ["prot", "cert"] },
    { id: 6, dom: "medical", icon: "scan", maxLen: 320, req: { com: 1, lan: 2, can: 0, lte: 0 }, cards: ["gpu", "cap"], vol: 200,
      need: [0, 2, 0, 2, 1, 1], unlock: ["supply"] },
    { id: 7, dom: "energy", icon: "charger", maxLen: 150, req: { com: 4, lan: 1, can: 1, lte: 1 }, cards: [], vol: 10000,
      need: [2, 1, 2, 1, 1, 0], unlock: ["custom"] },
    { id: 8, dom: "energy", icon: "grid", maxLen: 320, req: { com: 4, lan: 4, can: 0, lte: 0 }, cards: [], vol: 150,
      need: [2, 2, 2, 1, 2, 1], unlock: [] },
    { id: 9, dom: "transport", icon: "ship", maxLen: 200, req: { com: 4, lan: 2, can: 0, lte: 0 }, cards: [], vol: 120,
      need: [1, 1, 2, 1, 1, 1], unlock: [] },
    { id: 10, dom: "transport", icon: "train", maxLen: 150, req: { com: 2, lan: 2, can: 1, lte: 1 }, cards: [], vol: 400,
      need: [2, 2, 1, 1, 2, 1], unlock: [], boss: true },
  ];
  const CARD_SLOT = { ai: "x4", daq: "x4", gpu: "x16", cap: "x4" };

  // 到第 n 關為止解鎖的機制
  function unlockedAt(n) {
    const s = new Set();
    LEVELS.filter((l) => l.id <= n).forEach((l) => l.unlock.forEach((u) => s.add(u)));
    return s;
  }
  const TIER_UNLOCK = { temp: "temp", power: "power", prot: "prot", store: "store", supply: "supply", cert: "cert" };

  // 把必插卡與擴充卡放進槽：x16 卡只能進 x16；x4 卡進 x4 或 x16。回傳是否放得下。
  function fits(board, lvCards, nPcie) {
    let x16 = board.x16, x4 = board.x4;
    for (const c of lvCards) {
      if (CARD_SLOT[c] === "x16") { if (x16 > 0) x16--; else return false; }
    }
    for (const c of lvCards) {
      if (CARD_SLOT[c] === "x4") { if (x4 > 0) x4--; else if (x16 > 0) x16--; else return false; }
    }
    return nPcie <= x4 + x16;
  }

  // 評估一組選擇。build = { board, add:{id:count}, t:[6 級] }
  function evaluate(lv, build) {
    const b = BOARDS.find((x) => x.id === build.board);
    const add = build.add || {};
    const out = { ok: true, reasons: [], have: { com: 0, lan: 0, can: 0, lte: 0 }, buy: 0, loss: 0, lossItems: [], ports: 0, dongles: 0 };
    if (!b) { out.ok = false; out.reasons.push("noBoard"); return out; }
    if (b.len > lv.maxLen) { out.ok = false; out.reasons.push("tooBig"); }
    let nPcie = 0, nM2 = 0;
    for (const id of ADDON_ORDER) {
      const n = add[id] || 0; if (!n) continue;
      const a = ADDONS[id];
      if (a.kind === "pcie") nPcie += n;
      if (a.kind === "m2") nM2 += n;
      for (const k in a.give) out.have[k] += a.give[k] * n;
    }
    if (b.custom) {
      if (lv.cards.length) { out.ok = false; out.reasons.push("noSlot"); }
      if (nPcie || nM2) { out.ok = false; out.reasons.push("customNoAddon"); }
      for (const k in lv.req) out.have[k] = Math.max(out.have[k], lv.req[k]);  // 客製底板：介面剛好做進去
    } else {
      out.have.com += b.com; out.have.lan += b.lan;
      if (!fits(b, lv.cards, nPcie)) { out.ok = false; out.reasons.push("noSlot"); }
      if (nM2 > b.m2) { out.ok = false; out.reasons.push("noM2"); }
    }
    for (const k in lv.req) if (out.have[k] < lv.req[k]) { out.ok = false; out.reasons.push("need_" + k); }

    // 整組擴充品完全沒用到（去掉後介面仍滿足需求）：原價加罰一次，當成浪費
    let wasteAddon = 0;
    for (const id of ADDON_ORDER) {
      const n = add[id] || 0; if (!n) continue;
      const a = ADDONS[id]; if (a.kind === "usb") continue;
      for (const k in a.give) { if (out.have[k] - a.give[k] * n >= (lv.req[k] || 0)) wasteAddon += a.price * n; }
    }

    const t = build.t;
    const base = b.custom ? b.price + COME_NRE / lv.vol : b.price;
    const hw = base + wasteAddon + ADDON_ORDER.filter((i) => ADDONS[i].kind !== "usb").reduce((s, i) => s + (add[i] || 0) * ADDONS[i].price, 0);
    out.hw = hw;
    out.buy = hw * TIERS[0].cost[t[0]];
    const usb = ADDON_ORDER.filter((i) => ADDONS[i].kind === "usb");
    out.dongles = usb.reduce((s, i) => s + (add[i] || 0), 0);
    out.buy += usb.reduce((s, i) => s + (add[i] || 0) * ADDONS[i].price, 0);
    // 實裝且可防護的埠：板載＋卡上的 COM、CAN 模組；轉接器不能防護
    out.ports = b.custom ? lv.req.com + lv.req.can : b.com + (add.com4 || 0) * 4 + (add.can || 0);
    for (const i of usb) if (add[i]) { out.loss += add[i] * ADDONS[i].loss; out.lossItems.push({ id: i, n: add[i], v: add[i] * ADDONS[i].loss }); }
    TIERS.forEach((T, i) => {
      if (i === 0) return;
      out.buy += T.perPort ? T.cost[t[i]] * out.ports : T.cost[t[i]];
    });
    TIERS.forEach((T, i) => {
      const gap = lv.need[i] - t[i];
      if (gap > 0) {
        const mult = T.perPort ? Math.max(1, out.ports + out.dongles) : 1;
        const v = T.under * (gap === 1 ? 1 : 1.5) * mult;
        out.loss += v; out.lossItems.push({ id: T.id, gap, v });
      }
      if (T.perPort && lv.need[i] > 0 && out.dongles) {          // 轉接器上的埠沒有防護
        const v = T.under * (lv.need[i] === 1 ? 1 : 1.5) * out.dongles;
        out.loss += v; out.lossItems.push({ id: "prot_usb", v });
      }
    });
    out.total = out.buy + out.loss;
    return out;
  }

  // 列舉所有可出貨組合（鎖住的分級固定在 need）
  function enumerate(lv) {
    const un = unlockedAt(lv.id);
    const tierChoices = TIERS.map((T, i) => (un.has(TIER_UNLOCK[T.id]) ? [...Array(T.cost.length).keys()] : [lv.need[i]]));
    const rows = [];
    const addonRanges = {
      com4: un.has("pcie") ? [0, 1, 2] : [0], lan2: un.has("pcie") ? [0, 1, 2] : [0],
      can: un.has("m2") ? [0, 1] : [0], lte: un.has("m2") ? [0, 1] : [0],
      ucom: [0, 1, 2, 3, 4], ucan: un.has("m2") ? [0, 1] : [0], ulte: un.has("m2") ? [0, 1] : [0],
    };
    const boards = BOARDS.filter((b) => !b.custom || un.has("custom"));
    const combos = cart(ADDON_ORDER.map((k) => addonRanges[k]));
    const tcombos = cart(tierChoices);
    for (const b of boards) for (const c of combos) {
      const add = {}; ADDON_ORDER.forEach((k, i) => { if (c[i]) add[k] = c[i]; });
      const probe = evaluate(lv, { board: b.id, add, t: lv.need });
      if (!probe.ok) continue;
      for (const t of tcombos) {
        const e = evaluate(lv, { board: b.id, add, t });
        rows.push({ board: b.id, add, t, e });
      }
    }
    rows.sort((a, b) => a.e.total - b.e.total);
    return rows;
  }
  function cart(arrs) { return arrs.reduce((acc, a) => acc.flatMap((x) => a.map((y) => [...x, y])), [[]]); }

  // 最佳解：建置時預先算好嵌入（G.SQ_BEST），瀏覽器不必現場窮舉
  const _bestCache = {};
  function best(lv) {
    if (_bestCache[lv.id]) return _bestCache[lv.id];
    const pre = G.SQ_BEST && G.SQ_BEST[lv.id];
    const r = pre ? { board: pre.board, add: pre.add, t: pre.t, e: evaluate(lv, pre) } : enumerate(lv)[0];
    return (_bestCache[lv.id] = r);
  }

  // 計分：100 × 剛好 ÷（剛好 ＋ 4 × 多付 ＋ 損失）
  function score(lv, build) {
    const e = evaluate(lv, build);
    const B = best(lv);
    if (!e.ok) return { score: 0, e, waste: 0, items: [], best: B };
    const items = [];
    const hwOver = Math.max(0, e.hw - B.e.hw) * TIERS[0].cost[build.t[0]];
    if (hwOver > 0.5) items.push({ id: "hw", kind: "over", v: hwOver });
    let tierOver = 0;
    TIERS.forEach((T, i) => {
      const k = build.t[i], n = lv.need[i];
      if (k > n) {
        const v = i === 0 ? B.e.hw * (T.cost[k] - T.cost[n]) : (T.cost[k] - T.cost[n]) * (T.perPort ? e.ports : 1);
        if (v > 0) { tierOver += v; items.push({ id: T.id, kind: "over", v }); }
      }
    });
    e.lossItems.forEach((li) => items.push({ id: li.id, kind: "under", v: li.v }));
    const waste = Math.max(hwOver + tierOver, e.buy - B.e.buy);
    const s = Math.round((100 * B.e.total) / (B.e.total + OVER_K * waste + e.loss));
    return { score: Math.min(100, s), e, waste, items, best: B };
  }
  function stars(s) { return s >= 90 ? 3 : s >= 75 ? 2 : s >= 50 ? 1 : 0; }

  G.SQ = { BOARDS, FORMS, ADDONS, ADDON_ORDER, TIERS, LEVELS, CARD_SLOT, COME_NRE, unlockedAt, evaluate, enumerate, best, score, stars };
})(typeof window !== "undefined" ? window : globalThis);
