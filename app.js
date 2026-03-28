/* ============================================
   ROMÁN ZUÑIGA — PORTFOLIO APP.JS
   Navegación, Carrusel, Animaciones
   + Efectos del original React:
     · Parallax 3D exacto (valores m*-15 / m*25 / m*10)
     · app-container loaded (fade-in al cargar imágenes)
     · CountUp animado en stat-cards y palmares-count
     · video-section is-visible observer
     · bio-card is-visible observer
     · contact-card is-visible + mouse glow
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

    // ── app-container loaded: fade-in cuando cargan las imágenes hero ──
    // Replica el Promise.all del componente React original
    const heroSection = document.querySelector('.hero');
    const heroImgs = Array.from(document.querySelectorAll('.hero-img'));

    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.8s ease-in-out';

    const preload = heroImgs.map(img => new Promise(res => {
        if (img.complete && img.naturalWidth) return res();
        img.onload  = res;
        img.onerror = res;
    }));

    Promise.all(preload).then(() => {
        setTimeout(() => {
            document.body.style.opacity = '1';
            if (heroSection) heroSection.classList.add('loaded');
        }, 300);
    });

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
        mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                hamburgerBtn.classList.remove('open');
            });
        });
    }

    // ── Scroll suave para nav links ───────────────
    // Usamos el nav-inner (altura fija 72px) para no incluir el menú móvil abierto
    const navInner = document.querySelector('.nav-inner');
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const href = anchor.getAttribute('href');
            const target = href && href !== '#' ? document.querySelector(href) : null;
            if (target) {
                e.preventDefault();
                const navH = navInner ? navInner.offsetHeight : 72;
                const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ── Intersection Observer (fade-in genérico) ──
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

    // ── bio-card is-visible (scroll reveal escalonado) ──
    const bioCards = document.querySelectorAll('.bio-card');
    if (bioCards.length) {
        const bioObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    bioObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        bioCards.forEach(el => bioObs.observe(el));
    }

    // ── CountUp: anima números desde 0 al entrar en viewport ──
    // Replica el componente CountUp + useInView(triggerOnce, threshold:.6) del original
    function animateCount(el, endVal, duration) {
        const isYear = endVal > 999;
        const startVal = isYear ? endVal - 50 : 0;
        const startTime = performance.now();

        function easeOut(t) {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        }
        function step(now) {
            const progress = Math.min((now - startTime) / (duration * 1000), 1);
            el.textContent = Math.round(startVal + (endVal - startVal) * easeOut(progress));
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = endVal;
        }
        requestAnimationFrame(step);
    }

    // stat-cards (Clubes, Año de debut)
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length) {
        const statObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const endVal = parseInt(el.textContent, 10);
                    if (!isNaN(endVal)) animateCount(el, endVal, 2.5);
                    statObs.unobserve(el);
                }
            });
        }, { threshold: 0.6 });
        statNumbers.forEach(el => statObs.observe(el));
    }

    // palmares-count (número de logros en cada card)
    const palmaresCount = document.querySelectorAll('.palmares-count');
    if (palmaresCount.length) {
        const palObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const endVal = parseInt(el.textContent, 10);
                    if (!isNaN(endVal)) animateCount(el, endVal, 2);
                    palObs.unobserve(el);
                }
            });
        }, { threshold: 0.4 });
        palmaresCount.forEach(el => palObs.observe(el));
    }

    // ── Parallax 3D hero — valores EXACTOS del React original ──
    // playerName: translate(m * -15, g * -10)
    // heroImg1:   translate(m * 25,  g * 15) rotateY(m*15)  rotateX(-g*10)
    // heroImg2:   translate(m * 10,  g * 8)  rotateY(m*8)   rotateX(-g*5)
    // m = (clientX / offsetWidth  - 0.5) * 2
    // g = (clientY / offsetHeight - 0.5) * 2
    const heroContainer = document.querySelector('.hero');
    const heroText  = document.querySelector('.hero-text');
    const heroImg1  = document.querySelector('.hero-img-1');
    const heroImg2  = document.querySelector('.hero-img-2');
    const heroImgC  = document.querySelector('.hero-img-center');

    if (heroContainer) {
        window.addEventListener('mousemove', e => {
            const { offsetWidth: w, offsetHeight: h } = heroContainer;
            const mx = (e.clientX / w  - 0.5) * 2;
            const gy = (e.clientY / h  - 0.5) * 2;

            if (heroText)
                heroText.style.transform =
                    `translate(${mx * -15}px, ${gy * -10}px)`;
            if (heroImg1)
                heroImg1.style.transform =
                    `translate(${mx * 25}px, ${gy * 15}px) rotateY(${mx * 15}deg) rotateX(${-gy * 10}deg)`;
            if (heroImgC)
                heroImgC.style.transform =
                    `translateX(-50%) translate(${mx * 15}px, ${gy * 10}px) rotateY(${mx * 8}deg) rotateX(${-gy * 6}deg)`;
            if (heroImg2)
                heroImg2.style.transform =
                    `translate(${mx * 10}px, ${gy * 8}px) rotateY(${mx * 8}deg) rotateX(${-gy * 5}deg)`;
        }, { passive: true });
    }

    // ── Contact card: is-visible + mouse glow ─────
    const contactCard = document.querySelector('.contact-card');
    if (contactCard) {
        const ctaObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    ctaObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        ctaObs.observe(contactCard);

        contactCard.addEventListener('mousemove', e => {
            const rect = contactCard.getBoundingClientRect();
            contactCard.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            contactCard.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
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

        let isDragging = false, startX = 0, startScroll = 0;
        track.addEventListener('mousedown', e => {
            isDragging = true; startX = e.pageX; startScroll = track.scrollLeft;
            track.style.cursor = 'grabbing';
        });
        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false; track.style.cursor = 'grab';
        });
        document.addEventListener('mousemove', e => {
            if (!isDragging) return;
            e.preventDefault();
            track.scrollLeft = startScroll - (e.pageX - startX);
        });

        let touchStartX = 0;
        track.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        track.addEventListener('touchend', e => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
        }, { passive: true });
    }

    // ── Video: cargar iframe al hacer click en la miniatura ──
    const videoThumb = document.getElementById('videoThumb');
    if (videoThumb) {
        videoThumb.addEventListener('click', () => {
            const videoId = videoThumb.dataset.videoid;
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            iframe.title = 'Román Zuñiga | Pivot - Mendoza | Argentina';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
            iframe.allowFullscreen = true;
            iframe.style.cssText = 'width:100%;height:100%;border:none;display:block;';
            videoThumb.replaceWith(iframe);
        });
    }

});