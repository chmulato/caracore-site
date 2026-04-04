/**
 * Circuito Python — Delivery (cara-core-site/delivery/circuito)
 */
'use strict';

(function () {
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
