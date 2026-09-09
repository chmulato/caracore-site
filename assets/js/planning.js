/**
 * Planning Cara Core — dashboard L1 / L2 / L3.
 * Dados: window.CARACORE_PLANNING (planning-data.js).
 */
(function () {
  const data = window.CARACORE_PLANNING;
  if (!data) return;

  const STATE_LABEL = {
    risk: "risco",
    watch: "atenção",
    ok: "ok",
    done: "marco",
  };

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
    const h = 28;
    const n = Math.max(history.length - 1, 1);
    return history
      .map(function (pt, i) {
        const x = (i / n) * w;
        const y = h - (pt.p / 100) * h;
        return x.toFixed(1) + "," + y.toFixed(1);
      })
      .join(" ");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function badge(state) {
    const kind = state === "risk" ? "risco" : state === "watch" ? "watch" : state === "done" ? "done" : "ok";
    return '<span class="pl-badge pl-badge-' + kind + '">' + STATE_LABEL[state] + "</span>";
  }

  function productById(id) {
    return data.PRODUCTS.find(function (p) {
      return p.id === id;
    });
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function yearMeter(y) {
    const pct = Math.max(0, Math.min(100, y.pct));
    return (
      '<p class="pl-year">' +
      "<strong>" +
      escapeHtml(y.label) +
      " · " +
      pct +
      "%</strong>" +
      "<span>" +
      escapeHtml(y.subtitle) +
      "</span>" +
      '<span class="pl-track" style="--fill:' +
      pct +
      '%"><span class="pl-fill"></span></span>' +
      "</p>"
    );
  }

  function towerRow(p) {
    const pct = lastPct(p);
    const state = p.state || "ok";
    return (
      '<button type="button" class="pl-tower is-' +
      state +
      '" data-product="' +
      p.id +
      '" style="--fill:' +
      pct +
      '%" role="listitem" aria-pressed="false" aria-controls="pl-fiche" aria-label="' +
      escapeHtml(p.name) +
      ", " +
      pct +
      "%\">" +
      '<span class="pl-tower-name">' +
      escapeHtml(p.name) +
      (p.core ? "<small>núcleo</small>" : "") +
      "</span>" +
      '<span class="pl-track" aria-hidden="true"><span class="pl-fill"></span></span>' +
      '<span class="pl-tower-pct">' +
      pct +
      "%</span>" +
      badge(state) +
      "</button>"
    );
  }

  function productCard(p) {
    const pct = lastPct(p);
    const months = p.history
      .map(function (pt) {
        return "<li><span>" + fmtMonth(pt.m) + "</span><strong>" + pt.p + "%</strong></li>";
      })
      .join("");
    return (
      '<article class="pl-card" id="produto-' +
      p.id +
      '">' +
      '<header class="pl-card-head">' +
      "<h3>" +
      escapeHtml(p.name) +
      "</h3>" +
      '<p class="pl-card-pct">' +
      pct +
      "%</p>" +
      "</header>" +
      "<p>" +
      escapeHtml(p.hundred) +
      "</p>" +
      "<p>" +
      escapeHtml(p.now) +
      "</p>" +
      '<svg class="pl-spark" viewBox="0 0 120 28" aria-hidden="true"><polyline points="' +
      sparkPoints(p.history) +
      '" /></svg>' +
      '<ol class="pl-months">' +
      months +
      "</ol>" +
      "</article>"
    );
  }

  function renderNext() {
    const el = document.getElementById("pl-next");
    const next = data.EXEC && data.EXEC.next;
    if (!el || !next) return;
    el.innerHTML =
      '<p class="pl-next-row">' +
      '<span class="pl-badge pl-badge-risco">' +
      escapeHtml(next.gate) +
      "</span>" +
      "<strong>" +
      escapeHtml(next.when) +
      "</strong>" +
      "<span>" +
      escapeHtml(next.what) +
      " · " +
      escapeHtml(next.action) +
      "</span></p>";
  }

  function renderFlags() {
    const el = document.getElementById("pl-flags");
    if (!el) return;
    const flags = (data.EXEC && data.EXEC.flags) || [];
    if (!flags.length) {
      el.innerHTML = '<p class="pl-empty">Nenhum atraso. Ritmo normal.</p>';
      return;
    }
    el.innerHTML =
      '<ul class="pl-flag-list">' +
      flags
        .map(function (f) {
          return (
            '<li class="pl-flag pl-flag-' +
            f.kind +
            '"><strong>' +
            escapeHtml(f.title) +
            "</strong><span>" +
            escapeHtml(f.text) +
            "</span></li>"
          );
        })
        .join("") +
      "</ul>";
  }

  function showFiche(id) {
    const box = document.getElementById("pl-fiche");
    const p = productById(id);
    if (!box || !p) return;
    box.hidden = false;
    box.innerHTML =
      "<p><strong>" +
      escapeHtml(p.name) +
      "</strong> · " +
      lastPct(p) +
      "% · " +
      escapeHtml(p.now) +
      ' · <a href="' +
      escapeHtml(p.shop) +
      '" rel="noopener">loja</a></p>';
  }

  function bindTowers() {
    const list = document.getElementById("pl-tower-rows");
    if (!list) return;
    list.addEventListener("click", function (ev) {
      const btn = ev.target.closest(".pl-tower");
      if (!btn) return;
      const id = btn.getAttribute("data-product");
      list.querySelectorAll(".pl-tower").forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      showFiche(id);
      document.querySelectorAll(".pl-card").forEach(function (c) {
        c.classList.toggle("is-open", c.id === "produto-" + id);
      });
    });
  }

  const avg = Math.round(
    data.PRODUCTS.reduce(function (s, p) {
      return s + lastPct(p);
    }, 0) / data.PRODUCTS.length
  );
  const doneN = data.PRODUCTS.filter(function (p) {
    return lastPct(p) >= 100 || p.state === "done";
  }).length;

  setText("pl-asof", data.AS_OF_LABEL);
  setText("pl-horizon", data.HORIZON);
  setText("pl-avg", avg + "%");
  setText("pl-done", doneN + "/11");
  setText("pl-note", data.NOTE);

  const exec = data.EXEC;
  if (exec && exec.owner) {
    setText("pl-owner", exec.owner.who);
  }

  renderNext();
  renderFlags();

  const rows = document.getElementById("pl-tower-rows");
  if (rows) rows.innerHTML = data.PRODUCTS.map(towerRow).join("");
  bindTowers();

  const years = document.getElementById("pl-years");
  if (years) years.innerHTML = data.YEARS.map(yearMeter).join("");

  const yearNotes = document.getElementById("pl-year-notes");
  if (yearNotes) {
    yearNotes.innerHTML = data.YEARS.map(function (y) {
      return "<li>" + escapeHtml(y.label) + " — " + escapeHtml(y.note) + "</li>";
    }).join("");
  }

  const cards = document.getElementById("pl-cards");
  if (cards) cards.innerHTML = data.PRODUCTS.map(productCard).join("");

  const fund = data.FUNDING;
  if (fund) {
    setText("pl-fund-total", fund.currency + " " + fund.total);
    setText("pl-fund-month", fund.currency + " " + fund.monthly);
    setText("pl-fund-months", String(fund.months));
    setText("pl-fund-range", fund.fromLabel + " → " + fund.toLabel);
    setText("pl-fund-verdict", fund.verdict);
    setText("pl-fund-paid", fund.paidNote);
    setText("pl-fund-sponsor", fund.sponsorAdds);

    const cta = document.querySelector(".pl-fund-cta a");
    if (cta && fund.contactHref) cta.setAttribute("href", fund.contactHref);

    const covers = document.getElementById("pl-fund-covers");
    if (covers) {
      covers.innerHTML = fund.covers
        .map(function (row) {
          return (
            "<tr><td>" +
            escapeHtml(row.when) +
            "</td><td>" +
            escapeHtml(row.item) +
            "</td><td>" +
            escapeHtml(row.spend) +
            "</td></tr>"
          );
        })
        .join("");
    }

    const queue = document.getElementById("pl-fund-queue");
    if (queue) {
      queue.innerHTML = fund.queue
        .map(function (row) {
          return "<tr><td>" + escapeHtml(row.period) + "</td><td>" + escapeHtml(row.owner) + "</td></tr>";
        })
        .join("");
    }

    const notIn = document.getElementById("pl-fund-notin");
    if (notIn) {
      notIn.innerHTML = fund.notInEnvelope
        .map(function (item) {
          return '<span class="pl-chip">' + escapeHtml(item) + "</span>";
        })
        .join("");
    }

    const rules = document.getElementById("pl-fund-rules");
    if (rules) {
      const chips = [
        fund.tool,
        "teto " + fund.capPct + "%",
        fund.sessionsPerWeek + " sessões/semana",
        "on-demand " + (fund.onDemand ? "sim" : "não"),
        "1 produto pesado/ciclo",
        "cota não acumula",
      ];
      rules.innerHTML = chips.map(function (c) {
        return '<span class="pl-chip">' + escapeHtml(c) + "</span>";
      }).join("");
    }
  }

  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target && target.tagName === "DETAILS") target.open = true;
  }
})();
