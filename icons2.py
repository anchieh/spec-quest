"""遊戲用補充圖示：沿用 icons.py 的 48 格、平面三階、左上光源。輸出 sprite.svg 供 build 內嵌。"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import icons as I
from icons import S1, S2, S3, S4, G1, G2, GR1, GR2, R1, R2, A1, A2, B1, B2, W

EXTRA = {
    "kiosk": f"""<rect x="13" y="4" width="22" height="30" rx="3" fill="{S2}"/><rect x="15" y="7" width="18" height="15" rx="1.5" fill="{B1}"/>
<rect x="15" y="7" width="18" height="5" fill="{B2}"/><rect x="18" y="25" width="12" height="3" rx="1" fill="{S4}"/>
<rect x="19" y="34" width="10" height="7" fill="{S1}"/><rect x="11" y="41" width="26" height="4" rx="2" fill="{S3}"/>
<path d="M22 14 h4 M21 17 h6" stroke="{W}" stroke-width="1.6" stroke-linecap="round"/>""",
    "vending": f"""<rect x="9" y="3" width="30" height="42" rx="3" fill="{R1}"/><rect x="9" y="3" width="30" height="6" rx="3" fill="{R2}"/>
<rect x="12" y="10" width="17" height="24" rx="1.5" fill="#1b2430"/>
{''.join(f'<rect x="{14 + c * 5}" y="{12 + r * 7}" width="3.5" height="5" rx="1" fill="{[A2, GR2, B2][(r + c) % 3]}"/>' for r in range(3) for c in range(3))}
<rect x="31" y="11" width="6" height="8" rx="1" fill="{S4}"/><circle cx="34" cy="23" r="1.8" fill="{A2}"/><rect x="12" y="37" width="17" height="4" rx="1" fill="#1b2430"/>""",
    "gauge": f"""<circle cx="24" cy="26" r="18" fill="{S2}"/><circle cx="24" cy="26" r="14" fill="#1b2430"/>
<path d="M13 31 A12 12 0 0 1 35 31" stroke="{GR2}" stroke-width="3" fill="none"/><path d="M31 21 A12 12 0 0 1 35 31" stroke="{R2}" stroke-width="3" fill="none"/>
<path d="M24 28 L32 18" stroke="{A2}" stroke-width="2.6" stroke-linecap="round"/><circle cx="24" cy="28" r="2.6" fill="{S4}"/>
<path d="M6 10 l4 -4 l4 6 l4 -8 l4 6" stroke="{B2}" stroke-width="2" fill="none" stroke-linejoin="round"/>""",
    "agv": f"""<rect x="5" y="18" width="38" height="16" rx="3" fill="{A1}"/><rect x="5" y="18" width="38" height="5" rx="2.5" fill="{A2}"/>
<rect x="10" y="10" width="28" height="8" rx="1.5" fill="{S3}"/><rect x="14" y="6" width="20" height="4" rx="1" fill="{S4}"/>
<circle cx="13" cy="37" r="5" fill="{S1}"/><circle cx="35" cy="37" r="5" fill="{S1}"/><circle cx="13" cy="37" r="2" fill="{S4}"/><circle cx="35" cy="37" r="2" fill="{S4}"/>
<rect x="20" y="25" width="8" height="5" rx="1" fill="#1b2430"/><circle cx="24" cy="27.5" r="1.5" fill="{B2}"/>""",
    "bed": f"""<rect x="4" y="26" width="40" height="7" rx="2" fill="{S3}"/><rect x="4" y="20" width="12" height="7" rx="3" fill="{W}"/>
<rect x="14" y="22" width="30" height="5" rx="2" fill="{B2}"/><rect x="4" y="12" width="3" height="28" rx="1.5" fill="{S2}"/><rect x="41" y="22" width="3" height="18" rx="1.5" fill="{S2}"/>
<rect x="26" y="4" width="16" height="12" rx="2" fill="{S1}"/><path d="M28 11 h3 l2 -4 l2 7 l2 -3 h3" stroke="{GR2}" stroke-width="1.6" fill="none" stroke-linejoin="round"/>""",
    "scan": f"""<path d="M6 30 a18 18 0 0 1 36 0 v10 h-36z" fill="{S2}"/><path d="M6 30 a18 18 0 0 1 36 0" fill="{S3}"/>
<circle cx="24" cy="30" r="9" fill="#1b2430"/><circle cx="24" cy="30" r="5.5" fill="{B1}"/><circle cx="22" cy="28" r="1.8" fill="{B2}"/>
<rect x="2" y="40" width="44" height="5" rx="2" fill="{S1}"/><rect x="30" y="38" width="16" height="3" rx="1" fill="{W}"/>""",
    "grid": f"""<path d="M24 3 L33 44 H29 L24 18 L19 44 H15 Z" fill="{S2}"/><path d="M24 3 L33 44 H29 L24 18 Z" fill="{S3}"/>
<rect x="10" y="10" width="28" height="3" rx="1" fill="{S4}"/><rect x="13" y="19" width="22" height="3" rx="1" fill="{S4}"/>
<circle cx="11" cy="14" r="2" fill="{A2}"/><circle cx="37" cy="14" r="2" fill="{A2}"/><path d="M5 30 L11 14 M43 30 L37 14" stroke="{A1}" stroke-width="1.4"/>""",
    "ship": f"""<path d="M4 30 H44 L38 40 H10 Z" fill="{B1}"/><path d="M4 30 H44 L42 33 H6 Z" fill="{B2}"/>
<rect x="14" y="18" width="18" height="12" rx="1.5" fill="{W}"/><rect x="16" y="20" width="14" height="4" fill="#1b2430"/>
<rect x="22" y="8" width="3" height="10" fill="{S2}"/><path d="M25 9 L33 12 L25 15 Z" fill="{R2}"/>
<path d="M2 44 q4 -3 8 0 t8 0 t8 0 t8 0 t8 0" stroke="{B2}" stroke-width="2" fill="none"/>""",
    "lan": f"""<rect x="8" y="10" width="32" height="28" rx="3" fill="{S2}"/><rect x="8" y="10" width="32" height="6" rx="3" fill="{S3}"/>
<path d="M14 20 h20 v12 h-5 v3 h-10 v-3 h-5z" fill="#1b2430"/><g fill="{G2}">{''.join(f'<rect x="{16 + i * 2.2:.1f}" y="21" width="1.2" height="4"/>' for i in range(8))}</g>
<circle cx="13" cy="13" r="1.5" fill="{GR2}"/><circle cx="35" cy="13" r="1.5" fill="{A2}"/>""",
    "gpu": f"""<rect x="3" y="12" width="42" height="22" rx="3" fill="{S1}"/><rect x="3" y="12" width="42" height="5" rx="2.5" fill="{S2}"/>
<circle cx="15" cy="23" r="7" fill="#1b2430"/><circle cx="33" cy="23" r="7" fill="#1b2430"/><circle cx="15" cy="23" r="2" fill="{S4}"/><circle cx="33" cy="23" r="2" fill="{S4}"/>
<path d="M15 16 v14 M8 23 h14 M33 16 v14 M26 23 h14" stroke="{S3}" stroke-width="1.4"/><rect x="8" y="34" width="26" height="4" fill="{G1}"/>
{''.join(f'<rect x="{9 + i * 2.5:.1f}" y="34" width="1.4" height="4" fill="{G2}"/>' for i in range(10))}""",
    "card": f"""<rect x="5" y="10" width="36" height="22" rx="2" fill="{GR1}"/><rect x="5" y="10" width="36" height="5" rx="2" fill="{GR2}"/>
<rect x="13" y="17" width="12" height="10" rx="1" fill="#1b2430"/><rect x="28" y="18" width="8" height="3" fill="{S4}"/><rect x="28" y="23" width="8" height="3" fill="{S4}"/>
<rect x="9" y="32" width="22" height="4" fill="{G1}"/>{''.join(f'<rect x="{10 + i * 2.5:.1f}" y="32" width="1.4" height="4" fill="{G2}"/>' for i in range(8))}
<rect x="41" y="6" width="3" height="32" fill="{S3}"/>""",
    "m2mod": f"""<rect x="4" y="16" width="38" height="14" rx="2" fill="{B1}"/><rect x="4" y="16" width="38" height="4" rx="2" fill="{B2}"/>
<rect x="12" y="20" width="10" height="7" rx="1" fill="#1b2430"/><rect x="26" y="21" width="7" height="5" rx="1" fill="{S4}"/>
<rect x="4" y="19" width="4" height="8" fill="{G2}"/><circle cx="40" cy="23" r="2.4" fill="#0e1a24" stroke="{S4}" stroke-width="1.2"/>""",
    "dongle": f"""<rect x="16" y="4" width="16" height="12" rx="1.5" fill="{S3}"/><rect x="19" y="7" width="3" height="3" fill="#1b2430"/><rect x="26" y="7" width="3" height="3" fill="#1b2430"/>
<rect x="14" y="16" width="20" height="16" rx="3" fill="{S1}"/><path d="M24 32 C24 40 30 38 32 44" stroke="{S2}" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M36 10 l5 -5 M38 16 l7 -2" stroke="{R2}" stroke-width="2.2" stroke-linecap="round"/>""",
    "lock": f"""<rect x="10" y="20" width="28" height="22" rx="4" fill="{S2}"/><rect x="10" y="20" width="28" height="6" rx="3" fill="{S3}"/>
<path d="M16 20 v-6 a8 8 0 0 1 16 0 v6" stroke="{S4}" stroke-width="4" fill="none"/><circle cx="24" cy="31" r="3" fill="#1b2430"/><rect x="23" y="32" width="2" height="5" fill="#1b2430"/>""",
    "cert": f"""<rect x="8" y="5" width="28" height="36" rx="3" fill="{W}"/><rect x="12" y="11" width="20" height="2.5" rx="1" fill="{S3}"/><rect x="12" y="16" width="16" height="2.5" rx="1" fill="{S3}"/>
<rect x="12" y="21" width="18" height="2.5" rx="1" fill="{S3}"/><circle cx="33" cy="34" r="8" fill="{G1}"/><circle cx="33" cy="34" r="5.5" fill="{G2}"/>
<path d="M28 40 l-2 7 l4 -2 l3 3 l1 -7" fill="{R1}"/><path d="M30.5 34 l2 2 l4 -4" stroke="#1a1206" stroke-width="1.6" fill="none"/>""",
    "box": f"""<path d="M24 4 L42 13 V35 L24 44 L6 35 V13 Z" fill="{A1}"/><path d="M24 4 L42 13 L24 22 L6 13 Z" fill="{A2}"/><path d="M24 22 V44 L6 35 V13 Z" fill="#b97a1c"/>
<path d="M15 8.5 L33 17.5 V24" stroke="{W}" stroke-width="2.2" fill="none"/>""",
}

ALL = {**I.ICONS, **EXTRA}

if __name__ == "__main__":
    svg = ('<svg width="0" height="0" style="position:absolute" aria-hidden="true">'
           + "".join(f'<symbol id="i-{k}" viewBox="0 0 48 48">{v}</symbol>' for k, v in ALL.items()) + "</svg>")
    open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "sprite.svg"), "w", encoding="utf-8").write(svg)
    print(len(ALL), "icons", len(svg), "bytes")
