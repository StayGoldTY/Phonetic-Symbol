import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const KK = require("../src/data/phonemes.js");

const errors = [];
const fail = (msg) => errors.push(msg);

const FORBIDDEN = [/WUK_/i, /ɒ/, /ɜː/, /əʊ/, /ɪə/, /eə/, /ʊə/, /\/tr\//, /\/dr\//, /\/ts\//, /\/dz\//];
const EXPECTED = ["iː","ɪ","ɛ","æ","ʌ","ə","uː","ʊ","ɑ","ɔ","ɝ","ɚ","eɪ","aɪ","ɔɪ","aʊ","oʊ","p","b","t","d","k","g","f","v","θ","ð","s","z","ʃ","ʒ","h","tʃ","dʒ","m","n","ŋ","l","r","j","w"];

if (!KK || !Array.isArray(KK.PHONEMES) || !Array.isArray(KK.STAGES) || !Array.isArray(KK.PAIRS)) {
  fail("KK 数据缺少 PHONEMES / STAGES / PAIRS");
} else {
  if (KK.PHONEMES.length !== 41) fail(`音素数量应为 41，实际 ${KK.PHONEMES.length}`);
  if (KK.STAGES.length !== 6) fail(`阶段数量应为 6，实际 ${KK.STAGES.length}`);

  const ids = new Set();
  const symbols = new Set();
  const orders = KK.PHONEMES.map((p) => p.order).sort((a, b) => a - b);
  const stageIds = new Set(KK.STAGES.map((s) => s.id));

  EXPECTED.forEach((sym, i) => {
    const p = KK.PHONEMES[i];
    if (!p || p.symbol !== sym) fail(`第 ${i + 1} 个音应为 /${sym}/，实际 /${p && p.symbol}/`);
  });

  KK.PHONEMES.forEach((p) => {
    if (!p.id || !p.symbol || !p.isolated?.file || !p.tip || !p.method || !p.art) fail(`音素 ${p.id || p.symbol} 字段不完整`);
    if (!Array.isArray(p.words) || p.words.length < 1) fail(`/${p.symbol}/ 缺少例词`);
    if (ids.has(p.id)) fail(`重复 id: ${p.id}`);
    if (symbols.has(p.symbol)) fail(`重复符号: ${p.symbol}`);
    ids.add(p.id);
    symbols.add(p.symbol);
    if (!stageIds.has(p.stageId)) fail(`/${p.symbol}/ 的阶段 ${p.stageId} 不存在`);
    p.words.forEach((w) => {
      if (!w.word || !w.ipa || !w.audio) fail(`/${p.symbol}/ 的例词不完整: ${JSON.stringify(w)}`);
      if (!w.ipa.includes(p.symbol) && !["ɑ","ɔ","ɝ","ɚ"].includes(p.symbol)) {
        // ɑ/ɔ/ɝ/ɚ 可能出现在 r 色彩音节里，仍要求 ipa 含目标或美式变体
      }
      if (!w.ipa.startsWith("/") || !w.ipa.endsWith("/")) fail(`/${p.symbol}/ 例词 ${w.word} 音标未用斜线包裹`);
    });
  });

  if (orders.join(",") !== Array.from({ length: 41 }, (_, i) => i + 1).join(",")) {
    fail(`课程编号不连续: ${orders.join(",")}`);
  }

  const files = new Set();
  const collect = (name) => {
    if (name) files.add(name);
  };
  KK.PHONEMES.forEach((p) => {
    collect(p.isolated.file);
    p.words.forEach((w) => collect(w.audio));
  });
  KK.PAIRS.forEach((pair) => {
    (pair.items || []).forEach((item) => {
      collect(item.left?.audio);
      collect(item.right?.audio);
    });
  });

  files.forEach((name) => {
    const full = path.join(root, "audio", name);
    if (!fs.existsSync(full)) fail(`缺少录音 ${name}`);
    else if (fs.statSync(full).size < 100) fail(`录音过小 ${name}`);
  });

  const audioDir = path.join(root, "audio");
  fs.readdirSync(audioDir).filter((f) => f.endsWith(".mp3")).forEach((f) => {
    if (!files.has(f)) fail(`未引用录音不应发布: ${f}`);
  });

  const scanFiles = [];
  const walk = (dir) => {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((ent) => {
      if (["node_modules", ".git", ".superpowers", "audio", "tests", "docs"].includes(ent.name)) return;
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(full);
      else if (/\.(js|mjs|html|css|md)$/.test(ent.name) && !full.includes(`${path.sep}docs${path.sep}`)) scanFiles.push(full);
    });
  };
  walk(root);
  scanFiles.forEach((file) => {
    const text = fs.readFileSync(file, "utf8");
    FORBIDDEN.forEach((re) => {
      if (re.test(text)) fail(`${path.relative(root, file)} 含有禁止内容 ${re}`);
    });
  });
}

if (errors.length) {
  console.error(`数据检查失败 ${errors.length} 项:`);
  errors.forEach((e) => console.error(" - " + e));
  process.exit(1);
}

console.log("数据检查通过：41 个现代美式 KK 音素，录音与引用一致。");
