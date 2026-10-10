/**
 * Planning Cara Core — visão, projetos e roadmap.
 * Dados: window.CARACORE_PLANNING (planning-data.js).
 * A camada visual explica o jargão; não altera percentuais, datas nem flags.
 */
(function () {
  const data = window.CARACORE_PLANNING;
  if (!data) return;

  const STATE_LABEL = {
    risk: "risco",
    watch: "atenção",
    ok: "saudável",
    done: "concluído",
  };

  const STATE_ICON = {
    risk: "exclamation-octagon-fill",
    watch: "exclamation-triangle-fill",
    ok: "check-circle-fill",
    done: "patch-check-fill",
  };

  const STATE_COLOR = {
    risk: "#b42318",
    watch: "#b54708",
    ok: "#067647",
    done: "#175cd3",
  };

  const STATE_ORDER = { risk: 0, watch: 1, ok: 2, done: 3 };

  const BADGE_CLASS = { risk: "risco", watch: "watch", ok: "ok", done: "done" };

  const COUNT_PHRASE = {
    done: ["projeto concluído", "projetos concluídos"],
    ok: ["projeto saudável", "projetos saudáveis"],
    watch: ["projeto em atenção", "projetos em atenção"],
    risk: ["projeto em risco", "projetos em risco"],
  };

  const KIND_LABEL = {
    risco: "Risco",
    desvio: "Atenção",
  };

  const GLOSSARY = [
    ["v4.0.0-rc6", "Candidato da oficina. SHA-256 ainda não publicado. O download público continua a RC5."],
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

  function historyMonths() {
    const seen = [];
    data.PRODUCTS.forEach(function (p) {
      p.history.forEach(function (pt) {
        if (seen.indexOf(pt.m) === -1) seen.push(pt.m);
      });
    });
    seen.sort();
    return seen;
  }

  function pctAt(product, month) {
    const pt = product.history.find(function (h) {
      return h.m === month;
    });
    return pt ? pt.p : null;
  }

  function monthAverages() {
    return historyMonths().map(function (m) {
      const vals = data.PRODUCTS.map(function (p) {
        return pctAt(p, m);
      }).filter(function (v) {
        return v !== null;
      });
      const avg = vals.reduce(function (s, v) {
        return s + v;
      }, 0) / (vals.length || 1);
      return { m: m, avg: avg };
    });
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

  function icon(name) {
    return '<i class="bi bi-' + name + '" aria-hidden="true"></i>';
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
    const kind = BADGE_CLASS[state] || "ok";
    return (
      '<span class="pl-badge pl-badge-' +
      kind +
      '">' +
      icon(STATE_ICON[state] || "circle") +
      " " +
      STATE_LABEL[state] +
      "</span>"
    );
  }

  function kindBadge(kind) {
    const label = KIND_LABEL[kind] || kind;
    const cls = kind === "desvio" ? "desvio" : "risco";
    const glyph = kind === "desvio" ? "exclamation-triangle-fill" : "exclamation-octagon-fill";
    return '<span class="pl-badge pl-badge-' + cls + '">' + icon(glyph) + " " + escapeHtml(label) + "</span>";
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

  function countState(state) {
    return data.PRODUCTS.filter(function (p) {
      return (p.state || "ok") === state;
    }).length;
  }

  function phrase(state, n) {
    const pair = COUNT_PHRASE[state];
    return pair[n === 1 ? 0 : 1];
  }

  function nextDelivery(product) {
    const src = String(product.hundred || "").trim();
    if ((product.state || "ok") === "done") return src;
    const parts = src.split(/\.\s+/).filter(Boolean);
    const dated = parts.find(function (s) {
      return /\d{2}\/\d{2}\/\d{4}|20\d{2}/.test(s);
    });
    const chosen = dated || parts[0] || src;
    return /[.!?]$/.test(chosen) ? chosen : chosen + ".";
  }

  function deliveryCaption(product) {
    return (product.state || "ok") === "done" ? "Compromisso" : "Próxima entrega";
  }

  function gateHtml(next) {
    if (!next || !next.gate) return "";
    const tip = next.gate === "T032" ? "Gate interno do roteiro operacional." : "Detalhe interno deste marco.";
    return ' · <abbr title="' + escapeHtml(tip) + '">' + escapeHtml(next.gate) + "</abbr>";
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

  function sortedProducts() {
    return data.PRODUCTS.slice().sort(function (a, b) {
      const sa = Object.prototype.hasOwnProperty.call(STATE_ORDER, a.state) ? STATE_ORDER[a.state] : 2;
      const sb = Object.prototype.hasOwnProperty.call(STATE_ORDER, b.state) ? STATE_ORDER[b.state] : 2;
      if (sa !== sb) return sa - sb;
      if (!!a.core !== !!b.core) return a.core ? -1 : 1;
      return (a.n || 0) - (b.n || 0);
    });
  }

  function projectCardFace(p) {
    const pct = lastPct(p);
    const state = p.state || "ok";
    const role = p.core ? "Núcleo" : "Brinco";
    const delivery = nextDelivery(p);
    return (
      '<article class="pl-proj is-' +
      state +
      (p.core ? " is-core" : "") +
      '">' +
      '<div class="pl-proj-body">' +
      '<div class="pl-proj-top"><p class="pl-proj-role">' +
      role +
      "</p>" +
      badge(state) +
      "</div>" +
      '<div class="pl-proj-id"><h4 class="pl-proj-name">' +
      escapeHtml(p.name) +
      '</h4><p class="pl-proj-pct">' +
      pct +
      "%</p></div>" +
      '<div class="pl-track" style="--fill:' +
      pct +
      '%" aria-hidden="true"><span class="pl-fill"></span></div>' +
      '<dl class="pl-proj-meta"><div><dt>Atualizado</dt><dd>' +
      escapeHtml(data.AS_OF_LABEL) +
      "</dd></div><div><dt>" +
      escapeHtml(deliveryCaption(p)) +
      '</dt><dd title="' +
      escapeHtml(delivery) +
      '">' +
      glossHtml(delivery) +
      "</dd></div></dl></div>" +
      '<p class="pl-proj-actions">' +
      '<button type="button" class="pl-tower is-' +
      state +
      '" data-product="' +
      p.id +
      '" aria-pressed="false" aria-controls="pl-fiche" aria-label="Resumo de ' +
      escapeHtml(p.name) +
      '">Resumo</button>' +
      '<a class="pl-proj-more" href="#produto-' +
      p.id +
      '">Ver detalhe</a></p></article>'
    );
  }

  function projectGroup(label, items, hint) {
    if (!items.length) return "";
    const title = hint ? ' title="' + escapeHtml(hint) + '"' : "";
    return (
      '<section class="pl-proj-group" aria-label="' +
      escapeHtml(label) +
      '">' +
      "<h3 class=\"pl-tower-sep\"" +
      title +
      ">" +
      escapeHtml(label) +
      "</h3>" +
      '<div class="pl-proj-grid">' +
      items.map(projectCardFace).join("") +
      "</div></section>"
    );
  }

  function renderTowers() {
    const rows = document.getElementById("pl-tower-rows");
    if (!rows) return;
    const products = sortedProducts();
    const core = products.filter(function (p) {
      return p.core;
    });
    const other = products.filter(function (p) {
      return !p.core;
    });
    rows.innerHTML = projectGroup("Núcleo", core, "") + projectGroup("Brincos", other, "Não mandam na cota.");
  }

  function renderSummary(counts) {
    const el = document.getElementById("pl-summary");
    if (!el) return;
    const items = [
      ["done", counts.done],
      ["ok", counts.ok],
      ["watch", counts.watch],
      ["risk", counts.risk],
    ];
    const tiles = items
      .map(function (item) {
        const state = item[0];
        const n = item[1];
        return (
          '<div class="pl-sum is-' +
          state +
          '" role="listitem">' +
          icon(STATE_ICON[state]) +
          "<strong>" +
          n +
          "</strong><span>" +
          phrase(state, n) +
          "</span></div>"
        );
      })
      .join("");
    const next = data.EXEC && data.EXEC.next;
    let nextTile = "";
    if (next) {
      nextTile =
        '<a class="pl-sum is-next" role="listitem" href="#anos">' +
        icon("calendar-event") +
        "<strong>" +
        escapeHtml(next.when) +
        "</strong><span>Próximo marco</span><span class=\"pl-sum-what\">" +
        glossHtml(next.what) +
        gateHtml(next) +
        "</span></a>";
    }
    el.innerHTML = tiles + nextTile;
  }

  function renderDoughnut(counts) {
    const el = document.getElementById("pl-doughnut");
    if (!el) return;
    const parts = [
      { state: "done", n: counts.done },
      { state: "ok", n: counts.ok },
      { state: "watch", n: counts.watch },
      { state: "risk", n: counts.risk },
    ];
    const total = parts.reduce(function (s, part) {
      return s + part.n;
    }, 0);
    const r = 36;
    const c = 2 * Math.PI * r;
    const gap = 3;
    let offset = 0;
    const arcs = parts
      .map(function (part) {
        if (!part.n || !total) return "";
        const raw = (part.n / total) * c;
        const len = Math.max(raw - gap, 1);
        const circle =
          '<circle cx="60" cy="60" r="36" fill="none" stroke="' +
          STATE_COLOR[part.state] +
          '" stroke-width="14" stroke-linecap="butt" stroke-dasharray="' +
          len.toFixed(2) +
          " " +
          (c - len).toFixed(2) +
          '" stroke-dashoffset="' +
          (-offset).toFixed(2) +
          '" transform="rotate(-90 60 60)"/>';
        offset += raw;
        return circle;
      })
      .join("");
    const legend = parts
      .map(function (part) {
        return (
          '<li class="is-' +
          part.state +
          '">' +
          icon(STATE_ICON[part.state]) +
          "<strong>" +
          part.n +
          "</strong> " +
          phrase(part.state, part.n) +
          "</li>"
        );
      })
      .join("");
    el.innerHTML =
      '<figcaption>Projetos por estado</figcaption>' +
      '<div class="pl-donut"><svg viewBox="0 0 120 120" aria-hidden="true">' +
      '<circle cx="60" cy="60" r="36" fill="none" stroke="#e9ecef" stroke-width="14"/>' +
      arcs +
      '<text x="60" y="58" text-anchor="middle" font-size="22" font-weight="700" fill="#212529">' +
      total +
      '</text><text x="60" y="74" text-anchor="middle" font-size="9" fill="#6c757d">projetos</text></svg>' +
      '<ul class="pl-donut-legend">' +
      legend +
      "</ul></div>";
  }

  function renderTrend() {
    const el = document.getElementById("pl-trend");
    if (!el) return;
    const series = monthAverages();
    if (!series.length) return;
    const w = 360;
    const h = 148;
    const padL = 36;
    const padR = 28;
    const padT = 18;
    const padB = 24;
    const innerW = w - padL - padR;
    const innerH = h - padT - padB;
    const n = Math.max(series.length - 1, 1);
    const pts = series.map(function (pt, i) {
      return {
        m: pt.m,
        avg: pt.avg,
        x: padL + (i / n) * innerW,
        y: padT + (1 - pt.avg / 100) * innerH,
      };
    });
    const poly = pts
      .map(function (p) {
        return p.x.toFixed(1) + "," + p.y.toFixed(1);
      })
      .join(" ");
    const area =
      pts[0].x.toFixed(1) +
      "," +
      (padT + innerH).toFixed(1) +
      " " +
      poly +
      " " +
      pts[pts.length - 1].x.toFixed(1) +
      "," +
      (padT + innerH).toFixed(1);
    const grids = [0, 50, 100]
      .map(function (v) {
        const y = padT + (1 - v / 100) * innerH;
        return (
          '<line x1="' +
          padL +
          '" y1="' +
          y.toFixed(1) +
          '" x2="' +
          (padL + innerW) +
          '" y2="' +
          y.toFixed(1) +
          '" stroke="#e9ecef"/>' +
          '<text x="0" y="' +
          (y + 3).toFixed(1) +
          '" font-size="10" fill="#6c757d">' +
          v +
          "</text>"
        );
      })
      .join("");
    const dots = pts
      .map(function (p, i) {
        const label = Math.round(p.avg);
        const anchor = i === 0 ? "start" : i === pts.length - 1 ? "end" : "middle";
        return (
          '<circle cx="' +
          p.x.toFixed(1) +
          '" cy="' +
          p.y.toFixed(1) +
          '" r="3.5" fill="#175cd3"/>' +
          '<text x="' +
          p.x.toFixed(1) +
          '" y="' +
          (p.y - 8).toFixed(1) +
          '" text-anchor="' +
          anchor +
          '" font-size="10" font-weight="700" fill="#212529">' +
          label +
          "</text>" +
          '<text x="' +
          p.x.toFixed(1) +
          '" y="' +
          (h - 6) +
          '" text-anchor="' +
          anchor +
          '" font-size="10" fill="#6c757d">' +
          fmtMonth(p.m) +
          "</text>"
        );
      })
      .join("");
    const caption = pts
      .map(function (p) {
        return fmtMonth(p.m) + " " + Math.round(p.avg) + "%";
      })
      .join(" · ");
    el.innerHTML =
      "<figcaption>Evolução do progresso médio</figcaption>" +
      '<svg viewBox="0 0 ' +
      w +
      " " +
      h +
      '" role="img" aria-label="Média das 11 torres: ' +
      escapeHtml(caption) +
      '">' +
      grids +
      '<polygon points="' +
      area +
      '" fill="#175cd3" opacity="0.08"/>' +
      '<polyline points="' +
      poly +
      '" fill="none" stroke="#175cd3" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>' +
      dots +
      "</svg>" +
      '<p class="pl-chart-fallback">Média das 11 torres · ' +
      escapeHtml(caption) +
      "</p>";
  }

  function renderHeatmap() {
    const el = document.getElementById("pl-heatmap");
    if (!el) return;
    const months = historyMonths();
    const head = months
      .map(function (m, i) {
        const latest = i === months.length - 1;
        return (
          '<th scope="col"' +
          (latest ? ' class="is-latest"' : "") +
          ">" +
          fmtMonth(m) +
          (latest ? " · hoje" : "") +
          "</th>"
        );
      })
      .join("");
    const body = sortedProducts()
      .map(function (p) {
        const state = p.state || "ok";
        const cells = months
          .map(function (m, i) {
            const val = pctAt(p, m);
            const heat = val === null ? 0 : (val / 100).toFixed(3);
            const text = val === null ? "—" : String(val);
            const latest = i === months.length - 1 ? " is-latest" : "";
            return (
              '<td class="' +
              latest.trim() +
              '" style="--heat:' +
              heat +
              '" title="' +
              escapeHtml(p.name + " · " + fmtMonth(m) + " · " + text + (val === null ? "" : "%")) +
              '">' +
              text +
              "</td>"
            );
          })
          .join("");
        return (
          '<tr class="is-' +
          state +
          '"><th scope="row"><span class="pl-heat-name">' +
          icon(STATE_ICON[state]) +
          escapeHtml(p.name) +
          '<span class="pl-heat-state">' +
          STATE_LABEL[state] +
          "</span></span></th>" +
          cells +
          "</tr>"
        );
      })
      .join("");
    el.innerHTML =
      "<figcaption>Percentual mês a mês</figcaption>" +
      '<div class="pl-heat-wrap"><table class="pl-heat">' +
      "<caption>A intensidade da célula acompanha o percentual daquele mês. O ícone da linha é o estado de hoje.</caption>" +
      "<thead><tr><th scope=\"col\">Projeto</th>" +
      head +
      "</tr></thead><tbody>" +
      body +
      "</tbody></table></div>";
  }

  function renderTimeline() {
    const el = document.getElementById("pl-timeline");
    const fund = data.FUNDING;
    if (!el || !fund || !fund.queue) return;
    const ownerPeriod = data.EXEC && data.EXEC.owner && data.EXEC.owner.period;
    const nextPeriod = data.EXEC && data.EXEC.ownerNext && data.EXEC.ownerNext.period;
    const nowIdx = fund.queue.findIndex(function (row) {
      return row.period === ownerPeriod;
    });
    const next = data.EXEC && data.EXEC.next;
    el.innerHTML = fund.queue
      .map(function (row, i) {
        let cls = "pl-tl";
        let tag = "Previsto";
        if (i === nowIdx) {
          cls += " is-now";
          tag = "Agora";
        } else if (row.period === nextPeriod) {
          cls += " is-next";
          tag = "Seguinte";
        } else if (nowIdx !== -1 && i < nowIdx) {
          cls += " is-past";
          tag = "Feito";
        }
        const note =
          i === nowIdx && next
            ? '<span class="pl-tl-note">' + escapeHtml(next.when) + " · " + glossHtml(next.what) + gateHtml(next) + "</span>"
            : "";
        return (
          '<li class="' +
          cls +
          '"><span class="pl-tl-tag">' +
          tag +
          '</span><span class="pl-tl-when">' +
          escapeHtml(row.period) +
          "</span><strong>" +
          glossHtml(row.owner) +
          "</strong>" +
          note +
          "</li>"
        );
      })
      .join("");
  }

  function productCard(p) {
    const pct = lastPct(p);
    const state = p.state || "ok";
    const months = p.history
      .map(function (pt) {
        return "<li><span>" + fmtMonth(pt.m) + "</span><strong>" + pt.p + "%</strong></li>";
      })
      .join("");
    const role = p.core ? "Núcleo" : "Brinco";
    return (
      '<article class="pl-card is-' +
      state +
      '" id="produto-' +
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
      badge(state) +
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
    const next = data.EXEC && data.EXEC.next;
    const meta = document.getElementById("pl-skyline-meta");
    if (meta && next) {
      meta.textContent = "Próximo marco · " + next.when + " · " + next.what;
    }
    const el = document.getElementById("pl-next");
    if (!el || !next) return;
    let gate = "";
    if (next.gate) {
      const tip = next.gate === "T032" ? "Gate interno do roteiro operacional." : "Detalhe interno deste marco.";
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
    const title = document.getElementById("pl-flags-title");
    if (!el) return;
    const flags = (data.EXEC && data.EXEC.flags) || [];
    if (title) title.hidden = !flags.length;
    if (!flags.length) {
      el.innerHTML = '<p class="pl-empty">Nenhum ponto fora do ritmo.</p>';
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
    box.className = "pl-fiche is-" + state;
    const trigger = document.querySelector('.pl-tower[data-product="' + id + '"]');
    const card = trigger && trigger.closest(".pl-proj");
    if (card && card.parentNode) card.parentNode.appendChild(box);
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
      '<p class="pl-fiche-links"><a href="#produto-' +
      p.id +
      '">Histórico mensal</a> · <a href="' +
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
      const box = document.getElementById("pl-fiche");
      if (box && box.scrollIntoView) {
        box.scrollIntoView({ behavior: motion(), block: "nearest" });
      }
    });
  }

  function motion() {
    try {
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "auto";
    } catch (err) {
      return "smooth";
    }
    return "smooth";
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

  const counts = {
    done: countState("done"),
    ok: countState("ok"),
    watch: countState("watch"),
    risk: countState("risk"),
  };

  setText("pl-asof", data.AS_OF_LABEL);
  setText("pl-count", String(data.PRODUCTS.length));
  setText("pl-note", data.NOTE);
  setText("pl-preview-hist", data.PRODUCTS.length + " produtos");

  const asofEl = document.getElementById("pl-asof");
  if (asofEl && data.AS_OF_LABEL) {
    const parts = String(data.AS_OF_LABEL).match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (parts) asofEl.setAttribute("datetime", parts[3] + "-" + parts[2] + "-" + parts[1]);
  }

  const exec = data.EXEC;
  if (exec && exec.owner) {
    setText("pl-roadmap-now", "Em curso · " + exec.owner.who + " · " + exec.owner.period);
  }
  if (exec && exec.ownerNext) {
    setText("pl-preview-cron", "Em seguida · " + exec.ownerNext.who + " · " + exec.ownerNext.period);
  }

  renderSummary(counts);
  renderDoughnut(counts);
  renderTrend();
  renderFlags();
  renderNext();
  renderTowers();
  bindTowers();
  renderHeatmap();
  renderTimeline();

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
    var fold = target.closest("details");
    if (fold) fold.open = true;
    if (target.tagName === "DETAILS") target.open = true;
    if (target.classList && target.classList.contains("pl-card")) {
      document.querySelectorAll(".pl-card").forEach(function (c) {
        c.classList.toggle("is-open", c === target);
      });
    }
    if (target.scrollIntoView) {
      target.scrollIntoView({ behavior: motion(), block: "start" });
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
