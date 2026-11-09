# Modern KK Learning Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把现有英美混合单页改成只教 41 个现代美式 KK 的静态学习站，并发布到 GitHub Pages。

**Architecture:** 零构建静态站。`index.html` 只提供骨架；数据、播放、进度和路由分成独立脚本。Hash 路由兼容 GitHub Pages 子路径。录音只保留被数据引用的美式文件。

**Tech Stack:** HTML, CSS, vanilla JS, Node 测试脚本, GitHub Actions Pages

## Global Constraints

- 只展示 41 个现代美式 KK 音素：`/iː ɪ ɛ æ ʌ ə uː ʊ ɑ ɔ ɝ ɚ eɪ aɪ ɔɪ aʊ oʊ p b t d k g f v θ ð s z ʃ ʒ h tʃ dʒ m n ŋ l r j w/`
- 禁止英音切换、英式备注、`WUK_` 录音，以及 `/ɒ ɜː əʊ ɪə eə ʊə tr dr ts dz/`
- 首页必须完整展示 6 个阶段和 41 个音，未学内容仍可点击
- 单音页固定五步：标准音 → 发音方法 → 例词 → 最小对立 → 听辨自测
- 进度存 `localStorage`，不可用时仍可学习
- 推送 `main` 后 GitHub Pages 自动发布

## File Map

- Create: `tests/check-data.mjs`
- Create: `src/data/phonemes.js`
- Create: `src/audio.js`
- Create: `src/progress.js`
- Create: `src/mouth.js`
- Create: `src/app.js`
- Create: `assets/styles.css`
- Create: `.github/workflows/pages.yml`
- Create: `.nojekyll`
- Modify: `index.html`
- Modify: `README.md`
- Delete unused: `audio/WUK_*.mp3` and unused isolated files not referenced by KK data

---

### Task 1: Data contract and phoneme catalog

**Files:**
- Create: `tests/check-data.mjs`
- Create: `src/data/phonemes.js`

**Interfaces:**
- Produces: `window.KK = { STAGES, PHONEMES, PAIRS, getPhoneme, audioFiles }`
- Each phoneme: `{ id, symbol, order, stageId, focus, isolated, tip, mistake, method, art, words[], contrastIds[] }`
- Each word: `{ word, ipa, audio }`
- Isolated: `{ file, kind: "phoneme"|"exemplar" }`

- [ ] **Step 1: Write the failing data check**

`tests/check-data.mjs` must fail until `src/data/phonemes.js` exists and satisfies:

1. exactly 41 unique `id` and unique `symbol`
2. `order` is `1..41`
3. forbidden symbols and `WUK_` never appear
4. every referenced mp3 exists, is non-empty, and lives under `audio/`
5. unused mp3 files are reported as failures so they are not published

- [ ] **Step 2: Implement 41-phoneme catalog using modern KK and existing WUS/P files**

Map isolated audio as:

- `/ɛ/` → `P_e.mp3`
- `/ɑ/` → `P_ɑː.mp3`
- `/ɔ/` → `P_ɔː.mp3`
- `/ɝ/` → `P_ɜː.mp3`
- `/ɚ/` → `P_ɚ.mp3` copied from `P_ɜː.mp3`
- `/eɪ aɪ ɔɪ oʊ/` → exemplar words `day eye boy go`
- `/aʊ/` → `D_aʊ.mp3`

- [ ] **Step 3: Run `node tests/check-data.mjs` until it passes**
- [ ] **Step 4: Commit data, tests, and used audio mapping**

### Task 2: Player, progress, and mouth diagram

**Files:**
- Create: `src/audio.js`
- Create: `src/progress.js`
- Create: `src/mouth.js`

**Interfaces:**
- `KKAudio.play(file, { rate=1, times=1, onError })`
- `KKAudio.stop()`
- `KKProgress.load()/save()/markLearned(id)/addReview(id)/toggleStar(id)/setCurrent(id)`
- `KKMouth.svg(art, symbol)` returns safe SVG HTML

- [ ] **Step 1: Single-instance audio player with encoded filenames and visible errors**
- [ ] **Step 2: localStorage progress with in-memory fallback**
- [ ] **Step 3: Port the existing mouth diagram, keyed by modern KK art objects**
- [ ] **Step 4: Commit**

### Task 3: Learning map UI and lesson flow

**Files:**
- Create: `assets/styles.css`
- Create: `src/app.js`
- Modify: `index.html`

**Interfaces:**
- Hash routes: `#/map`, `#/sound/<id>`, `#/quiz`, `#/pairs`, `#/review`
- `index.html` has `#app` only; all interactive UI is rendered by `src/app.js`

- [ ] **Step 1: Recreate the confirmed motivating map layout**
- [ ] **Step 2: Render the five-step lesson page with prev/map/next**
- [ ] **Step 3: Quiz, minimal pairs, and review views**
- [ ] **Step 4: Commit**

### Task 4: Verify locally then publish

**Files:**
- Create: `.github/workflows/pages.yml`
- Create: `.nojekyll`
- Modify: `README.md`

- [ ] **Step 1: Run data check and browser path: map → lesson 1 → play isolated → play word → quiz → back to map**
- [ ] **Step 2: Create public GitHub repo `StayGoldTY/Phonetic-Symbol` with remote name `github`, keep Origin as `origin`**
- [ ] **Step 3: Enable GitHub Pages from Actions; push `main` to `origin` and `github`**
- [ ] **Step 4: Verify the live Pages URL returns 200 and can load one isolated sound and one word**
