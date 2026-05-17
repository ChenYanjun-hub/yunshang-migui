#!/usr/bin/env bash
# ============================================================================
# 京華老宋体（KingHwa OldSong）本地子集化脚本
#
# 用途：把 35MB 的完整 ttf 子集成 ~800KB woff2，仅含项目实际用到的字符
# 漏字策略：fallback 到 CSS 变量链的下一档（Noto Serif SC）
#
# 跑法：bash scripts/build-kinghwa-subset.sh
#
# 前置依赖：
#   - Python 3 + fonttools + brotli
#     pip3 install --user fonttools brotli zopfli
#   - pyftsubset 在 PATH 中（或修改下面 PYFT 变量）
#   - 完整 ttf 文件：/tmp/KingHwaOldSong.ttf
#     一次性下载：
#       curl -sL https://registry.npmjs.org/@fontpkg/king-hwa-old-song/-/king-hwa-old-song-2.2.0.tgz \
#         | tar -xzf - --strip-components=1 -C /tmp -O 'package/京華老宋体v2.002.ttf' \
#         > /tmp/KingHwaOldSong.ttf
#
# 重新子集化时机：
#   - 项目新增大量静态文案后（admin 录入的动态文案不在扫描范围）
#   - 子集体积超过 1.2MB 时，考虑改用 cn-font-split 分包方案
# ============================================================================

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT/public/fonts/kinghwa-old-song"
TTF_SOURCE="${KHOS_TTF:-/tmp/KingHwaOldSong.ttf}"
PYFT="${PYFT:-$HOME/Library/Python/3.9/bin/pyftsubset}"

if [ ! -f "$TTF_SOURCE" ]; then
  echo "❌ 找不到 ttf 文件：$TTF_SOURCE"
  echo "   下载方式（见脚本头部注释）"
  exit 1
fi

if [ ! -x "$PYFT" ] && ! command -v pyftsubset >/dev/null 2>&1; then
  echo "❌ pyftsubset 未安装。pip3 install --user fonttools brotli zopfli"
  exit 1
fi
[ -x "$PYFT" ] || PYFT=pyftsubset

mkdir -p "$OUT_DIR"

# 1) 扫项目所有静态文件里的中文 + 中英标点 + ASCII
python3 - <<'PY'
import re, pathlib
root = pathlib.Path(".")
patterns = ["src/**/*.tsx", "src/**/*.ts", "public/data/*.json",
            "public/data/*.geojson", "*.md", "开发日志/*.md", "docs/*.md"]
text = ""
for pat in patterns:
    for p in root.glob(pat):
        try:
            text += p.read_text(errors="ignore")
        except Exception:
            pass

# CJK + 中文符号
cjk = set(re.findall(r"[一-鿿　-〿＀-￯]", text))
# ASCII 可打印
ascii_set = set(chr(i) for i in range(32, 127))
# 常用中文标点 + 圈数字
extra = set("。，、；：？！…—·〈〉《》「」『』【】〔〕（）［］｛｝‖｜＂＇\"\\'""''‘’“”〽￥％％°′″〝〞‵′†‡§¶©®™·•～＿　①②③④⑤⑥⑦⑧⑨⑩")
all_chars = sorted(cjk | ascii_set | extra)
pathlib.Path("/tmp/khos_chars_full.txt").write_text("".join(all_chars))
print(f"[scan] {len(cjk)} CJK + {len(ascii_set)} ASCII + {len(extra)} 符号 = {len(all_chars)} 字符")
PY

# 2) pyftsubset → woff2
"$PYFT" "$TTF_SOURCE" \
  --text-file=/tmp/khos_chars_full.txt \
  --output-file="$OUT_DIR/KingHwaOldSong.woff2" \
  --flavor=woff2 \
  --layout-features='*' \
  --no-hinting \
  --desubroutinize \
  --notdef-outline \
  --recommended-glyphs

# 3) 输出体积
SIZE=$(ls -lh "$OUT_DIR/KingHwaOldSong.woff2" | awk '{print $5}')
echo "✅ 子集完成：$OUT_DIR/KingHwaOldSong.woff2 ($SIZE)"
echo "   如果体积超过 1.2MB，考虑改用 cn-font-split 分包方案。"
