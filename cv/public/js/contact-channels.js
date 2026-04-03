(function () {
    'use strict';

    function decodeContact(encoded) {
        try {
            return decodeURIComponent(escape(atob(encoded)));
        } catch (error) {
            return '';
        }
    }

    var CONTACTS = {
        whatsapp: decodeContact('NTU0MTk5OTA5Nzc5Nw=='),
        telegram: decodeContact('aHR0cHM6Ly90Lm1lLys1NTQxOTk5MDk3Nzk3')
    };

    function openWhatsApp() {
        var number = CONTACTS.whatsapp.replace(/\D/g, '');
        if (number) {
            window.open('https://wa.me/' + number, '_blank', 'noopener,noreferrer');
        }
    }

    function openTelegram() {
        var telegramUrl = CONTACTS.telegram;
        if (telegramUrl) {
            window.open(telegramUrl, '_blank', 'noopener,noreferrer');
        }
    }

    document.querySelectorAll('[data-contact-channel]').forEach(function (button) {
        button.addEventListener('click', function () {
            var channel = button.getAttribute('data-contact-channel');
            if (channel === 'whatsapp') {
                openWhatsApp();
            }
            if (channel === 'telegram') {
                openTelegram();
            }
        });
    });
})();
