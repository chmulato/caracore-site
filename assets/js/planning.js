/**
 * Planning Cara Core — render das torres 0–100%.
 * Dados: window.CARACORE_PLANNING (planning-data.js).
 */
(function () {
  const data = window.CARACORE_PLANNING;
  if (!data) return;

  function lastPct(product) {
    const h = product.history;
    return h.length ? h[h.length - 1].p : 0;
  }

  function fmtMonth(m) {
    const [y, mo] = m.split("-");
    const names = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    return names[Number(mo) - 1] + "/" + y.slice(2);
  }

  function sparkPoints(history) {
    if (!history.length) return "";
    const w = 120;
    const h = 36;
    const max = 100;
    const n = Math.max(history.length - 1, 1);
    return history
      .map(function (pt, i) {
        const x = (i / n) * w;
        const y = h - (pt.p / max) * h;
        return x.toFixed(1) + "," + y.toFixed(1);
      })
      .join(" ");
  }

  function yearTower(y) {
    const pct = Math.max(0, Math.min(100, y.pct));
    return (
      '<article class="pl-year-tower" style="--fill:' +
      pct +
      '%">' +
      '<div class="pl-year-shaft" role="img" aria-label="' +
      y.label +
      " " +
      pct +
      '%">' +
      '<div class="pl-year-fill"></div>' +
      '<span class="pl-year-pct">' +
      pct +
      "%</span>" +
      "</div>" +
      '<h3 class="pl-year-label">' +
      y.label +
      "</h3>" +
      '<p class="pl-year-sub">' +
      y.subtitle +
      "</p>" +
      '<p class="pl-year-note">' +
      y.note +
      "</p>" +
      "</article>"
    );
  }

  function productTower(p) {
    const pct = lastPct(p);
    return (
      '<button type="button" class="pl-tower tone-' +
      p.tone +
      '" data-product="' +
      p.id +
      '" style="--fill:' +
      pct +
      '%" aria-pressed="false" aria-controls="pl-detail" aria-label="' +
      p.name +
      ", " +
      pct +
      '% do marco até 2029">' +
      '<span class="pl-tower-pct">' +
      pct +
      "%</span>" +
      '<span class="pl-tower-shaft">' +
      '<span class="pl-tower-grid" aria-hidden="true"></span>' +
      '<span class="pl-tower-fill"></span>' +
      "</span>" +
      '<span class="pl-tower-base">' +
      '<span class="pl-tower-n">' +
      p.n +
      "</span>" +
      '<span class="pl-tower-name">' +
      p.name +
      "</span>" +
      "</span>" +
      "</button>"
    );
  }

  function productCard(p) {
    const pct = lastPct(p);
    const pts = sparkPoints(p.history);
    const months = p.history
      .map(function (pt) {
        return "<li><span>" + fmtMonth(pt.m) + "</span><strong>" + pt.p + "%</strong></li>";
      })
      .join("");
    return (
      '<article class="pl-card tone-' +
      p.tone +
      '" id="produto-' +
      p.id +
      '">' +
      '<header class="pl-card-head">' +
      "<h3>" +
      p.n +
      ". " +
      p.name +
      "</h3>" +
      '<p class="pl-card-pct">' +
      pct +
      "%</p>" +
      "</header>" +
      '<p class="pl-card-hundred"><strong>100% neste horizonte:</strong> ' +
      p.hundred +
      "</p>" +
      "<p>" +
      p.now +
      "</p>" +
      '<svg class="pl-spark" viewBox="0 0 120 36" aria-hidden="true"><polyline points="' +
      pts +
      '" /></svg>' +
      '<ol class="pl-months">' +
      months +
      "</ol>" +
      '<p class="pl-card-shop"><a href="' +
      p.shop +
      '" rel="noopener">Loja</a></p>' +
      "</article>"
    );
  }

  const asOf = document.getElementById("pl-asof");
  if (asOf) asOf.textContent = data.AS_OF_LABEL;

  const horizon = document.getElementById("pl-horizon");
  if (horizon) horizon.textContent = data.HORIZON;

  const note = document.getElementById("pl-note");
  if (note) note.textContent = data.NOTE;

  const years = document.getElementById("pl-years");
  if (years) years.innerHTML = data.YEARS.map(yearTower).join("");

  const skyline = document.getElementById("pl-skyline");
    if (skyline) {
      skyline.innerHTML = data.PRODUCTS.map(productTower).join("");
      skyline.addEventListener("click", function (ev) {
        const btn = ev.target.closest(".pl-tower");
        if (!btn) return;
        skyline.querySelectorAll(".pl-tower").forEach(function (b) {
          b.setAttribute("aria-pressed", "false");
        });
        btn.setAttribute("aria-pressed", "true");
        const card = document.getElementById("produto-" + btn.getAttribute("data-product"));
        if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

  const cards = document.getElementById("pl-cards");
  if (cards) cards.innerHTML = data.PRODUCTS.map(productCard).join("");

  const avg =
    Math.round(
      data.PRODUCTS.reduce(function (s, p) {
        return s + lastPct(p);
      }, 0) / data.PRODUCTS.length
    );
  const avgEl = document.getElementById("pl-avg");
  if (avgEl) avgEl.textContent = avg + "%";

  const fund = data.FUNDING;
  if (fund) {
    const totalEl = document.getElementById("pl-fund-total");
    if (totalEl) totalEl.textContent = fund.currency + " " + fund.total;
    const monthEl = document.getElementById("pl-fund-month");
    if (monthEl) monthEl.textContent = fund.currency + " " + fund.monthly;
    const monthsEl = document.getElementById("pl-fund-months");
    if (monthsEl) monthsEl.textContent = String(fund.months);
    const rangeEl = document.getElementById("pl-fund-range");
    if (rangeEl) rangeEl.textContent = fund.fromLabel + " → " + fund.toLabel;
    const verdictEl = document.getElementById("pl-fund-verdict");
    if (verdictEl) verdictEl.textContent = fund.verdict;
    const paidEl = document.getElementById("pl-fund-paid");
    if (paidEl) paidEl.textContent = fund.paidNote;
    const sponsorEl = document.getElementById("pl-fund-sponsor");
    if (sponsorEl) sponsorEl.textContent = fund.sponsorAdds;
    const cta = document.querySelector(".pl-fund-cta a");
    if (cta && fund.contactHref) cta.setAttribute("href", fund.contactHref);

    const covers = document.getElementById("pl-fund-covers");
    if (covers) {
      covers.innerHTML = fund.covers
        .map(function (row) {
          return (
            "<tr><td>" +
            row.when +
            "</td><td>" +
            row.item +
            "</td><td>" +
            row.spend +
            "</td></tr>"
          );
        })
        .join("");
    }
    const queue = document.getElementById("pl-fund-queue");
    if (queue) {
      queue.innerHTML = fund.queue
        .map(function (row) {
          return "<tr><td>" + row.period + "</td><td>" + row.owner + "</td></tr>";
        })
        .join("");
    }
    const notIn = document.getElementById("pl-fund-notin");
    if (notIn) {
      notIn.innerHTML = fund.notInEnvelope
        .map(function (item) {
          return "<li>" + item + "</li>";
        })
        .join("");
    }
    const rules = document.getElementById("pl-fund-rules");
    if (rules) {
      rules.textContent =
        fund.tool +
        " · teto " +
        fund.capPct +
        "% · " +
        fund.sessionsPerWeek +
        " sessões Agent/semana · on-demand " +
        (fund.onDemand ? "sim" : "não") +
        " · 1 produto pesado por ciclo.";
    }
  }
})();
