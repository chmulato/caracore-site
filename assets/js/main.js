/**
 * Cara Core Informática - Script Principal
 * A home não depende mais de comportamento próprio: os planos de sites
 * passaram a ter página fixa (sites.html). Aqui fica só o passeio do Gaspar
 * pelo convite da Central de Downloads.
 */

(function() {
  'use strict';

  var invite = document.querySelector('.gaspar-invite');
  var travel = document.querySelector('.gaspar-invite-travel');
  if (!invite || !travel || typeof travel.animate !== 'function') return;

  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches) return;

  var x = 0;
  var y = 0;
  var running = null;
  var waiting = null;
  var hovering = false;

  /* O banner de LGPD tem prioridade de empilhamento maior que o convite:
     enquanto ele estiver na tela, o Gaspar repousa logo acima dele. */
  function liftAboveBanner() {
    var banner = document.getElementById('lgpd-banner');
    var visible = banner && getComputedStyle(banner).display !== 'none';
    var lift = visible ? banner.getBoundingClientRect().height + 10 : 0;
    invite.style.setProperty('--gaspar-lift', lift + 'px');
  }

  liftAboveBanner();
  var alertBanner = document.getElementById('lgpd-banner');
  if (alertBanner && window.MutationObserver) {
    new MutationObserver(liftAboveBanner).observe(alertBanner, {
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }

  /* O personagem só anda pela margem direita: sobe até a barra do topo e,
     onde a coluna de conteúdo deixa folga, encosta um pouco para dentro. */
  function limits() {
    var box = invite.getBoundingClientRect();
    var nav = document.querySelector('.navbar.fixed-top');
    var ceiling = nav ? nav.getBoundingClientRect().bottom + 16 : 16;
    var room = box.top - ceiling;
    var up = Math.max(0, Math.min(window.innerHeight * 0.4, 320, room));
    var content = document.querySelector('main .container');
    var inward = 0;
    if (content) {
      var gap = document.documentElement.clientWidth - content.getBoundingClientRect().right - box.width - 24;
      inward = Math.max(0, Math.min(48, gap * 0.4));
    }
    return { up: up, inward: inward };
  }

  function schedule(delay) {
    clearTimeout(waiting);
    waiting = setTimeout(step, delay);
  }

  function step() {
    waiting = null;
    if (hovering || document.hidden) {
      schedule(900);
      return;
    }
    var room = limits();
    if (room.up < 60) {
      schedule(4000);
      return;
    }
    var targetY = -(room.up * (0.15 + Math.random() * 0.85));
    var targetX = room.inward ? -(Math.random() * room.inward) : 0;
    var dx = targetX - x;
    var dy = targetY - y;
    var duration = Math.min(9000, Math.max(2600, Math.sqrt(dx * dx + dy * dy) * 26));
    running = travel.animate(
      [
        { transform: 'translate3d(' + x + 'px,' + y + 'px,0)' },
        { transform: 'translate3d(' + targetX + 'px,' + targetY + 'px,0)' }
      ],
      { duration: duration, easing: 'cubic-bezier(.45,.05,.55,.95)', fill: 'forwards' }
    );
    x = targetX;
    y = targetY;
    running.finished.then(function() {
      running = null;
      schedule(1600 + Math.random() * 2400);
    }).catch(function() {});
  }

  function restart(delay) {
    clearTimeout(waiting);
    if (running) {
      running.cancel();
      running = null;
    }
    travel.style.transform = '';
    x = 0;
    y = 0;
    schedule(delay);
  }

  invite.addEventListener('mouseenter', function() {
    hovering = true;
    if (running) running.pause();
  });

  invite.addEventListener('mouseleave', function() {
    hovering = false;
    if (running) running.play();
  });

  invite.addEventListener('focusin', function() {
    hovering = true;
    if (running) running.pause();
  });

  invite.addEventListener('focusout', function() {
    hovering = false;
    if (running) running.play();
  });

  document.addEventListener('visibilitychange', function() {
    if (!running) return;
    if (document.hidden) running.pause();
    else running.play();
  });

  motion.addEventListener('change', function() {
    if (!motion.matches) return;
    clearTimeout(waiting);
    if (running) {
      running.cancel();
      running = null;
    }
  });

  var resizeTimer = null;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      liftAboveBanner();
      restart(window.innerWidth < 1280 ? 1200 : 600);
    }, 200);
  });

  schedule(900);
})();
