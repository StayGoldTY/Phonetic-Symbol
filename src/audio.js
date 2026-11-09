var KKAudio = (function () {
  var current = null;
  var generation = 0;
  var timer = null;

  function stop() {
    generation += 1;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (current) {
      try {
        current.onended = null;
        current.onerror = null;
        current.pause();
        current.removeAttribute("src");
        current.load();
      } catch (err) {}
      current = null;
    }
  }

  function url(file) {
    return "audio/" + encodeURIComponent(file);
  }

  function play(file, options) {
    options = options || {};
    var rate = options.rate || 1;
    var times = options.times || 1;
    var onError = options.onError || function () {};
    stop();
    var gen = generation;
    var count = 0;
    var audio = new Audio(url(file));
    audio.playbackRate = rate;
    audio.preservesPitch = true;
    audio.mozPreservesPitch = true;
    audio.webkitPreservesPitch = true;
    current = audio;
    audio.onerror = function () {
      if (gen === generation) onError("找不到或无法播放 " + file);
    };
    audio.onended = function () {
      if (gen !== generation) return;
      count += 1;
      if (count < times) {
        timer = setTimeout(function () {
          if (gen !== generation) return;
          audio.currentTime = 0;
          audio.play().catch(function (err) { onError(err.message); });
        }, 420);
      }
    };
    audio.play().catch(function (err) {
      if (gen === generation) onError(file + "：" + err.message);
    });
  }

  return { play: play, stop: stop, url: url };
})();
