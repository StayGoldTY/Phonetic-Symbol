var KKProgress = (function () {
  var KEY = "phonetic-symbol-kk-v1";
  var memory = null;
  var persistFailed = false;

  function empty() {
    return { version: 1, learned: {}, review: [], starred: [], current: "i-long", quiz: { correct: 0, total: 0 } };
  }

  function load() {
    if (memory) return memory;
    try {
      var raw = localStorage.getItem(KEY);
      memory = raw ? Object.assign(empty(), JSON.parse(raw)) : empty();
    } catch (err) {
      persistFailed = true;
      memory = empty();
    }
    return memory;
  }

  function save() {
    if (!memory) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(memory));
    } catch (err) {
      persistFailed = true;
    }
  }

  function markLearned(id) {
    var state = load();
    state.learned[id] = Date.now();
    state.review = state.review.filter(function (item) { return item !== id; });
    save();
  }

  function addReview(id) {
    var state = load();
    if (state.review.indexOf(id) === -1) state.review.push(id);
    save();
  }

  function toggleStar(id) {
    var state = load();
    var index = state.starred.indexOf(id);
    if (index === -1) state.starred.push(id);
    else state.starred.splice(index, 1);
    save();
    return state.starred.indexOf(id) !== -1;
  }

  function setCurrent(id) {
    load().current = id;
    save();
  }

  function recordQuiz(ok) {
    var state = load();
    state.quiz.total += 1;
    if (ok) state.quiz.correct += 1;
    save();
  }

  function learnedCount() {
    return Object.keys(load().learned).length;
  }

  function isLearned(id) {
    return Boolean(load().learned[id]);
  }

  function canPersist() {
    return !persistFailed;
  }

  return {
    load: load,
    markLearned: markLearned,
    addReview: addReview,
    toggleStar: toggleStar,
    setCurrent: setCurrent,
    recordQuiz: recordQuiz,
    learnedCount: learnedCount,
    isLearned: isLearned,
    canPersist: canPersist
  };
})();
