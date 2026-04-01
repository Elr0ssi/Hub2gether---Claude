/* ============================================
   HUB2GETHER — Main JavaScript
   Animations, Interactions, Carousels
   ============================================ */

'use strict';

// ============ NAVBAR SCROLL ============
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;
  if (currentScroll > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  lastScroll = currentScroll;
}, { passive: true });

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');
navToggle?.addEventListener('click', () => {
  navMobile.classList.toggle('open');
});
// Close on link click
navMobile?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navMobile.classList.remove('open'));
});

// ============ SMOOTH SCROLL ============
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ============ REVEAL ON SCROLL ============
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0;
      setTimeout(() => {
        el.classList.add('revealed');
      }, delay);
      revealObserver.unobserve(el);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
  revealObserver.observe(el);
});

// ============ HERO PHONE CAROUSEL ============
const carouselSlides = document.getElementById('carouselSlides');
const dots = document.querySelectorAll('#carouselDots .dot');
let currentSlide = 0;
let slideInterval;

function goToSlide(index) {
  currentSlide = index;
  if (carouselSlides) {
    carouselSlides.style.transform = `translateX(-${index * 25}%)`;
  }
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

function nextSlide() {
  goToSlide((currentSlide + 1) % 4);
}

function startSlideShow() {
  slideInterval = setInterval(nextSlide, 3000);
}
function stopSlideShow() {
  clearInterval(slideInterval);
}

dots.forEach(dot => {
  dot.addEventListener('click', () => {
    stopSlideShow();
    goToSlide(parseInt(dot.dataset.idx));
    startSlideShow();
  });
});

startSlideShow();

// ============ STICKY HORIZONTAL SCROLL PREVIEW ============
(function() {
  const outer = document.querySelector('.preview-sticky-outer');
  const track = document.getElementById('previewSlidesTrack');
  const progressFill = document.getElementById('previewProgressFill');
  const dots = document.querySelectorAll('.psd');
  const scrollHint = document.getElementById('previewScrollHint');
  const slides = document.querySelectorAll('.pslide');

  if (!outer || !track || !slides.length) return;

  const SLIDE_COUNT = slides.length;
  let lastActiveIdx = -1;

  function getSectionProgress() {
    const rect = outer.getBoundingClientRect();
    const totalScroll = outer.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;
    return Math.max(0, Math.min(1, scrolled / totalScroll));
  }

  function updatePreviewScroll() {
    if (window.innerWidth <= 768) return;

    const progress = getSectionProgress();

    // Total horizontal distance to slide = track scrollable width
    const trackScrollable = track.scrollWidth - window.innerWidth + 80;
    const translateX = progress * trackScrollable;
    track.style.transform = `translateX(-${translateX}px)`;

    // Progress bar
    progressFill.style.width = (progress * 100) + '%';

    // Which slide is active?
    const rawIdx = progress * (SLIDE_COUNT - 1);
    const activeIdx = Math.round(rawIdx);

    if (activeIdx !== lastActiveIdx) {
      lastActiveIdx = activeIdx;
      slides.forEach((s, i) => {
        s.classList.toggle('pslide-active', i === activeIdx);
      });
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === activeIdx);
      });
      // Hide scroll hint after first move
      if (activeIdx > 0 && scrollHint) {
        scrollHint.classList.add('hidden');
      } else if (activeIdx === 0 && scrollHint) {
        scrollHint.classList.remove('hidden');
      }
    }
  }

  // Activate first slide
  if (slides[0]) slides[0].classList.add('pslide-active');

  window.addEventListener('scroll', updatePreviewScroll, { passive: true });
  updatePreviewScroll();

  // Click on dot → scroll to corresponding position
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      const outerTop = outer.getBoundingClientRect().top + window.scrollY;
      const totalScroll = outer.offsetHeight - window.innerHeight;
      const targetProgress = i / (SLIDE_COUNT - 1);
      const targetScroll = outerTop + targetProgress * totalScroll;
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    });
  });
})();

// ============ PHOTO UPLOAD — ALL SLIDES ============
(function() {
  // For slides 0-3: click the overlay button to replace with custom image
  document.querySelectorAll('.pslide-upload-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const slideIdx = parseInt(this.dataset.slide);
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (ev) => handleSlideUpload(ev.target.files[0], slideIdx, this.closest('.pslide-mockup'));
      input.click();
    });
  });

  function handleSlideUpload(file, slideIdx, mockupEl) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      // Hide the original screen content
      const screen = mockupEl.querySelector('.preview-screen');
      const uploadBtn = mockupEl.querySelector('.pslide-upload-btn');

      // Create or update the overlay img
      let overlay = mockupEl.querySelector('.custom-img-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'custom-img-overlay';
        const img = document.createElement('img');
        img.alt = 'Votre capture';
        overlay.appendChild(img);

        // Change btn
        const changeBtn = document.createElement('label');
        changeBtn.className = 'upload-overlay-change';
        changeBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Changer`;
        const newInput = document.createElement('input');
        newInput.type = 'file';
        newInput.accept = 'image/*';
        newInput.style.display = 'none';
        newInput.onchange = (ev2) => handleSlideUpload(ev2.target.files[0], slideIdx, mockupEl);
        changeBtn.appendChild(newInput);
        overlay.appendChild(changeBtn);
        mockupEl.appendChild(overlay);
      }

      overlay.querySelector('img').src = e.target.result;
      mockupEl.classList.add('has-custom-img');
      if (screen) screen.style.display = 'none';
      if (uploadBtn) uploadBtn.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  // Slide 5 — dedicated upload zone
  const zone5 = document.getElementById('uploadZone5');
  const placeholder5 = document.getElementById('uploadPlaceholder5');
  const previewImg5 = document.getElementById('uploadPreviewImg5');
  const changeBtn5 = document.getElementById('uploadChangeBtn5');

  function applyUploadZone(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg5.src = e.target.result;
      previewImg5.style.display = 'block';
      placeholder5.style.display = 'none';
      changeBtn5.style.display = 'flex';
      zone5.style.border = 'none';
      zone5.style.borderRadius = 'var(--radius-xl)';
    };
    reader.readAsDataURL(file);
  }

  // Drag & drop
  zone5?.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone5.classList.add('drag-over');
  });
  zone5?.addEventListener('dragleave', () => zone5.classList.remove('drag-over'));
  zone5?.addEventListener('drop', (e) => {
    e.preventDefault();
    zone5.classList.remove('drag-over');
    applyUploadZone(e.dataTransfer.files[0]);
  });

  // All file inputs within slide 5
  document.querySelectorAll('#uploadZone5 .upload-input, #uploadChangeBtn5 .upload-input').forEach(input => {
    input.addEventListener('change', (e) => applyUploadZone(e.target.files[0]));
  });
})();

// ============ COUNTER ANIMATION ============
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 1800;
  const start = performance.now();

  function step(timestamp) {
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);
    el.textContent = current.toLocaleString('fr-FR');
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target.toLocaleString('fr-FR');
    }
  }
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(el => {
  counterObserver.observe(el);
});

// ============ PROGRESS BARS (B2B) ============
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.bm-fill').forEach(bar => {
        const width = bar.dataset.width;
        setTimeout(() => {
          bar.style.width = width + '%';
        }, 200);
      });
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll('.b2b-card-main').forEach(el => {
  barObserver.observe(el);
});

// ============ DASHBOARD BARS ANIMATION ============
const dashBarObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.dsc-bar, .chart-bar').forEach((bar, i) => {
        const finalHeight = bar.style.height;
        bar.style.height = '0';
        setTimeout(() => {
          bar.style.transition = `height 0.6s ease ${i * 0.1}s`;
          bar.style.height = finalHeight;
        }, 100);
      });
      dashBarObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.ds-chart-area, .dash-chart').forEach(el => {
  dashBarObserver.observe(el);
});

// ============ TIMELINE ANIMATION ============
const timelineObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const steps = document.querySelectorAll('.tl-step');
      steps.forEach((step, i) => {
        setTimeout(() => {
          step.classList.add('revealed');
          step.style.opacity = '1';
          step.style.transform = 'translateX(0)';
        }, i * 150);
      });
      timelineObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

const timeline = document.querySelector('.timeline');
if (timeline) {
  // Pre-hide timeline steps
  document.querySelectorAll('.tl-step').forEach(step => {
    step.style.opacity = '0';
    step.style.transform = 'translateX(-20px)';
    step.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });
  timelineObserver.observe(timeline);
}

// ============ HERO ENTRY ANIMATIONS ============
window.addEventListener('load', () => {
  const heroLeft = document.querySelector('.hero-left');
  const heroRight = document.querySelector('.hero-right');

  if (heroLeft) {
    heroLeft.style.opacity = '0';
    heroLeft.style.transform = 'translateX(-30px)';
    setTimeout(() => {
      heroLeft.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      heroLeft.style.opacity = '1';
      heroLeft.style.transform = 'translateX(0)';
    }, 100);
  }
  if (heroRight) {
    heroRight.style.opacity = '0';
    heroRight.style.transform = 'translateX(30px)';
    setTimeout(() => {
      heroRight.style.transition = 'opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s';
      heroRight.style.opacity = '1';
      heroRight.style.transform = 'translateX(0)';
    }, 100);
  }
});

// ============ BUTTON RIPPLE EFFECT ============
document.querySelectorAll('.btn-primary').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.3);
      width: 10px;
      height: 10px;
      left: ${x - 5}px;
      top: ${y - 5}px;
      transform: scale(0);
      animation: rippleAnim 0.6s ease-out;
      pointer-events: none;
    `;
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// Add ripple keyframe dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes rippleAnim {
    to { transform: scale(30); opacity: 0; }
  }
`;
document.head.appendChild(style);

// ============ FEATURE CARDS HOVER ============
document.querySelectorAll('.feature-card').forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, border-color 0.3s ease';
  });
});

// ============ PROBLEM CARDS STAGGER ============
const problemObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.problem-card').forEach((card, i) => {
        setTimeout(() => {
          card.classList.add('revealed');
        }, i * 120);
      });
      problemObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

const problemsGrid = document.querySelector('.problems-grid');
if (problemsGrid) {
  document.querySelectorAll('.problem-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });
  // Add .revealed style override
  const s2 = document.createElement('style');
  s2.textContent = `.problem-card.revealed { opacity: 1 !important; transform: translateY(0) !important; }`;
  document.head.appendChild(s2);
  problemObserver.observe(problemsGrid);
}

// ============ ACTIVE NAV LINK ============
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.style.color = '';
    if (link.getAttribute('href') === '#' + current) {
      link.style.color = 'var(--green-dark)';
    }
  });
}, { passive: true });

// ============ SOLUTION VISUAL PARALLAX ============
const solutionVisual = document.querySelector('.solution-visual');
if (solutionVisual) {
  window.addEventListener('scroll', () => {
    const rect = solutionVisual.getBoundingClientRect();
    const center = window.innerHeight / 2;
    const diff = (rect.top + rect.height / 2 - center) / center;
    solutionVisual.style.transform = `translateY(${diff * 20}px)`;
  }, { passive: true });
}

// ============ STATS HOVER PULSE ============
document.querySelectorAll('.stat-card').forEach(card => {
  card.addEventListener('mouseenter', function() {
    const num = this.querySelector('.stat-num');
    if (num) {
      num.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
      num.style.transform = 'scale(1.05)';
    }
  });
  card.addEventListener('mouseleave', function() {
    const num = this.querySelector('.stat-num');
    if (num) {
      num.style.transform = 'scale(1)';
    }
  });
});

// ============ LOGO PILLS PAUSE ON HOVER ============
const logosInner = document.getElementById('logosInner');
logosInner?.addEventListener('mouseenter', () => {
  logosInner.style.animationPlayState = 'paused';
});
logosInner?.addEventListener('mouseleave', () => {
  logosInner.style.animationPlayState = 'running';
});

// ============ CTA SECTION PARTICLE EFFECT ============
function createParticle(container) {
  const particle = document.createElement('div');
  const size = Math.random() * 4 + 2;
  const x = Math.random() * container.offsetWidth;
  particle.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    background: rgba(120, 200, 163, ${Math.random() * 0.4 + 0.1});
    border-radius: 50%;
    left: ${x}px;
    bottom: -10px;
    pointer-events: none;
    animation: particleRise ${Math.random() * 4 + 3}s ease-in-out infinite;
    animation-delay: ${Math.random() * 3}s;
  `;
  container.appendChild(particle);
  setTimeout(() => particle.remove(), 8000);
}

const ctaSection = document.querySelector('.cta-final');
if (ctaSection) {
  const particleStyle = document.createElement('style');
  particleStyle.textContent = `
    @keyframes particleRise {
      0% { transform: translateY(0) scale(1); opacity: 0; }
      20% { opacity: 1; }
      100% { transform: translateY(-${ctaSection.offsetHeight || 400}px) scale(0); opacity: 0; }
    }
  `;
  document.head.appendChild(particleStyle);

  setInterval(() => {
    if (ctaSection.getBoundingClientRect().top < window.innerHeight &&
        ctaSection.getBoundingClientRect().bottom > 0) {
      createParticle(ctaSection);
    }
  }, 600);
}

console.log('✅ Hub2gether — Loaded and ready!');
