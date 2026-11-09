# Modern KK Learning Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a motivating, mobile-friendly learning site for the 41-sound modern American KK curriculum defined in the approved design.

**Architecture:** Replace the monolithic HTML with a zero-build ES-module static site. Keep curriculum data, audio playback, progress persistence, and rendering in focused modules; use Node's built-in test runner for data and state logic, and GitHub Actions for validation and Pages deployment.

**Tech Stack:** HTML5, CSS, vanilla JavaScript ES modules, Web Audio/HTMLAudioElement, `localStorage`, Node.js 22 built-in test runner, GitHub Actions, GitHub Pages.

## Global Constraints

- The visible curriculum contains exactly 41 modern American KK sounds: 17 vowels and 24 consonants.
- Do not display British pronunciation controls, British notes, `WUK_` assets, or `/ɒ ɜː əʊ ɪə eə ʊə tr dr ts dz/` as independent curriculum sounds.
- All 41 sounds remain visible and directly accessible; progress guides but never locks content.
- Each lesson follows standard sound, articulation, examples, minimal pair, then listening quiz.
- The site has no runtime framework, package dependency, backend, account, or build requirement.
- Progress is anonymous and local to the browser.
- A `main` push validates and deploys the public GitHub Pages site.

---

### Task 1: Curriculum data and validation

**Files:**
- Create: `package.json`
- Create: `src/data/phonemes.js`
- Create: `tests/curriculum.test.mjs`
- Create: `scripts/validate-content.mjs`

**Interfaces:**
- Produces: `PHONEMES`, `STAGES`, `MINIMAL_PAIRS`, `FORBIDDEN_SYMBOLS`.
- Each phoneme has `id`, `order`, `symbol`, `stage`, `title`, `priority`, `articulation`, `mistakes`, `phonemeAudio`, `examples`, and `contrasts`.

- [ ] **Step 1: Add the Node test command and failing curriculum tests**

```json
{
  "name": "phonetic-symbol",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test",
    "validate": "node scripts/validate-content.mjs"
  }
}
```

The tests must assert:

```js
assert.equal(PHONEMES.length, 41);
assert.equal(new Set(PHONEMES.map(item => item.symbol)).size, 41);
assert.deepEqual(PHONEMES.map(item => item.order), Array.from({ length: 41 }, (_, i) => i + 1));
assert.equal(PHONEMES.filter(item => item.stage <= 2).length, 17);
assert.ok(PHONEMES.every(item => item.examples.length >= 3));
assert.ok(FORBIDDEN_SYMBOLS.every(symbol => !JSON.stringify(PHONEMES).includes(symbol)));
```

- [ ] **Step 2: Run the test and verify the missing module failure**

Run: `npm test`

Expected: FAIL because `src/data/phonemes.js` does not exist.

- [ ] **Step 3: Implement the six stages and all 41 phonemes**

Use these exact stage ranges and symbols:

```js
export const STAGES = [
  { id: 1, title: "核心元音与最小对立", range: [1, 10], priority: "最优先", days: 7 },
  { id: 2, title: "卷舌元音与双元音", range: [11, 17], priority: "最优先", days: 5 },
  { id: 3, title: "爆破音：清浊成对", range: [18, 23], priority: "高优先", days: 4 },
  { id: 4, title: "摩擦音：重点纠错", range: [24, 32], priority: "高优先", days: 7 },
  { id: 5, title: "破擦音与鼻音", range: [33, 37], priority: "进阶", days: 4 },
  { id: 6, title: "流音与半元音", range: [38, 41], priority: "进阶", days: 3 }
];

const SYMBOLS = [
  "iː", "ɪ", "ɛ", "æ", "ʌ", "ə", "uː", "ʊ", "ɑ", "ɔ",
  "ɝ", "ɚ", "eɪ", "aɪ", "ɔɪ", "aʊ", "oʊ",
  "p", "b", "t", "d", "k", "g", "f", "v", "θ", "ð", "s", "z",
  "ʃ", "ʒ", "h", "tʃ", "dʒ", "m", "n", "ŋ", "l", "r", "j", "w"
];
```

Every example must use an American transcription and a `WUS_*.mp3` file that exists locally. Missing isolated sounds may use an example-word recording, but the UI must label it as an example rather than a verified isolated phoneme.

- [ ] **Step 4: Implement the content validator**

`scripts/validate-content.mjs` imports the curriculum, checks all invariants, resolves audio paths from the repository root, rejects missing/zero-byte files, and scans rendered curriculum text for forbidden symbols and `WUK_`.

- [ ] **Step 5: Run validation**

Run: `npm test && npm run validate`

Expected: all tests pass and validation prints `Validated 41 phonemes`.

- [ ] **Step 6: Commit**

```bash
git add package.json src/data/phonemes.js tests/curriculum.test.mjs scripts/validate-content.mjs
git commit -m "建立现代美式 KK 课程数据"
```

### Task 2: Audio and progress modules

**Files:**
- Create: `src/audio.js`
- Create: `src/progress.js`
- Create: `tests/progress.test.mjs`

**Interfaces:**
- `createAudioPlayer({ AudioCtor })` returns `play(file, options)`, `stop()`, and `isPlaying()`.
- `createProgressStore(storage)` returns `load()`, `complete(id)`, `recordMistake(id)`, `toggleFavorite(id)`, and `reset()`.
- Progress shape: `{ completed: string[], mistakes: Record<string, number>, favorites: string[] }`.

- [ ] **Step 1: Write failing progress tests**

Cover default state, corrupt JSON recovery, idempotent completion, mistake increments, favorite toggling, reset, and unavailable storage.

```js
const store = createProgressStore(memoryStorage());
store.complete("i-long");
store.complete("i-long");
assert.deepEqual(store.load().completed, ["i-long"]);
```

- [ ] **Step 2: Run the focused test**

Run: `node --test tests/progress.test.mjs`

Expected: FAIL because `src/progress.js` does not exist.

- [ ] **Step 3: Implement defensive progress persistence**

Use one key, `modern-kk-progress-v1`. Validate loaded arrays and objects; return an in-memory default if storage throws. Do not block learning when persistence is unavailable.

- [ ] **Step 4: Implement single-instance audio playback**

`play()` must stop the previous audio, URL-encode only the file name, apply `playbackRate`, preserve pitch when supported, repeat using the same element, and return a promise that rejects with the concrete file name.

- [ ] **Step 5: Run tests and lint-level syntax checks**

Run: `npm test && node --check src/audio.js && node --check src/progress.js`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/audio.js src/progress.js tests/progress.test.mjs
git commit -m "加入音频播放和学习进度"
```

### Task 3: Responsive learning experience

**Files:**
- Replace: `index.html`
- Create: `assets/styles.css`
- Create: `src/app.js`
- Create: `src/views/map.js`
- Create: `src/views/lesson.js`
- Create: `src/views/practice.js`

**Interfaces:**
- `renderMap({ phonemes, stages, progress })`
- `renderLesson({ phoneme, progress })`
- `renderQuiz({ candidates, answerId })`
- Hash routes: `#/map`, `#/sound/:id`, `#/quiz`, `#/pairs`, `#/review`.

- [ ] **Step 1: Replace the shell with semantic, accessible landmarks**

`index.html` contains a skip link, header navigation, `<main id="app">`, a live status region, stylesheet link, and `type="module"` entry point. The initial HTML explains that JavaScript is required without showing stale curriculum content.

- [ ] **Step 2: Implement the approved visual system**

Port the confirmed motivating learning-map direction:

- gradient but restrained hero;
- primary “从第 1 课开始” action;
- 41/6/15-minute summary;
- six colored stage cards;
- yellow focus treatment for common Mandarin-speaker errors;
- visible hover/focus states;
- single-column mobile layout below 850 px;
- respect `prefers-reduced-motion` and dark mode.

- [ ] **Step 3: Render the complete map**

All 41 sounds display with order numbers. Completed/current/unseen states are distinct, but every sound remains an anchor to `#/sound/:id`.

- [ ] **Step 4: Render the five-step lesson**

The lesson includes:

```text
1 听标准音
2 看口型和舌位
3 学美式例词
4 做最小对立
5 听辨自测
```

Audio controls provide normal, slow, and repeat-three. Completion occurs only after answering the lesson quiz; mistakes are recorded on wrong answers.

- [ ] **Step 5: Implement practice, pairs, and review views**

Quiz candidates are unique and include the correct answer. Review orders sounds by mistake count, then favorites. Empty review state links back to the map.

- [ ] **Step 6: Verify keyboard and responsive behavior**

Run a local server and verify:

```powershell
python -m http.server 8765
```

Browser path: map → first sound → isolated/example audio → wrong answer → correct answer → map. Repeat at desktop and 390 px mobile width. Confirm browser back/forward works and no console/network errors occur.

- [ ] **Step 7: Run automated checks and commit**

Run: `npm test && npm run validate`

```bash
git add index.html assets src
git commit -m "实现现代 KK 学习地图和课程交互"
```

### Task 4: Audio resource cleanup and regression review

**Files:**
- Modify: `audio/`
- Modify: `README.md`
- Modify: `scripts/validate-content.mjs`

**Interfaces:**
- Published audio set equals the union of `phonemeAudio` and all example audio references from `PHONEMES`.

- [ ] **Step 1: Generate referenced and unreferenced audio reports**

The validator prints counts for referenced, missing, zero-byte, and unreferenced files. It must fail for missing/zero-byte/`WUK_` references, but unreferenced files are reported before cleanup.

- [ ] **Step 2: Remove British and unused recordings from the new site**

Delete `WUK_*.mp3` and recordings not referenced by the 41-sound curriculum after confirming the validator report. Do not delete any referenced `WUS_`, `P_`, or `D_` file.

- [ ] **Step 3: Update documentation**

README explains modern American KK scope, local opening via HTTP server, the six stages, test commands, progress storage, and deployment behavior.

- [ ] **Step 4: Review all generated and affected code**

Check symbol consistency, audio mapping, HTML escaping, event delegation, storage failure behavior, keyboard focus, mobile overflow, and duplication. Search the entire repository for forbidden British symbols and `WUK_`.

- [ ] **Step 5: Verify and commit**

Run: `npm test && npm run validate`

Expected: 41 phonemes, zero missing audio, zero forbidden references, zero unreferenced published audio.

```bash
git add -A
git commit -m "清理非美式录音并完善文档"
```

### Task 5: GitHub Pages deployment

**Files:**
- Create: `.github/workflows/pages.yml`

**Interfaces:**
- Trigger: push to `main` and manual dispatch.
- Validation job runs tests before upload.
- Deployment uses GitHub's official Pages actions.

- [ ] **Step 1: Create the public GitHub repository**

Create `StayGoldTY/Phonetic-Symbol` as public without replacing the existing Cursor `origin`. Add GitHub as remote `github`.

- [ ] **Step 2: Add the Pages workflow**

Use:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

The workflow checks out code, sets up Node 22, runs `npm test` and `npm run validate`, configures Pages, uploads the repository as the static artifact, and deploys it.

- [ ] **Step 3: Push both remotes**

Push `main` to Cursor Origin and GitHub. Confirm both remote branch hashes equal local `HEAD`.

- [ ] **Step 4: Verify the workflow and production URL**

Wait for the Pages workflow to succeed. Open the production URL and verify map rendering, first lesson navigation, one isolated/example sound, one word sound, and mobile layout. Confirm HTTP 200 and no console/network errors.

- [ ] **Step 5: Record final deployment state**

Report separately:

- local implementation complete;
- commits created;
- Cursor Origin pushed;
- GitHub pushed;
- Pages deployed;
- production behavior verified.

