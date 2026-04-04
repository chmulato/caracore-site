/**
 * Scripts compartilhados das páginas em web/
 * Uso: incluir em páginas que precisem de interação (ex.: laboratorio_campo_largo, portal).
 */
(function () {
    'use strict';

    // Typing effect para "Nível 0: Iniciando o Sistema"
    var titleEl = document.getElementById('nivel0-typing');
    if (titleEl) {
        var text = 'Nível 0: Iniciando o Sistema';
        var i = 0;
        var speed = 80;
        function type() {
            if (i < text.length) {
                titleEl.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                setTimeout(function () {
                    var cursor = titleEl.nextElementSibling;
                    if (cursor && cursor.classList.contains('typing-cursor')) {
                        cursor.style.display = 'none';
                    }
                }, 400);
            }
        }
        // Iniciar quando a seção entrar em vista (opcional: delay inicial)
        setTimeout(type, 400);
    }

    // Skill Tree: persistência em localStorage + barra de progresso + cards concluídos
    var STORAGE_KEY = 'ouro40-skill-tree';
    var TOTAL_SKILLS = 9;

    function getStoredSkills() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    function saveSkills(state) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {}
    }

    function updateSkillTreeUI() {
        var bar = document.getElementById('skill-progress-bar');
        var label = document.getElementById('skill-progress-label');
        var checkboxes = document.querySelectorAll('.skill-tree .skill-checkbox');
        if (!checkboxes.length) return;

        var checked = 0;
        checkboxes.forEach(function (cb) {
            if (cb.checked) checked++;
        });

        var pct = Math.round((checked / TOTAL_SKILLS) * 100);
        if (bar) bar.style.width = pct + '%';
        if (label) label.textContent = checked + ' / ' + TOTAL_SKILLS;

        [1, 2, 3].forEach(function (level) {
            var card = document.getElementById('skill-card-' + level);
            if (!card) return;
            var levelChecks = document.querySelectorAll('#skill-card-' + level + ' .skill-checkbox');
            var allChecked = levelChecks.length && Array.prototype.every.call(levelChecks, function (c) { return c.checked; });
            card.classList.toggle('completed', !!allChecked);
        });
    }

    function bindSkillTree() {
        var checkboxes = document.querySelectorAll('.skill-tree .skill-checkbox');
        if (!checkboxes.length) return;

        var state = getStoredSkills();
        checkboxes.forEach(function (cb) {
            var id = cb.getAttribute('data-skill') || cb.id;
            if (state[id]) cb.checked = true;
            cb.addEventListener('change', function () {
                var st = {};
                document.querySelectorAll('.skill-tree .skill-checkbox').forEach(function (c) {
                    st[c.getAttribute('data-skill') || c.id] = c.checked;
                });
                saveSkills(st);
                updateSkillTreeUI();
            });
        });
        updateSkillTreeUI();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindSkillTree);
    } else {
        bindSkillTree();
    }
})();
