/* ============================================
   ROMÁN ZUÑIGA — PORTFOLIO APP.JS
   Navegación, Carrusel, Animaciones
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ── Edad dinámica ──────────────────────────────
    const birthDate = new Date('1999-07-01');
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    const ageEl = document.getElementById('playerAge');
    if (ageEl) ageEl.textContent = age;

    // ── Navbar scroll ─────────────────────────────
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });

    // ── Menú hamburguesa ──────────────────────────
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.toggle('open');
            hamburgerBtn.classList.toggle('open', isOpen);
            hamburgerBtn.setAttribute('aria-expanded', isOpen);
        });

        // Cerrar al hacer click en link
        mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                hamburgerBtn.classList.remove('open');
            });
        });
    }

    // ── Scroll suave para nav links ───────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const navH = navbar ? navbar.offsetHeight : 72;
                const top = target.getBoundingClientRect().top + window.scrollY - navH;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ── Intersection Observer (fade-in) ───────────
    const fadeEls = document.querySelectorAll('.fade-in');
    if (fadeEls.length) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        fadeEls.forEach(el => observer.observe(el));
    }

    // ── Carrusel ──────────────────────────────────
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsContainer = document.getElementById('carouselDots');

    if (track) {
        const slides = track.querySelectorAll('.carousel-slide');
        const total = slides.length;
        let current = 0;

        // Crear dots
        if (dotsContainer) {
            slides.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('aria-label', `Slide ${i + 1}`);
                dot.addEventListener('click', () => goTo(i));
                dotsContainer.appendChild(dot);
            });
        }

        const updateDots = () => {
            if (!dotsContainer) return;
            dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
                d.classList.toggle('active', i === current);
            });
        };

        const goTo = (index) => {
            current = (index + total) % total;
            const slideWidth = track.offsetWidth;
            track.scrollTo({ left: current * slideWidth, behavior: 'smooth' });
            updateDots();
        };

        if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

        // Sincronizar dots con scroll
        let scrollTimeout;
        track.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const slideWidth = track.offsetWidth;
                if (slideWidth > 0) {
                    current = Math.round(track.scrollLeft / slideWidth);
                    updateDots();
                }
            }, 50);
        }, { passive: true });

        // Drag para desktop
        let isDragging = false;
        let startX = 0;
        let startScroll = 0;

        track.addEventListener('mousedown', e => {
            isDragging = true;
            startX = e.pageX;
            startScroll = track.scrollLeft;
            track.style.cursor = 'grabbing';
        });

        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            track.style.cursor = 'grab';
        });

        document.addEventListener('mousemove', e => {
            if (!isDragging) return;
            e.preventDefault();
            track.scrollLeft = startScroll - (e.pageX - startX);
        });

        // Swipe touch
        let touchStartX = 0;
        track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
        track.addEventListener('touchend', e => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
        }, { passive: true });

        // Autoplay opcional — comentado, descomentar si se desea
        // setInterval(() => goTo(current + 1), 5000);
    }

    // ── Parallax suave en hero ────────────────────
    const heroImg1 = document.querySelector('.hero-img-1');
    const heroImg2 = document.querySelector('.hero-img-2');
    const heroText = document.querySelector('.hero-text');

    window.addEventListener('mousemove', e => {
        const x = (e.clientX / window.innerWidth - 0.5) * 15;
        const y = (e.clientY / window.innerHeight - 0.5) * 10;

        if (heroText) heroText.style.transform = `translate(${x * -0.6}px, ${y * -0.6}px)`;
        if (heroImg1) heroImg1.style.transform = `translate(${x * 1.2}px, ${y * -1}px) rotateY(${x * 0.5}deg)`;
        if (heroImg2) heroImg2.style.transform = `translate(${x * 0.6}px, ${y * -0.5}px) rotateY(${x * 0.3}deg)`;
    });

});
