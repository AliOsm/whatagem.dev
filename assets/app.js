    const gems = window.GEMS || [];

    const areaOrder = [
      "HTTP and runtime", "Data and persistence", "Jobs and scheduling", "Architecture and design",
      "State and workflow", "Controllers and input", "Presentation and JSON", "Views and frontend",
      "Authorization and notification", "Media and realtime", "AI and agents",
      "Configuration and infrastructure", "Testing and quality"
    ];
    const areaMeta = {
      "HTTP and runtime": { accent: "#6f7636", blurb: "The request's front door — web servers and the Rack interface." },
      "Data and persistence": { accent: "#a3170f", blurb: "Models, the database, and everything that outlives a request." },
      "Jobs and scheduling": { accent: "#b5651d", blurb: "Work pushed outside the request cycle." },
      "Architecture and design": { accent: "#b0161a", blurb: "Service objects, events, and dependency boundaries." },
      "State and workflow": { accent: "#7a6420", blurb: "Modeling lifecycles and state transitions." },
      "Controllers and input": { accent: "#216383", blurb: "Turning params into safe, scoped queries." },
      "Presentation and JSON": { accent: "#9c2b6d", blurb: "Presenters and serializers at the view boundary." },
      "Views and frontend": { accent: "#8a4a86", blurb: "Component-based HTML and template abstractions." },
      "Authorization and notification": { accent: "#b07d10", blurb: "Who may act — and who gets told." },
      "Media and realtime": { accent: "#1f7a72", blurb: "Files, images, and streaming." },
      "AI and agents": { accent: "#6f57b0", blurb: "LLMs, embeddings, agents, and MCP inside Rails." },
      "Configuration and infrastructure": { accent: "#2a7a55", blurb: "Config objects, env, and observability." },
      "Testing and quality": { accent: "#3060a0", blurb: "Benchmarks, linters, and test tooling." }
    };

    let currentArea = "All";
    let currentKind = "All";
    let firstRender = true;
    let lastCount = null;

    const els = {
      layers: document.getElementById("layers"),
      chips: document.getElementById("chips"),
      search: document.getElementById("search"),
      empty: document.getElementById("empty"),
      emptyQ: document.getElementById("emptyQ"),
      resultCount: document.getElementById("resultCount"),
      legend: document.getElementById("legend")
    };

    function escapeHtml(v) {
      return String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
    }

    const KW = "def|end|do|class|module|if|elsif|else|unless|case|when|in|while|until|return|yield|self|nil|true|false|and|or|not|then|begin|rescue|ensure|next|break|require|require_relative";
    const rubyRe = new RegExp(
      "(#[^\\n]*)" +
      "|(\"(?:\\\\.|[^\"\\\\])*\"|'(?:\\\\.|[^'\\\\])*')" +
      "|((?<!:):[A-Za-z_]\\w*[?!]?)" +
      "|(@@?[A-Za-z_]\\w*)" +
      "|(?<=\\.)([a-z_]\\w*[?!]?)" +
      "|\\b(" + KW + ")\\b" +
      "|\\b([A-Z]\\w*)\\b" +
      "|\\b(\\d[\\d_]*(?:\\.\\d+)?)\\b",
      "g"
    );
    function highlightRuby(code) {
      let out = "", last = 0, m;
      rubyRe.lastIndex = 0;
      while ((m = rubyRe.exec(code))) {
        out += escapeHtml(code.slice(last, m.index));
        const t = escapeHtml(m[0]);
        const cls = m[1] ? "c-com" : m[2] ? "c-str" : m[3] ? "c-sym" : m[4] ? "c-ivar" : m[5] ? "c-fn" : m[6] ? "c-kw" : m[7] ? "c-const" : m[8] ? "c-num" : "";
        out += cls ? '<span class="' + cls + '">' + t + "</span>" : t;
        last = rubyRe.lastIndex;
      }
      out += escapeHtml(code.slice(last));
      return out;
    }

    function facetSvg(accent) {
      return '<svg class="c-facet" viewBox="0 0 100 100" aria-hidden="true">' +
        '<polygon points="28,14 72,14 90,40 50,44" fill="' + accent + '"/>' +
        '<polygon points="10,40 28,14 50,44" fill="' + accent + '" opacity="0.78"/>' +
        '<polygon points="90,40 72,14 50,44" fill="' + accent + '" opacity="0.62"/>' +
        '<polygon points="10,40 50,44 50,92" fill="' + accent + '" opacity="0.9"/>' +
        '<polygon points="90,40 50,44 50,92" fill="' + accent + '" opacity="0.5"/>' +
        '<polygon points="10,40 90,40 50,44" fill="#fff" opacity="0.28"/></svg>';
    }

    const linkSvg = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>';
    const clipboardSvg = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
    const checkSvg = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

    function matches(gem, query) {
      if (currentArea !== "All" && gem.area !== currentArea) return false;
      if (currentKind !== "All" && gem.kind !== currentKind) return false;
      if (!query) return true;
      const hay = [gem.name, gem.gem, gem.area, gem.kind, gem.chapter, "p. " + gem.pdfPage, gem.pdfPage, gem.description, gem.source].join(" ").toLowerCase();
      return query.split(/\s+/).every((tok) => hay.includes(tok));
    }

    function cardHtml(gem) {
      const accent = (areaMeta[gem.area] || {}).accent || "#b0161a";
      const install = 'gem "' + gem.gem + '"';
      const isCallout = gem.kind === "What a gem";
      const host = gem.source.replace(/^https?:\/\//, "").replace(/\/$/, "");
      return '<article class="card' + (firstRender ? " reveal" : "") + '" style="--accent:' + accent + '">' +
        '<div class="c-head">' +
          '<div class="badges">' +
            '<span class="badge badge-kind' + (isCallout ? " callout" : "") + '">' + (isCallout ? "What a gem" : "Inline pick") + '</span>' +
            '<span class="badge badge-area">' + escapeHtml(gem.area) + '</span>' +
          '</div>' +
          '<span class="c-ref">' + escapeHtml(gem.chapter) + ' <span class="pg">p.' + escapeHtml(gem.pdfPage) + '</span></span>' +
        '</div>' +
        '<div class="c-title">' + facetSvg(accent) + '<h3>' + escapeHtml(gem.name) + '</h3></div>' +
        '<p class="c-desc">' + escapeHtml(gem.description) + '</p>' +
        '<div class="c-code">' +
          '<div class="c-code-head"><code class="ch-gem">' + escapeHtml(install) + '</code>' +
            '<button class="copy" type="button" data-copy="' + escapeHtml(install) + '" aria-label="Copy Gemfile line for ' + escapeHtml(gem.gem) + '">' +
            '<span class="copy-ico">' + clipboardSvg + '</span><span class="copy-lbl">Copy</span></button></div>' +
          '<pre><code>' + highlightRuby(gem.example) + '</code></pre>' +
        '</div>' +
        '<div class="c-foot">' +
          '<a href="' + escapeHtml(gem.source) + '" target="_blank" rel="noopener">' + linkSvg + '<span class="host">' + escapeHtml(host) + '</span></a>' +
          '<span class="c-inst">bundle add ' + escapeHtml(gem.gem) + '</span>' +
        '</div>' +
      '</article>';
    }

    let io = null;
    function setupReveal() {
      if (!("IntersectionObserver" in window)) {
        document.querySelectorAll(".card.reveal").forEach((c) => c.classList.add("in"));
        return;
      }
      io = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            el.style.transitionDelay = Math.min(i * 45, 260) + "ms";
            el.classList.add("in");
            io.unobserve(el);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
      document.querySelectorAll(".card.reveal").forEach((c) => io.observe(c));
    }

    function render() {
      const query = els.search.value.trim().toLowerCase();
      let total = 0;
      let html = "";
      let idx = 0;
      for (const area of areaOrder) {
        const meta = areaMeta[area] || {};
        const list = gems.filter((g) => g.area === area && matches(g, query));
        idx++;
        if (list.length === 0) continue;
        total += list.length;
        const num = String(idx).padStart(2, "0");
        html += '<section class="layer" id="layer-' + idx + '" style="--accent:' + (meta.accent || "#b0161a") + '">' +
          '<div class="layer-head">' +
            '<span class="layer-index">L' + num + '</span>' +
            '<div class="layer-titles"><h2>' + escapeHtml(area) + '</h2><p>' + escapeHtml(meta.blurb || "") + '</p></div>' +
            '<span class="layer-count"><b>' + list.length + '</b> ' + (list.length === 1 ? "gem" : "gems") + '</span>' +
          '</div>' +
          '<div class="grid">' + list.map(cardHtml).join("") + '</div>' +
        '</section>';
      }
      els.layers.innerHTML = html;
      els.resultCount.innerHTML = "<b>" + total + "</b> " + (total === 1 ? "gem" : "gems");
      if (lastCount !== null && total !== lastCount) {
        els.resultCount.classList.remove("bump");
        void els.resultCount.offsetWidth; // reflow so the pop replays
        els.resultCount.classList.add("bump");
      }
      lastCount = total;
      els.empty.classList.toggle("show", total === 0);
      els.emptyQ.textContent = query ? '"' + query + '"' : "that filter";
      if (firstRender) { setupReveal(); firstRender = false; }
    }

    function renderChips() {
      let html = '<button class="chip" data-area="All" aria-pressed="true">All layers</button>';
      for (const area of areaOrder) {
        const meta = areaMeta[area] || {};
        const n = gems.filter((g) => g.area === area).length;
        if (!n) continue;
        html += '<button class="chip" data-area="' + escapeHtml(area) + '" style="--chip-accent:' + (meta.accent || "#b0161a") + '" aria-pressed="false"><span class="dot"></span>' + escapeHtml(area) + '</button>';
      }
      els.chips.innerHTML = html;
    }

    function renderLegend() {
      let html = "";
      for (const area of areaOrder) {
        const meta = areaMeta[area] || {};
        const n = gems.filter((g) => g.area === area).length;
        html += '<div><span class="dot" style="background:' + (meta.accent || "#b0161a") + '"></span>' + escapeHtml(area) + ' &nbsp;·&nbsp; ' + n + '</div>';
      }
      els.legend.innerHTML = html;
    }

    // Interactions
    els.search.addEventListener("input", render);

    els.chips.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-area]");
      if (!btn) return;
      currentArea = btn.dataset.area;
      els.chips.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c === btn)));
      render();
      if (currentArea !== "All") {
        const idx = areaOrder.indexOf(currentArea) + 1;
        const sec = document.getElementById("layer-" + idx);
        if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    document.querySelector(".segmented").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-kind]");
      if (!btn) return;
      currentKind = btn.dataset.kind;
      document.querySelectorAll(".segmented button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      render();
    });

    els.layers.addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-copy]");
      if (!btn || btn.dataset.copied === "true") return;
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
      } catch (err) { return; }
      const ico = btn.querySelector(".copy-ico");
      const lbl = btn.querySelector(".copy-lbl");
      const savedIco = ico ? ico.innerHTML : "";
      const savedLbl = lbl ? lbl.textContent : "Copy";
      if (ico) ico.innerHTML = checkSvg;
      if (lbl) lbl.textContent = "Copied";
      btn.dataset.copied = "true";
      setTimeout(() => {
        if (ico) ico.innerHTML = savedIco;
        if (lbl) lbl.textContent = savedLbl;
        delete btn.dataset.copied;
      }, 1500);
    });

    document.querySelector(".theme-toggle").addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("lrg-theme", next); } catch (e) {}
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== els.search) { e.preventDefault(); els.search.focus(); }
      else if (e.key === "Escape" && document.activeElement === els.search) { els.search.value = ""; render(); els.search.blur(); }
    });

    // Count-up stats + typed command
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function countUp(el) {
      const target = Number(el.dataset.count);
      if (reduceMotion) { el.textContent = target; return; }
      const start = performance.now(), dur = 900;
      function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    function typeCmd() {
      const el = document.getElementById("cmd");
      const text = "bundle exec what_a_gem --book layered_rails --layers";
      if (reduceMotion) { el.innerHTML = '<span class="prompt">$</span> ' + text; return; }
      let i = 0;
      el.innerHTML = '<span class="prompt">$</span> <span class="typed"></span><span class="cursor"></span>';
      const typed = el.querySelector(".typed");
      (function step() {
        if (i <= text.length) { typed.textContent = text.slice(0, i); i++; setTimeout(step, 26); }
      })();
    }

    // Keep every headline number in sync with the data.
    (function syncCounts() {
      const total = gems.length;
      const callouts = gems.filter((g) => g.kind === "What a gem").length;
      const layers = new Set(gems.map((g) => g.area)).size;
      const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
      const setCount = (id, v) => { const el = document.getElementById(id); if (el) el.dataset.count = v; };
      setText("mGems", total); setText("mLayers", layers);
      setCount("sTotal", total); setCount("sCallout", callouts); setCount("sInline", total - callouts); setCount("sAreas", layers);
      els.search.placeholder = "Search " + total + " gems — name, layer, chapter, page, or what it does…";
    })();

    renderChips();
    renderLegend();
    render();
    document.querySelectorAll("[data-count]").forEach(countUp);
    typeCmd();
