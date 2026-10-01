(function () {
    'use strict';

    var header = document.querySelector('.site_header');
    var burger = document.querySelector('.burger');
    var nav = document.querySelector('.main_nav');
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('.main_nav a'));

    if (nav && !nav.id) { nav.id = 'main_nav'; }

    /* ---- Мобильное меню ---- */
    function closeMenu() {
        header.classList.remove('is_menu_open');
        if (burger) { burger.setAttribute('aria-expanded', 'false'); }
    }
    if (burger) {
        burger.addEventListener('click', function () {
            var open = header.classList.toggle('is_menu_open');
            burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }
    navLinks.forEach(function (link) {
        link.addEventListener('click', closeMenu);
    });

    /* ---- Тень шапки при скролле ---- */
    function onScroll() {
        header.classList.toggle('is_scrolled', window.scrollY > 10);
        if (header.classList.contains('is_menu_open')) { closeMenu(); }
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ---- Активный пункт навигации ---- */
    var sections = navLinks
        .map(function (link) {
            var id = link.getAttribute('href');
            return id && id.charAt(0) === '#' ? document.querySelector(id) : null;
        })
        .filter(Boolean);

    if ('IntersectionObserver' in window && sections.length) {
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) { return; }
                navLinks.forEach(function (link) {
                    link.classList.toggle('is_active', link.getAttribute('href') === '#' + entry.target.id);
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        sections.forEach(function (section) { spy.observe(section); });
    }

    /* ---- Появление блоков при скролле ---- */
    var revealTargets = document.querySelectorAll(
        '.section_head, .about_text, .about_media, .direction_card, .project_card, ' +
        '.advantage_card, .process_step, .contact_form, ' +
        '.form_intro, .contacts_info, .contacts_map, .metric'
    );
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!reduceMotion && 'IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is_visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

        revealTargets.forEach(function (el) {
            el.classList.add('reveal');
            revealObserver.observe(el);
        });
    }

    /* ---- Статическая форма заявки (до посадки на CF7) ---- */
    var form = document.querySelector('.contact_form');
    if (form) {
        var status = form.querySelector('.form_status');
        var fields = Array.prototype.slice.call(form.querySelectorAll('input[required], textarea[required]'));

        function validEmail(value) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var ok = true;

            fields.forEach(function (field) {
                var wrap = field.closest('.form_field');
                var value = field.value.trim();
                var bad = !value || (field.type === 'email' && !validEmail(value));
                if (wrap) { wrap.classList.toggle('is_invalid', bad); }
                if (bad) { ok = false; }
            });

            if (!ok) {
                if (status) {
                    status.textContent = 'Проверьте заполнение полей.';
                    status.className = 'form_status is_err';
                }
                return;
            }

            if (status) {
                status.textContent = 'Заявка отправлена. Свяжемся в рабочее время.';
                status.className = 'form_status is_ok';
            }
            form.reset();
        });

        fields.forEach(function (field) {
            field.addEventListener('input', function () {
                var wrap = field.closest('.form_field');
                if (wrap) { wrap.classList.remove('is_invalid'); }
            });
        });
    }

    /* ---- Слайдер проектов ---- */
    var slider = document.querySelector('.projects_slider');
    if (slider) {
        var track = slider.querySelector('.projects_track');
        var slides = Array.prototype.slice.call(track.querySelectorAll('.project_slide'));
        var dotsWrap = slider.querySelector('.slider_dots');
        var arrows = Array.prototype.slice.call(slider.querySelectorAll('.slider_arrow'));
        var dots = [];

        slides.forEach(function (_, i) {
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'slider_dot';
            dot.setAttribute('aria-label', 'Проект ' + (i + 1));
            dot.addEventListener('click', function () { goTo(i); });
            dotsWrap.appendChild(dot);
            dots.push(dot);
        });

        var index = 0;
        var lockUntil = 0;
        var snapTimer;

        function clamp(i) { return Math.max(0, Math.min(slides.length - 1, i)); }
        function render() {
            dots.forEach(function (dot, i) { dot.classList.toggle('is_active', i === index); });
            arrows.forEach(function (arrow) {
                var dir = parseInt(arrow.getAttribute('data-dir'), 10);
                arrow.disabled = dir < 0 ? index <= 0 : index >= slides.length - 1;
            });
        }
        function goTo(i) {
            index = clamp(i);
            lockUntil = Date.now() + 700;
            track.style.scrollSnapType = 'none';
            track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' });
            window.clearTimeout(snapTimer);
            snapTimer = window.setTimeout(function () { track.style.scrollSnapType = ''; }, 650);
            render();
        }

        arrows.forEach(function (arrow) {
            arrow.addEventListener('click', function () {
                goTo(index + parseInt(arrow.getAttribute('data-dir'), 10));
            });
        });

        var settle;
        track.addEventListener('scroll', function () {
            window.clearTimeout(settle);
            settle = window.setTimeout(function () {
                if (Date.now() < lockUntil || !track.clientWidth) { return; }
                var i = Math.round(track.scrollLeft / track.clientWidth);
                if (i !== index) { index = i; render(); }
            }, 120);
        }, { passive: true });
        window.addEventListener('resize', function () {
            track.scrollLeft = index * track.clientWidth;
            render();
        });
        render();
    }
})();
