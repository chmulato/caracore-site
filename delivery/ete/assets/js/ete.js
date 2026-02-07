/**
 * ETE / Minerador 4.0 — Delivery (cara-core-site/delivery/ete)
 * Script compartilhado para páginas que utilizam assets/js (exceto laboratorio_campo_largo que usa main.js).
 */
(function () {
    'use strict';
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        var id = a.getAttribute('href');
        if (id === '#') return;
        var el = document.querySelector(id);
        if (el) {
            a.addEventListener('click', function (e) {
                e.preventDefault();
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
    });
})();
