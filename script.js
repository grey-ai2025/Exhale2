/**
 * Exhale Waitlist - Advanced Scroll Effects
 * React-like smooth animations and parallax effects
 */

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initLenis();
    initParallax();
    initScrollReveal();
    initNavbarScroll();
    initFormHandler();
    initHeroAnimations();
    initCounterAnimation();
    initMagneticButtons();
    initCursorGlow();
});

/**
 * Dark Mode Toggle
 */
function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.body.classList.add('dark-mode');
    }

    toggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        // Update cursor glow color
        const glow = document.querySelector('.cursor-glow');
        if (glow) {
            if (isDark) {
                glow.style.background = 'radial-gradient(circle, rgba(50, 224, 196, 0.2) 0%, transparent 70%)';
            } else {
                glow.style.background = 'radial-gradient(circle, rgba(13, 115, 119, 0.15) 0%, transparent 70%)';
            }
        }

        // Update navbar background immediately
        if (window.updateNavBackground) {
            window.updateNavBackground();
        }
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        }
    });
}

/**
 * Lenis Smooth Scroll - React-like buttery smooth scrolling
 */
let lenis;

function initLenis() {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Handle anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                lenis.scrollTo(target, { offset: -80 });
            }
        });
    });
}

/**
 * Parallax Effects - Elements move at different speeds
 */
function initParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    const heroVisual = document.querySelector('.hero-visual');
    const heroContent = document.querySelector('.hero-content');
    const ambientOrbs = document.querySelectorAll('.ambient-orb');

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.pageYOffset;
                const windowHeight = window.innerHeight;

                // Hero parallax
                if (heroVisual) {
                    const heroRect = heroVisual.getBoundingClientRect();
                    if (heroRect.bottom > 0) {
                        heroVisual.style.transform = `translateY(${scrollY * 0.15}px)`;
                    }
                }

                if (heroContent) {
                    const heroRect = heroContent.getBoundingClientRect();
                    if (heroRect.bottom > 0) {
                        heroContent.style.transform = `translateY(${scrollY * 0.08}px)`;
                        heroContent.style.opacity = Math.max(0, 1 - scrollY / 600);
                    }
                }

                // Ambient orbs parallax
                ambientOrbs.forEach((orb, index) => {
                    const speed = 0.05 + (index * 0.02);
                    orb.style.transform = `translateY(${scrollY * speed}px)`;
                });

                // Custom parallax elements
                parallaxElements.forEach(el => {
                    const speed = parseFloat(el.dataset.parallax) || 0.1;
                    const rect = el.getBoundingClientRect();
                    const visible = rect.top < windowHeight && rect.bottom > 0;

                    if (visible) {
                        const yPos = (rect.top - windowHeight) * speed;
                        el.style.transform = `translateY(${yPos}px)`;
                    }
                });

                ticking = false;
            });
            ticking = true;
        }
    });
}

/**
 * Scroll Reveal - Elements animate in as they enter viewport
 */
function initScrollReveal() {
    // Add reveal classes to elements
    const revealConfig = [
        { selector: '.hero-badge', delay: 0 },
        { selector: '.hero-title', delay: 100 },
        { selector: '.hero-subtitle', delay: 200 },
        { selector: '.hero-cta', delay: 300 },
        { selector: '.visual-card', delay: 400 },
        { selector: '.section-header', delay: 0 },
        { selector: '.feature-card', delay: 0, stagger: 100 },
        { selector: '.proof-stat', delay: 0, stagger: 150 },
        { selector: '.waitlist-wrapper', delay: 0 },
    ];

    revealConfig.forEach(config => {
        const elements = document.querySelectorAll(config.selector);
        elements.forEach((el, index) => {
            el.classList.add('reveal');
            el.style.transitionDelay = `${config.delay + (config.stagger ? index * config.stagger : 0)}ms`;
        });
    });

    // Intersection Observer for scroll reveals
    const observerOptions = {
        root: null,
        rootMargin: '-50px',
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');

                // Special handling for split text
                if (entry.target.classList.contains('split-text')) {
                    animateSplitText(entry.target);
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
        revealObserver.observe(el);
    });

    // Trigger hero elements immediately
    setTimeout(() => {
        document.querySelectorAll('.hero .reveal').forEach(el => {
            el.classList.add('revealed');
        });
    }, 100);
}

/**
 * Hero entrance animations
 */
function initHeroAnimations() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    // Animate notification cards with stagger
    const notifications = document.querySelectorAll('.visual-notification');
    notifications.forEach((notif, index) => {
        notif.style.opacity = '0';
        notif.style.transform = 'translateX(-30px)';

        setTimeout(() => {
            notif.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
            notif.style.opacity = '1';
            notif.style.transform = 'translateX(0)';
        }, 800 + (index * 200));
    });
}

/**
 * Counter animation for stats
 */
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

function animateCounter(element) {
    const text = element.textContent;
    const hasPlus = text.includes('+');
    const hasPercent = text.includes('%');
    const numericValue = parseFloat(text.replace(/[^0-9.]/g, ''));

    if (isNaN(numericValue)) return;

    const duration = 2000;
    const startTime = performance.now();
    const isDecimal = text.includes('.');

    function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutExpo(progress);
        const currentValue = numericValue * easedProgress;

        let displayValue;
        if (isDecimal) {
            displayValue = currentValue.toFixed(1);
        } else {
            displayValue = Math.floor(currentValue);
        }

        element.textContent = displayValue + (hasPercent ? '%' : '') + (hasPlus ? '+' : '');

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    element.textContent = '0' + (hasPercent ? '%' : '') + (hasPlus ? '+' : '');
    requestAnimationFrame(update);
}

/**
 * Magnetic button effect
 */
function initMagneticButtons() {
    const magneticElements = document.querySelectorAll('.hero-cta, .submit-btn, .nav-cta');

    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0, 0)';
            el.style.transition = 'transform 0.3s ease';
        });

        el.addEventListener('mouseenter', () => {
            el.style.transition = 'transform 0.1s ease';
        });
    });
}

/**
 * Cursor glow effect that follows mouse
 */
function initCursorGlow() {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateGlow() {
        glowX += (mouseX - glowX) * 0.1;
        glowY += (mouseY - glowY) * 0.1;

        glow.style.left = `${glowX}px`;
        glow.style.top = `${glowY}px`;

        requestAnimationFrame(animateGlow);
    }

    animateGlow();

    // Hide on touch devices
    if ('ontouchstart' in window) {
        glow.style.display = 'none';
    }
}

/**
 * Navbar scroll effects
 */
function initNavbarScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    let lastScroll = 0;
    let isHidden = false;

    function updateNavBackground() {
        const currentScroll = window.pageYOffset;
        const isDark = document.body.classList.contains('dark-mode');

        // Background opacity based on scroll
        if (currentScroll > 50) {
            if (isDark) {
                nav.style.background = 'rgba(10, 10, 15, 0.95)';
                nav.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
            } else {
                nav.style.background = 'rgba(250, 250, 250, 0.95)';
                nav.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.08)';
            }
        } else {
            if (isDark) {
                nav.style.background = 'rgba(10, 10, 15, 0.8)';
            } else {
                nav.style.background = 'rgba(250, 250, 250, 0.8)';
            }
            nav.style.boxShadow = 'none';
        }

        // Hide/show on scroll direction
        if (currentScroll > lastScroll && currentScroll > 200 && !isHidden) {
            nav.style.transform = 'translateY(-100%)';
            isHidden = true;
        } else if (currentScroll < lastScroll && isHidden) {
            nav.style.transform = 'translateY(0)';
            isHidden = false;
        }

        lastScroll = currentScroll;
    }

    // Set initial state
    updateNavBackground();

    window.addEventListener('scroll', updateNavBackground);

    // Expose function to be called when theme changes
    window.updateNavBackground = updateNavBackground;
}

/**
 * Form handler with webhook
 */
function initFormHandler() {
    const form = document.getElementById('waitlistForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = form.querySelector('input[name="email"]');
        const email = emailInput?.value.trim();

        if (!email || !isValidEmail(email)) {
            shakeElement(form.querySelector('.form-group'));
            return;
        }

        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            const response = await fetch('https://greyai.app.n8n.cloud/webhook/ec0cd3e4-87b0-4d52-b23e-3d642f2e3b80', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                // Animate form out
                form.style.transform = 'translateY(-20px)';
                form.style.opacity = '0';
                form.style.transition = 'all 0.5s ease';

                setTimeout(() => {
                    form.style.display = 'none';
                    successMessage.classList.add('show');
                }, 500);

            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            showToast('Something went wrong. Please try again.');
        }
    });
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function shakeElement(element) {
    if (!element) return;
    element.classList.add('shake');
    setTimeout(() => element.classList.remove('shake'), 500);
}

function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/**
 * Text splitting for character animations
 */
function splitText(element) {
    const text = element.textContent;
    element.innerHTML = '';
    element.classList.add('split-text');

    text.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.transitionDelay = `${index * 20}ms`;
        element.appendChild(span);
    });
}

function animateSplitText(element) {
    const chars = element.querySelectorAll('span');
    chars.forEach(char => {
        char.classList.add('revealed');
    });
}
