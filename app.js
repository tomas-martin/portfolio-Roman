/* ============================================
   ROMÁN ZUÑIGA — app.js compartido
   Navbar + Reveal Observer + Hamburger
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ── Marca la página activa en el nav ──
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === path || (path === '' && href === 'index.html') || (path === 'index.html' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    // ── Navbar scroll ─────────────────────────────
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 40);
        }, { passive: true });
    }

    // ── Hamburger ─────────────────────────────────
    const btn = document.getElementById('hamburgerBtn');
    const menu = document.getElementById('mobileMenu');
    if (btn && menu) {
        btn.addEventListener('click', () => {
            const open = menu.classList.toggle('open');
            btn.classList.toggle('open', open);
            btn.setAttribute('aria-expanded', open);
        });
        menu.querySelectorAll('.mobile-link').forEach(l => {
            l.addEventListener('click', () => {
                menu.classList.remove('open');
                btn.classList.remove('open');
            });
        });
    }

    // ── Scroll suave ─────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = document.querySelector(a.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const navH = 68;
                window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH - 16, behavior: 'smooth' });
            }
        });
    });

    // ── Intersection Observer: reveal ──────────────
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
        revealEls.forEach(el => obs.observe(el));
    }

    // ── CountUp ───────────────────────────────────
    function countUp(el, end, dur) {
        const isYear = end > 999;
        const start = isYear ? end - 30 : 0;
        const t0 = performance.now();
        const ease = t => 1 - Math.pow(2, -10 * t);
        const step = now => {
            const p = Math.min((now - t0) / (dur * 1000), 1);
            el.textContent = Math.round(start + (end - start) * ease(p));
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = end;
        };
        requestAnimationFrame(step);
    }

    const numEls = document.querySelectorAll('[data-count]');
    if (numEls.length) {
        const cObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    countUp(entry.target, parseInt(entry.target.dataset.count, 10), 2);
                    cObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        numEls.forEach(el => cObs.observe(el));
    }

    // ── Edad dinámica ─────────────────────────────
    const ageEl = document.getElementById('playerAge');
    if (ageEl) {
        const birth = new Date('1999-07-01');
        const now = new Date();
        let age = now.getFullYear() - birth.getFullYear();
        const m = now.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
        ageEl.textContent = age;
    }

    // ── Video lazy (si existe en la página) ───────
    const vThumb = document.getElementById('videoThumb');

    if (vThumb) {
        vThumb.addEventListener('click', () => {

            const id = vThumb.dataset.videoid;

            const iframe = document.createElement('iframe');

            iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;

            iframe.title = 'Román Zuñiga | Pivot';

            iframe.allow =
                'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';

            iframe.referrerPolicy = "strict-origin-when-cross-origin";

            iframe.setAttribute('allowfullscreen', '');

            iframe.style.cssText =
                'width:100%;height:100%;border:none;display:block;';

            vThumb.replaceWith(iframe);
        });
    }

    // ── Carrusel (si existe) ───────────────────────
    const track = document.getElementById('carouselTrack');
    if (track) {
        const slides = track.querySelectorAll('.c-slide');
        const total = slides.length;
        let current = 0;
        const dots = document.getElementById('carouselDots');

        if (dots) {
            slides.forEach((_, i) => {
                const d = document.createElement('button');
                d.className = 'c-dot' + (i === 0 ? ' active' : '');
                d.setAttribute('aria-label', `Imagen ${i + 1}`);
                d.addEventListener('click', () => goTo(i));
                dots.appendChild(d);
            });
        }

        const updateDots = () => {
            if (!dots) return;
            dots.querySelectorAll('.c-dot').forEach((d, i) =>
                d.classList.toggle('active', i === current));
        };

        const goTo = i => {
            current = (i + total) % total;
            track.scrollTo({ left: current * track.offsetWidth, behavior: 'smooth' });
            updateDots();
        };

        document.getElementById('prevBtn')?.addEventListener('click', () => goTo(current - 1));
        document.getElementById('nextBtn')?.addEventListener('click', () => goTo(current + 1));

        let st;
        track.addEventListener('scroll', () => {
            clearTimeout(st);
            st = setTimeout(() => {
                const w = track.offsetWidth;
                if (w) { current = Math.round(track.scrollLeft / w); updateDots(); }
            }, 50);
        }, { passive: true });

        // drag
        let dragging = false, sx = 0, ss = 0;
        track.addEventListener('mousedown', e => { dragging = true; sx = e.pageX; ss = track.scrollLeft; track.style.cursor = 'grabbing'; });
        document.addEventListener('mouseup', () => { if (dragging) { dragging = false; track.style.cursor = 'grab'; } });
        document.addEventListener('mousemove', e => { if (dragging) { e.preventDefault(); track.scrollLeft = ss - (e.pageX - sx); } });

        // touch
        let tx = 0;
        track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
        track.addEventListener('touchend', e => {
            const d = tx - e.changedTouches[0].clientX;
            if (Math.abs(d) > 50) goTo(current + (d > 0 ? 1 : -1));
        }, { passive: true });
    }

    // ── Parallax hero (si existe) ─────────────────
    const heroSec = document.querySelector('.hero');
    const hImg1 = document.querySelector('.h-img-1');
    const hImg2 = document.querySelector('.h-img-2');
    const hText = document.querySelector('.hero-text');
    if (heroSec && (hImg1 || hImg2)) {
        window.addEventListener('mousemove', e => {
            const { offsetWidth: w, offsetHeight: h } = heroSec;
            const mx = (e.clientX / w - 0.5) * 2;
            const gy = (e.clientY / h - 0.5) * 2;
            if (hText) hText.style.transform = `translate(${mx * -12}px, ${gy * -8}px)`;
            if (hImg1) hImg1.style.transform = `translate(${mx * 20}px, ${gy * 12}px) rotateY(${mx * 12}deg) rotateX(${-gy * 8}deg)`;
            if (hImg2) hImg2.style.transform = `translate(${mx * 10}px, ${gy * 7}px) rotateY(${mx * 7}deg) rotateX(${-gy * 4}deg)`;
        }, { passive: true });
    }
});
