var KKMouth = (function () {
  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function tonguePath(h, b, curl) {
    var tipY = 96 + h * 10 - (1 - b) * 6;
    var tipX = 70 + b * 18;
    var bodyX = 110 + b * 90;
    var bodyY = 55 + h * 55;
    var backX = 210 + b * 20;
    var backY = 70 + h * 35;
    var mid = curl
      ? (" Q " + (tipX + 8) + " " + (tipY - 18) + " " + (tipX + 22) + " " + (tipY - 8))
      : (" Q " + (tipX + 16) + " " + (tipY - 6) + " " + (tipX + 28) + " " + (tipY - 2));
    return "M " + tipX + " " + tipY + mid + " Q " + bodyX + " " + (bodyY - 8) + " " + backX + " " + backY + " Q " + (bodyX + 20) + " " + (bodyY + 28) + " " + (tipX + 10) + " " + (tipY + 14) + " Z";
  }

  function svg(art, symbol) {
    var a = art || { k: "v", h: 0.5, b: 0.5, r: 0, lab: String(symbol) };
    var W = 300;
    var H = 168;
    var parts = [];
    parts.push('<rect x="0" y="0" width="' + W + '" height="' + H + '" rx="10" fill="var(--card)" stroke="var(--line)"/>');
    parts.push('<path d="M48 58 C110 28, 200 28, 248 70" fill="none" stroke="var(--palate)" stroke-width="2.2"/>');
    parts.push('<path d="M248 70 Q262 88 255 108" fill="none" stroke="var(--palate)" stroke-width="1.6" stroke-dasharray="3 3"/>');
    parts.push('<path d="M52 118 C120 128, 200 125, 245 112" fill="none" stroke="var(--ink)" stroke-width="1.4" opacity="0.45"/>');
    parts.push('<rect x="58" y="62" width="7" height="12" rx="1" fill="var(--bg)" stroke="var(--ink)" stroke-width="1"/>');
    parts.push('<rect x="58" y="98" width="7" height="10" rx="1" fill="var(--bg)" stroke="var(--ink)" stroke-width="1"/>');
    if (a.k === "c" && a.place === "bilabial") {
      parts.push('<path d="M40 72 Q48 78 40 88" stroke="var(--lip)" stroke-width="3" fill="none"/>');
      parts.push('<path d="M40 92 Q48 98 40 108" stroke="var(--lip)" stroke-width="3" fill="none"/>');
      parts.push('<line x1="40" y1="88" x2="40" y2="92" stroke="var(--lip)" stroke-width="3"/>');
    } else if (a.r) {
      parts.push('<ellipse cx="42" cy="90" rx="10" ry="16" stroke="var(--lip)" stroke-width="2.4" fill="none"/>');
    } else {
      parts.push('<path d="M34 78 Q48 72 52 82" stroke="var(--lip)" stroke-width="2.2" fill="none"/>');
      parts.push('<path d="M34 102 Q48 108 52 96" stroke="var(--lip)" stroke-width="2.2" fill="none"/>');
    }
    if (a.k === "v" || a.k === "d") {
      parts.push('<path d="' + tonguePath(a.h, a.b, 0) + '" fill="var(--tongue)" fill-opacity="0.85" stroke="var(--ink)" stroke-width="1.2"/>');
      var dx = 70 + a.b * 140, dy = 58 + a.h * 55;
      parts.push('<circle cx="' + dx + '" cy="' + dy + '" r="5" fill="var(--accent)"/>');
      if (a.k === "d") {
        var dx2 = 70 + a.b2 * 140, dy2 = 58 + a.h2 * 55;
        parts.push('<circle cx="' + dx2 + '" cy="' + dy2 + '" r="4" fill="var(--warn)"/>');
        parts.push('<path d="M' + dx + " " + dy + " Q " + ((dx + dx2) / 2) + " " + (Math.min(dy, dy2) - 12) + " " + dx2 + " " + dy2 + '" stroke="var(--warn)" stroke-width="1.6" fill="none"/>');
      }
    } else {
      var place = a.place;
      var h = 0.45, b = 0.35, curl = 0, contact = null;
      if (place === "bilabial") { h = 0.55; b = 0.15; contact = [44, 90]; }
      else if (place === "labiodental") { h = 0.5; b = 0.18; contact = [58, 78]; }
      else if (place === "dental") { h = 0.42; b = 0.12; contact = [62, 80]; }
      else if (place === "alveolar") { h = 0.35; b = 0.25; contact = [95, 58]; }
      else if (place === "postalveolar") { h = 0.3; b = 0.4; curl = 1; contact = [125, 52]; }
      else if (place === "palatal") { h = 0.2; b = 0.45; contact = [150, 48]; }
      else if (place === "velar") { h = 0.32; b = 0.78; contact = [230, 72]; }
      else if (place === "glottal") { h = 0.55; b = 0.55; contact = [258, 118]; }
      if (symbol === "r") curl = 1;
      parts.push('<path d="' + tonguePath(h, b, curl) + '" fill="var(--tongue)" fill-opacity="0.8" stroke="var(--ink)" stroke-width="1.2"/>');
      if (contact) {
        parts.push('<circle cx="' + contact[0] + '" cy="' + contact[1] + '" r="6" fill="none" stroke="var(--accent)" stroke-width="2.2"/>');
        parts.push('<circle cx="' + contact[0] + '" cy="' + contact[1] + '" r="2.5" fill="var(--accent)"/>');
      }
      var vc = a.v ? "var(--voice)" : "var(--muted)";
      parts.push('<circle cx="268" cy="128" r="9" fill="none" stroke="' + vc + '" stroke-width="2"/>');
      parts.push('<text x="268" y="132" text-anchor="middle" font-size="10" fill="' + vc + '">' + (a.v ? "浊" : "清") + "</text>");
    }
    parts.push('<text x="12" y="22" font-size="12" fill="var(--muted)">唇</text>');
    parts.push('<text x="250" y="28" font-size="12" fill="var(--muted)">软腭</text>');
    return '<div class="mouth"><svg viewBox="0 0 ' + W + " " + H + '" xmlns="http://www.w3.org/2000/svg" role="img">' + parts.join("") + '</svg><div class="cap">/' + esc(symbol) + "/　" + esc(a.lab || "") + "</div></div>";
  }

  return { svg: svg, esc: esc };
})();
