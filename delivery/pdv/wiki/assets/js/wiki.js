/**
 * Wiki Estrutural CaraCore-PDV — Sidebar, busca e TOC
 * v1.0.13
 */
(function () {
  "use strict";

  const shell = document.getElementById("wikiShell");
  const openBtn = document.getElementById("wikiOpenSidebarBtn");
  const backdrop = document.getElementById("wikiBackdrop");

  function openSidebar() {
    if (shell) shell.classList.add("is-sidebar-open");
  }
  function closeSidebar() {
    if (shell) shell.classList.remove("is-sidebar-open");
  }

  if (openBtn) {
    openBtn.addEventListener("click", function () {
      if (shell && shell.classList.contains("is-sidebar-open")) closeSidebar();
      else openSidebar();
    });
  }
  if (backdrop) backdrop.addEventListener("click", closeSidebar);

  // Destaque do item ativo na sidebar (por data-wiki-page)
  const page = document.body.getAttribute("data-wiki-page");
  if (page) {
    document.querySelectorAll(".js-nav-item[data-page]").forEach(function (a) {
      if (a.getAttribute("data-page") === page) a.classList.add("is-active");
    });
  }

  // Busca na sidebar (filtra [data-search])
  const input = document.getElementById("wikiSearch");
  const searchable = document.querySelectorAll("[data-search]");
  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }
  function applyFilter(q) {
    const qq = norm(q).trim();
    searchable.forEach(function (el) {
      const hay = norm(el.getAttribute("data-search"));
      const show = !qq || hay.indexOf(qq) !== -1;
      el.classList.toggle("hidden", !show);
    });
  }
  if (input) {
    input.addEventListener("input", function () {
      applyFilter(input.value);
    });
  }

  // TOC dinâmico: preenche #wikiToc a partir de .wiki-main-content section[id]
  const tocEl = document.getElementById("wikiToc");
  const mainContent = document.querySelector(".wiki-main-content");
  if (tocEl && mainContent) {
    const sections = mainContent.querySelectorAll("section[id]");
    if (sections.length) {
      const nav = document.createElement("nav");
      nav.setAttribute("aria-label", "Nesta página");
      const title = document.createElement("div");
      title.className = "wiki-toc-title";
      title.textContent = "Nesta página";
      nav.appendChild(title);
      sections.forEach(function (sec) {
        const id = sec.getAttribute("id");
        const h2 = sec.querySelector("h2");
        const label = h2 ? h2.textContent.trim() : id;
        const a = document.createElement("a");
        a.href = "#" + id;
        a.className = "wiki-toc-link";
        a.textContent = label;
        a.setAttribute("data-toc-id", id);
        nav.appendChild(a);
      });
      tocEl.appendChild(nav);

      // IntersectionObserver: marca link ativo conforme a seção entra na viewport
      const links = tocEl.querySelectorAll(".wiki-toc-link");
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            const id = entry.target.getAttribute("id");
            links.forEach(function (link) {
              if (link.getAttribute("data-toc-id") === id) {
                link.classList.add("is-active");
              } else {
                link.classList.remove("is-active");
              }
            });
          });
        },
        { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
      );
      sections.forEach(function (sec) {
        observer.observe(sec);
      });
    }
  }
})();
