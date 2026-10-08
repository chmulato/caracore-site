/**
 * Planning Cara Core — dashboard L1 / L2 / L3.
 * Dados: window.CARACORE_PLANNING (planning-data.js).
 * A camada visual explica o jargão; não altera percentuais, datas nem flags.
 */
(function () {
  const data = window.CARACORE_PLANNING;
  if (!data) return;

  const STATE_LABEL = {
    risk: "risco",
    watch: "atenção",
    ok: "ok",
    done: "concluído",
  };

  const STATE_ORDER = { risk: 0, watch: 1, ok: 2, done: 3 };

  const GROUP_LABEL = {
    risk: "Risco",
    watch: "Atenção",
    ok: "Ok",
    done: "Concluído",
  };

  const KIND_LABEL = {
    risco: "Risco",
    desvio: "Desvio",
  };

  const GLOSSARY = [
    ["v4.0.0-rc5", "Pré-release pública para avaliação, antes do lançamento estável."],
    ["v3.2.7-free", "Versão estável do PDV Java Free, em Windows, Linux e macOS."],
    ["v2.1.0-rc1.2", "Pré-release Windows para avaliação, com instalador e ZIP. O lançamento estável do Hub está previsto para 06/04/2027."],
    ["v2.0.0-RC1", "Release candidate público desta sala de estudo."],
    ["T032", "Gate interno do roteiro operacional."],
    ["Agent", "Sessão pesada do Cursor. É o que consome a cota do mês."],
    ["FRO", "Frente da frota 24/24, publicada em 06/10/2026. Freeze M1 em 08/11/2026."],
    ["PWA", "Aplicativo web instalável. No Ink, não antes de 2028."],
    ["GA", "Lançamento estável (general availability)."],
    ["M1", "Freeze de estabilização do CSO Frotas. Não é um lançamento novo."],
  ];

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

  function glossHtml(s) {
    let src = String(s);
    const parts = [];
    while (src.length) {
      let hit = null;
      let at = -1;
      for (let i = 0; i < GLOSSARY.length; i++) {
        const token = GLOSSARY[i][0];
        const idx = src.indexOf(token);
        if (idx === -1) continue;
        if (at === -1 || idx < at || (idx === at && token.length > hit[0].length)) {
          hit = GLOSSARY[i];
          at = idx;
        }
      }
      if (!hit) {
        parts.push(escapeHtml(src));
        break;
      }
      parts.push(escapeHtml(src.slice(0, at)));
      parts.push('<abbr title="' + escapeHtml(hit[1]) + '">' + escapeHtml(hit[0]) + "</abbr>");
      src = src.slice(at + hit[0].length);
    }
    return parts.join("");
  }

  function badge(state) {
    const kind = state === "risk" ? "risco" : state === "watch" ? "watch" : state === "done" ? "done" : "ok";
    return '<span class="pl-badge pl-badge-' + kind + '">' + STATE_LABEL[state] + "</span>";
  }

  function kindBadge(kind) {
    const label = KIND_LABEL[kind] || kind;
    const cls = kind === "desvio" ? "desvio" : "risco";
    return '<span class="pl-badge pl-badge-' + cls + '">' + escapeHtml(label) + "</span>";
  }

  function productById(id) {
    return data.PRODUCTS.find(function (p) {
      return p.id === id;
    });
  }

  function flagById(id) {
    const flags = (data.EXEC && data.EXEC.flags) || [];
    return flags.find(function (f) {
      return f.id === id;
    });
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function setHtml(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = value;
  }

  function publicNextTitle(what) {
    return String(what).replace(/\bGA\b/, "lançamento estável (GA)");
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
    const role = p.core ? "núcleo" : "brinco";
    return (
      '<div role="listitem"><button type="button" class="pl-tower is-' +
      state +
      (p.core ? " is-core" : " is-brinco") +
      '" data-product="' +
      p.id +
      '" style="--fill:' +
      pct +
      '%" aria-pressed="false" aria-controls="pl-fiche" aria-label="' +
      escapeHtml(p.name) +
      ", " +
      role +
      ", " +
      (STATE_LABEL[state] || state) +
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
      "</button></div>"
    );
  }

  function sortedProducts() {
    return data.PRODUCTS.slice().sort(function (a, b) {
      const sa = Object.prototype.hasOwnProperty.call(STATE_ORDER, a.state) ? STATE_ORDER[a.state] : 2;
      const sb = Object.prototype.hasOwnProperty.call(STATE_ORDER, b.state) ? STATE_ORDER[b.state] : 2;
      if (sa !== sb) return sa - sb;
      if (!!a.core !== !!b.core) return a.core ? -1 : 1;
      return (a.n || 0) - (b.n || 0);
    });
  }

  function renderTowers() {
    const rows = document.getElementById("pl-tower-rows");
    if (!rows) return;
    const groups = [];
    sortedProducts().forEach(function (p) {
      const state = p.state || "ok";
      let group = groups[groups.length - 1];
      if (!group || group.state !== state) {
        group = { state: state, core: [], other: [] };
        groups.push(group);
      }
      (p.core ? group.core : group.other).push(p);
    });
    rows.innerHTML = groups
      .map(function (group) {
        function block(items, label) {
          if (!items.length) return "";
          return (
            '<h4 class="pl-tower-sep pl-tower-sep-sub">' +
            label +
            "</h4>" +
            '<div class="pl-tower-list" role="list">' +
            items.map(towerRow).join("") +
            "</div>"
          );
        }
        const label = GROUP_LABEL[group.state] || group.state;
        return (
          '<section class="pl-tower-group" aria-label="' +
          escapeHtml(label) +
          '">' +
          '<h3 class="pl-tower-sep">' +
          escapeHtml(label) +
          "</h3>" +
          block(group.core, "Núcleo") +
          block(group.other, "Brincos") +
          "</section>"
        );
      })
      .join("");
  }

  function productCard(p) {
    const pct = lastPct(p);
    const months = p.history
      .map(function (pt) {
        return "<li><span>" + fmtMonth(pt.m) + "</span><strong>" + pt.p + "%</strong></li>";
      })
      .join("");
    const role = p.core ? "Núcleo" : "Brinco";
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
      badge(p.state || "ok") +
      " · " +
      role +
      "</p>" +
      "<p>" +
      glossHtml(p.hundred) +
      "</p>" +
      "<p>" +
      glossHtml(p.now) +
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
    let gate = "";
    if (next.gate) {
      const tip =
        next.gate === "T032"
          ? "Gate interno do roteiro operacional."
          : "Detalhe interno deste marco.";
      gate =
        '<p class="pl-next-gate"><abbr title="' +
        escapeHtml(tip) +
        '">' +
        escapeHtml(next.gate) +
        "</abbr>" +
        (next.gate === "T032" ? " · gate interno do roteiro operacional" : "") +
        "</p>";
    }
    el.innerHTML =
      '<h2 class="pl-next-title">' +
      escapeHtml(publicNextTitle(next.what)) +
      "</h2>" +
      '<p class="pl-next-when"><strong>' +
      escapeHtml(next.when) +
      '</strong> <span class="pl-badge pl-badge-watch" title="Previsão. O lançamento estável ainda não foi confirmado.">previsão</span></p>' +
      '<p class="pl-next-action">' +
      escapeHtml(next.action) +
      "</p>" +
      gate;
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
          const lead = f.lead || f.text || "";
          const detail = f.detail || "";
          const tip = f.tip ? ' title="' + escapeHtml(f.tip) + '"' : "";
          return (
            '<li class="pl-flag pl-flag-' +
            f.kind +
            '"' +
            tip +
            '><p class="pl-flag-head">' +
            kindBadge(f.kind) +
            "<strong>" +
            escapeHtml(f.title) +
            "</strong></p><span class=\"pl-flag-lead\">" +
            escapeHtml(lead) +
            "</span>" +
            (detail ? '<span class="pl-flag-detail">' + escapeHtml(detail) + "</span>" : "") +
            "</li>"
          );
        })
        .join("") +
      "</ul>";
  }

  function showFiche(id) {
    const box = document.getElementById("pl-fiche");
    const p = productById(id);
    if (!box || !p) return;
    const flag = flagById(id);
    const role = p.core ? "Núcleo" : "Brinco";
    const state = p.state || "ok";
    box.hidden = false;
    box.innerHTML =
      '<p class="pl-fiche-title"><strong>' +
      escapeHtml(p.name) +
      "</strong> " +
      badge(state) +
      ' <span class="pl-fiche-role">' +
      role +
      "</span> · " +
      lastPct(p) +
      "%</p>" +
      '<p class="pl-fiche-human">' +
      glossHtml(p.hundred) +
      "</p>" +
      '<p class="pl-fiche-now">' +
      glossHtml(p.now) +
      "</p>" +
      (flag && flag.tip ? '<p class="pl-fiche-tip">' + escapeHtml(flag.tip) + "</p>" : "") +
      '<p><a href="' +
      escapeHtml(p.shop) +
      '" rel="noopener">Abrir a loja</a></p>';
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

  function revealOpsNotes() {
    const ops = document.getElementById("pl-ops");
    if (!ops) return;
    let edit = false;
    try {
      edit = new URLSearchParams(window.location.search).get("edit") === "1";
    } catch (err) {
      edit = false;
    }
    if (edit) ops.hidden = false;
  }

  function syncLgpdPadding() {
    const banner = document.getElementById("lgpd-banner");
    if (!banner) return;
    const open = window.getComputedStyle(banner).display !== "none";
    document.body.classList.toggle("pl-lgpd-open", open);
  }

  const avg = Math.round(
    data.PRODUCTS.reduce(function (s, p) {
      return s + lastPct(p);
    }, 0) / data.PRODUCTS.length
  );
  const doneN = data.PRODUCTS.filter(function (p) {
    return lastPct(p) >= 100 || p.state === "done";
  }).length;
  const riskN = data.PRODUCTS.filter(function (p) {
    return p.state === "risk";
  }).length;
  const watchN = data.PRODUCTS.filter(function (p) {
    return p.state === "watch";
  }).length;

  setText("pl-asof", data.AS_OF_LABEL);
  setText("pl-horizon", data.HORIZON);
  setText("pl-avg", avg + "%");
  setText("pl-done", doneN + "/11");
  setText("pl-alerts", riskN + " em risco · " + watchN + " em atenção");
  setText("pl-note", data.NOTE);
  setText("pl-preview-hist", data.PRODUCTS.length + " produtos");

  const exec = data.EXEC;
  if (exec && exec.owner) {
    setText("pl-owner", exec.owner.who + " · " + exec.owner.period);
  }
  if (exec && exec.ownerNext) {
    setText("pl-preview-cron", exec.ownerNext.who + " · " + exec.ownerNext.period);
  }

  renderNext();
  renderFlags();
  renderTowers();
  bindTowers();

  const years = document.getElementById("pl-years");
  if (years) years.innerHTML = data.YEARS.map(yearMeter).join("");

  const yearNotes = document.getElementById("pl-year-notes");
  if (yearNotes) {
    yearNotes.innerHTML = data.YEARS.map(function (y) {
      return "<li>" + glossHtml(y.label + " — " + y.note) + "</li>";
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
    setText("pl-preview-fund", fund.currency + " " + fund.monthly + "/mês · " + fund.fromLabel + "→" + fund.toLabel);
    setText("pl-fund-verdict", fund.verdict);
    setHtml("pl-fund-paid", glossHtml(fund.paidNote));
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
            glossHtml(row.item) +
            "</td><td>" +
            glossHtml(row.spend) +
            "</td></tr>"
          );
        })
        .join("");
    }

    const queue = document.getElementById("pl-fund-queue");
    if (queue) {
      queue.innerHTML = fund.queue
        .map(function (row) {
          return "<tr><td>" + escapeHtml(row.period) + "</td><td>" + glossHtml(row.owner) + "</td></tr>";
        })
        .join("");
    }

    const notIn = document.getElementById("pl-fund-notin");
    if (notIn) {
      notIn.innerHTML = fund.notInEnvelope
        .map(function (item) {
          return '<span class="pl-chip">' + glossHtml(item) + "</span>";
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
      rules.innerHTML = chips
        .map(function (c) {
          return '<span class="pl-chip">' + escapeHtml(c) + "</span>";
        })
        .join("");
      setText("pl-preview-rules", "1 produto pesado/ciclo · cota não acumula");
    }
  }

  revealOpsNotes();
  syncLgpdPadding();
  const lgpdBanner = document.getElementById("lgpd-banner");
  if (lgpdBanner && window.MutationObserver) {
    new MutationObserver(syncLgpdPadding).observe(lgpdBanner, {
      attributes: true,
      attributeFilter: ["style", "class", "hidden"],
    });
  }

  function openHashTarget(hash) {
    if (!hash || hash === "#") return;
    var target;
    try {
      target = document.querySelector(hash);
    } catch (err) {
      return;
    }
    if (!target) return;
    if (target.tagName === "DETAILS") target.open = true;
    if (target.scrollIntoView) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function hashFromHref(href) {
    var i = href.indexOf("#");
    return i === -1 ? "" : href.slice(i);
  }

  function isPlanningPath(path) {
    return !path || path === location.pathname || /(^|\/)planning\.html$/.test(path);
  }

  openHashTarget(location.hash);

  window.addEventListener("hashchange", function () {
    openHashTarget(location.hash);
  });

  document.addEventListener("click", function (ev) {
    var a = ev.target.closest("a[href]");
    if (!a) return;
    var href = a.getAttribute("href") || "";
    var hash = hashFromHref(href);
    if (hash.length < 2) return;
    var path = href.slice(0, href.indexOf("#"));
    if (!isPlanningPath(path)) return;
    openHashTarget(hash);
  });
})();
