(function () {
  var root = document.getElementById("app");
  if (!root || !window.KK) return;

  function esc(value) { return KKMouth.esc(value); }
  function byId(id) { return KK.getPhoneme(id); }
  function firstPhoneme() { return KK.PHONEMES[0]; }

  function highlight(ipa, symbol) {
    var safe = esc(ipa);
    var target = symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return safe.replace(new RegExp(target), function (match) {
      return '<b class="hl">' + match + "</b>";
    });
  }

  function parseRoute() {
    var hash = (location.hash || "#/map").replace(/^#/, "");
    var parts = hash.split("/").filter(Boolean);
    if (parts[0] === "sound" && parts[1]) return { view: "sound", id: parts[1] };
    if (["quiz", "pairs", "review"].indexOf(parts[0]) !== -1) return { view: parts[0] };
    return { view: "map" };
  }

  function go(hash) {
    location.hash = hash;
  }

  function nav(active) {
    return '<header class="nav"><a class="brand" href="#/map"><span class="brand-mark">K</span>Modern KK</a><nav class="navlinks">' +
      link("#/map", "学习地图", active === "map") +
      link("#/quiz", "听辨训练", active === "quiz") +
      link("#/pairs", "最小对立", active === "pairs") +
      link("#/review", "我的复习", active === "review") +
      "</nav></header>";
  }

  function link(href, label, on) {
    return '<a href="' + href + '"' + (on ? ' class="active"' : "") + ">" + label + "</a>";
  }

  function errorBox() {
    return '<div class="err" data-err></div>';
  }

  function playFile(file, opts) {
    KKAudio.play(file, Object.assign({}, opts, {
      onError: function (msg) {
        var el = root.querySelector("[data-err]");
        if (el) el.textContent = msg;
      }
    }));
  }

  function renderMap() {
    var progress = KKProgress.load();
    var learned = KKProgress.learnedCount();
    var current = byId(progress.current) || firstPhoneme();
    var pct = Math.round((learned / 41) * 100);
    var persist = KKProgress.canPersist() ? "" : '<div class="banner">当前浏览器不能保存进度，刷新后会从第 1 课重新开始。</div>';
    var stages = KK.STAGES.map(function (stage) {
      var sounds = KK.PHONEMES.filter(function (p) { return p.stageId === stage.id; }).map(function (p) {
        var cls = "sound";
        if (p.focus) cls += " focus";
        if (KKProgress.isLearned(p.id)) cls += " learned";
        if (p.id === current.id) cls += " current";
        return '<a class="' + cls + '" href="#/sound/' + p.id + '"><b>/' + esc(p.symbol) + '/</b><small>' + String(p.order).padStart(2, "0") + "</small></a>";
      }).join("");
      return '<section class="unit"><div class="unit-head"><div class="stage">' + stage.index + '</div><div class="unit-title"><b>' + esc(stage.title) + "</b><span>" + esc(stage.blurb) + '</span></div><span class="priority">' + esc(stage.priority) + "</span></div><div class=\"sounds\">" + sounds + '</div><div class="unit-foot"><span>' + esc(stage.eta) + "</span><b>" + (stage.index === "01" ? "从这里开始" : "随时可学") + "</b></div></section>";
    }).join("");
    root.innerHTML = nav("map") + persist +
      '<section class="hero"><div class="hero-grid"><div><span class="eyebrow">现代美式 KK · 41 音完整路线</span><h1>每天 15 分钟，<br>把美式发音<em>听清、说准</em></h1><p>不用死背符号。按重要性逐组学习，每个音都经过标准音、口型、例词、最小对立和听辨自测。</p><div class="hero-actions"><a class="primary" href="#/sound/' + current.id + '">从第 ' + current.order + " 课开始</a><span class=\"ghost\">预计 <b>6 周</b> 完成基础路线</span></div></div>" +
      '<div class="start-card"><div class="start-top"><b>当前课程</b><span class="level">' + (learned ? "继续学习" : "零基础友好") + '</span></div><div class="today"><div class="hero-symbol">/' + esc(current.symbol) + '/</div><div><b>' + current.order + " · /" + esc(current.symbol) + '/</b><span class="ghost">' + esc(current.tip) + '</span></div></div><div class="mini-progress"><i style="width:' + pct + '%"></i></div><div class="progress-label"><span>学习进度</span><span>' + learned + " / 41</span></div></div></div></section>" +
      '<div class="summary"><div class="metric"><div class="metric-icon">41</div><div><b>41 个音</b><span>完整现代美式 KK</span></div></div><div class="metric"><div class="metric-icon">6</div><div><b>6 个阶段</b><span>从核心到进阶</span></div></div><div class="metric"><div class="metric-icon">15</div><div><b>15 分钟</b><span>建议每日学习</span></div></div><div class="metric"><div class="metric-icon">' + (progress.quiz.total ? Math.round(progress.quiz.correct / progress.quiz.total * 100) + "%" : "0") + '</div><div><b>听辨正确率</b><span>错音自动进入复习</span></div></div></div>' +
      '<div class="section-head"><div><h2>完整学习地图</h2><p>从左到右、从上到下学习；后续内容始终可点开</p></div><span class="legend"><i></i>中文母语者重点易错音</span></div><div class="route">' + stages + "</div>";
  }

  function neighbors(phoneme) {
    var index = KK.PHONEMES.findIndex(function (p) { return p.id === phoneme.id; });
    return {
      prev: KK.PHONEMES[index - 1] || null,
      next: KK.PHONEMES[index + 1] || null
    };
  }

  function renderSound(id) {
    var phoneme = byId(id) || firstPhoneme();
    KKProgress.setCurrent(phoneme.id);
    var near = neighbors(phoneme);
    var words = phoneme.words.map(function (word) {
      return '<span class="witem"><button class="plain" data-play="' + esc(word.audio) + '">' + esc(word.word) + '</button><span class="ipa">' + highlight(word.ipa, phoneme.symbol) + "</span></span>";
    }).join("");
    var contrasts = (phoneme.contrastIds || []).map(function (cid) {
      var other = byId(cid);
      if (!other) return "";
      return '<a class="plain" href="#/sound/' + other.id + '">对照 /' + esc(other.symbol) + "/</a>" +
        '<button class="plain" data-play="' + esc(other.isolated.file) + '">听 /' + esc(other.symbol) + "/</button>";
    }).join("");
    var isolatedNote = phoneme.isolated.kind === "exemplar" ? "这个音暂以清晰例词作为示范。" : "先听准孤立音，再跟读。";
    root.innerHTML = nav("map") + '<article class="lesson"><section class="lesson-hero"><div class="sym">/' + esc(phoneme.symbol) + '/</div><p>' + esc(phoneme.tip) + "</p>" + errorBox() +
      '<div class="playrow"><button class="big" data-play="' + esc(phoneme.isolated.file) + '">听标准音</button><button class="plain" data-play="' + esc(phoneme.isolated.file) + '" data-rate="0.65">慢速</button><button class="plain" data-play="' + esc(phoneme.isolated.file) + '" data-times="3">重复三次</button><button class="plain" data-star="' + phoneme.id + '">' + (KKProgress.load().starred.indexOf(phoneme.id) === -1 ? "收藏" : "已收藏") + "</button></div><p class=\"ghost\">" + isolatedNote + "</p></section>" +
      '<section class="step-card"><h3>2. 发音方法</h3><p>' + esc(phoneme.method) + "</p><p class=\"ghost\">常见错误：" + esc(phoneme.mistake) + "</p>" + KKMouth.svg(phoneme.art, phoneme.symbol) + "</section>" +
      '<section class="step-card"><h3>3. 高频例词</h3><div class="wrow">' + words + "</div></section>" +
      '<section class="step-card"><h3>4. 最小对立</h3><div class="playrow">' + contrasts + "</div></section>" +
      '<section class="step-card"><h3>5. 听辨自测</h3><p>听标准音，选出刚才听到的音标。</p><div class="playrow"><button class="big" data-quiz="' + phoneme.id + '">开始本题</button></div><div id="quiz-box"></div></section>' +
      '<div class="navrow">' + (near.prev ? '<a class="plain" href="#/sound/' + near.prev.id + '">上一课 /' + esc(near.prev.symbol) + "/</a>" : "") +
      '<a class="secondary-btn" href="#/map">返回地图</a>' +
      (near.next ? '<a class="primary" href="#/sound/' + near.next.id + '">下一课 /' + esc(near.next.symbol) + "/</a>" : '<a class="primary" href="#/map">完成基础路线</a>') +
      "</div></article>";
  }

  function quizChoices(answer) {
    var pool = KK.PHONEMES.filter(function (p) { return p.id !== answer.id; });
    var sameStage = pool.filter(function (p) { return p.stageId === answer.stageId; });
    var extras = sameStage.concat(pool);
    var chosen = [];
    extras.forEach(function (p) {
      if (chosen.length < 3 && chosen.indexOf(p) === -1) chosen.push(p);
    });
    var options = [answer].concat(chosen).sort(function () { return Math.random() - 0.5; });
    return options.slice(0, 4);
  }

  function fillQuiz(phoneme, mount) {
    var options = quizChoices(phoneme);
    mount.innerHTML = '<div class="playrow"><button class="plain" data-play="' + esc(phoneme.isolated.file) + '">再听一遍</button></div><div class="quiz-options">' +
      options.map(function (p) {
        return '<button data-answer="' + p.id + '" data-expect="' + phoneme.id + '">/' + esc(p.symbol) + "/</button>";
      }).join("") + '</div><div class="quiz-result" data-quiz-result></div>';
    playFile(phoneme.isolated.file, { rate: 1, times: 1 });
  }

  function randomQuizTarget() {
    var learned = KK.PHONEMES.filter(function (p) { return KKProgress.isLearned(p.id); });
    var source = learned.length >= 4 ? learned : KK.PHONEMES.slice(0, 10);
    return source[Math.floor(Math.random() * source.length)];
  }

  function renderQuiz() {
    var target = randomQuizTarget();
    root.innerHTML = nav("quiz") + '<section class="lesson-hero"><h2>听辨训练</h2><p>从已学音标中抽题；不足 4 个时用第一阶段补充干扰项。</p>' + errorBox() + '<div id="quiz-box"></div></section>';
    fillQuiz(target, root.querySelector("#quiz-box"));
  }

  function renderPairs() {
    var cards = KK.PAIRS.map(function (pair) {
      var rows = pair.items.map(function (item) {
        return '<div class="pair-row"><button class="plain" data-play="' + esc(item.left.audio) + '">' + esc(item.left.word) + '</button><span class="ipa">' + highlight(item.left.ipa, byId(pair.leftId).symbol) + '</span><span>vs</span><button class="plain" data-play="' + esc(item.right.audio) + '">' + esc(item.right.word) + '</button><span class="ipa">' + highlight(item.right.ipa, byId(pair.rightId).symbol) + "</span></div>";
      }).join("");
      return '<section class="step-card"><h3>' + esc(pair.title) + '</h3><p class="ghost">' + esc(pair.hint) + "</p>" + rows + "</section>";
    }).join("");
    root.innerHTML = nav("pairs") + "<h2>最小对立</h2>" + errorBox() + cards;
  }

  function renderReview() {
    var state = KKProgress.load();
    var ids = state.review.concat(state.starred).filter(function (id, i, arr) { return arr.indexOf(id) === i; });
    var list = ids.map(function (id) {
      var p = byId(id);
      if (!p) return "";
      return '<a class="sound" href="#/sound/' + p.id + '"><b>/' + esc(p.symbol) + "/</b><small>" + String(p.order).padStart(2, "0") + "</small></a>";
    }).join("") || '<p class="ghost">还没有需要复习的音。自测答错或手动收藏后会出现在这里。</p>';
    root.innerHTML = nav("review") + '<section class="lesson-hero"><h2>我的复习</h2><div class="sounds">' + list + "</div></section>";
  }

  function render() {
    KKAudio.stop();
    var route = parseRoute();
    if (route.view === "sound") renderSound(route.id);
    else if (route.view === "quiz") renderQuiz();
    else if (route.view === "pairs") renderPairs();
    else if (route.view === "review") renderReview();
    else renderMap();
  }

  root.addEventListener("click", function (event) {
    var star = event.target.closest("[data-star]");
    if (star) {
      KKProgress.toggleStar(star.getAttribute("data-star"));
      render();
      return;
    }
    var play = event.target.closest("[data-play]");
    if (play) {
      playFile(play.getAttribute("data-play"), {
        rate: Number(play.getAttribute("data-rate") || 1),
        times: Number(play.getAttribute("data-times") || 1)
      });
      return;
    }
    var startQuiz = event.target.closest("[data-quiz]");
    if (startQuiz) {
      fillQuiz(byId(startQuiz.getAttribute("data-quiz")), document.getElementById("quiz-box"));
      return;
    }
    var answer = event.target.closest("[data-answer]");
    if (answer) {
      var options = answer.closest(".quiz-options");
      if (!options || options.getAttribute("data-done") === "1") return;
      options.setAttribute("data-done", "1");
      Array.prototype.forEach.call(options.querySelectorAll("[data-answer]"), function (btn) {
        btn.disabled = true;
      });
      var ok = answer.getAttribute("data-answer") === answer.getAttribute("data-expect");
      KKProgress.recordQuiz(ok);
      if (ok) KKProgress.markLearned(answer.getAttribute("data-expect"));
      else KKProgress.addReview(answer.getAttribute("data-expect"));
      var box = root.querySelector("[data-quiz-result]");
      var phoneme = byId(answer.getAttribute("data-expect"));
      if (box) {
        box.className = ok ? "quiz-result ok" : "quiz-result bad";
        box.textContent = ok ? "正确。/" + phoneme.symbol + "/ 已标记为已学。" : "不对，正确答案是 /" + phoneme.symbol + "/。已加入复习。";
      }
    }
  });

  window.addEventListener("hashchange", render);
  render();
})();
