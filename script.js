// ===================================================================
// HopWeb — interactive behaviors
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------------
     1. MOBILE MENU TOGGLE
  --------------------------------------------------------------- */
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');

  function closeMobileMenu(){
    mobileMenu.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }

  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      burger.classList.toggle('open', isOpen);
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (isOpen && headerEl) headerEl.classList.remove('nav-hidden');
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  /* ---------------------------------------------------------------
     1b. NAVBAR — dynamic: hides on scroll down, reveals on scroll up
  --------------------------------------------------------------- */
  const headerEl = document.querySelector('header');
  let lastScrollY = window.scrollY;
  let navTicking = false;

  function updateNavVisibility(){
    if (!headerEl) return;
    const currentY = window.scrollY;
    const menuIsOpen = mobileMenu && mobileMenu.classList.contains('open');
    const scrollDelta = currentY - lastScrollY;

    headerEl.classList.toggle('nav-scrolled', currentY > 40);

    if (menuIsOpen) {
      headerEl.classList.remove('nav-hidden');
    } else if (currentY < 80) {
      // always show near the very top
      headerEl.classList.remove('nav-hidden');
    } else if (scrollDelta > 6) {
      // scrolling down -> hide
      headerEl.classList.add('nav-hidden');
    } else if (scrollDelta < -6) {
      // scrolling up -> reveal
      headerEl.classList.remove('nav-hidden');
    }

    lastScrollY = currentY;
    navTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!navTicking) {
      requestAnimationFrame(updateNavVisibility);
      navTicking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', updateNavVisibility);
  updateNavVisibility();

  /* ---------------------------------------------------------------
     2. ACTIVE NAV LINK ON SCROLL
  --------------------------------------------------------------- */
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = ['services', 'process', 'work', 'team', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  function updateActiveNav(){
    let current = null;
    const scrollPos = window.scrollY + window.innerHeight * 0.35;
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollPos) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  /* ---------------------------------------------------------------
     3. SCROLL REVEAL (staggered within grids/groups)
  --------------------------------------------------------------- */
  const revealGroups = [
    '.services-grid', '.process', '.section-head'
  ];
  document.querySelectorAll(revealGroups.join(',')).forEach(group => {
    Array.from(group.children).forEach((child, i) => {
      if (child.classList.contains('reveal')) {
        child.style.transitionDelay = `${Math.min(i, 6) * 70}ms`;
      }
    });
  });

  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) en.target.classList.add('in'); });
  }, { threshold: 0.15 });
  reveals.forEach(el => revealObserver.observe(el));

  /* ---------------------------------------------------------------
     4. HERO STACK MOUSE TILT (desktop / hover-capable only)
  --------------------------------------------------------------- */
  const stage = document.querySelector('.stage');
  const stack = document.getElementById('stack');
  if (stage && stack &&
      window.matchMedia('(prefers-reduced-motion: no-preference)').matches &&
      window.matchMedia('(hover: hover)').matches) {
    stage.addEventListener('mousemove', (e) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      stack.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
    });
    stage.addEventListener('mouseleave', () => {
      stack.style.transform = 'rotateY(0deg) rotateX(0deg)';
    });
  }

  /* ---------------------------------------------------------------
     4b. HERO PARALLAX ON SCROLL (desktop only, reduced-motion safe)
  --------------------------------------------------------------- */
  if (stage && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    let parallaxTicking = false;
    window.addEventListener('scroll', () => {
      if (parallaxTicking) return;
      requestAnimationFrame(() => {
        const offset = Math.min(window.scrollY, 400) * 0.12;
        stage.style.transform = `translateY(${offset}px)`;
        parallaxTicking = false;
      });
      parallaxTicking = true;
    }, { passive: true });
  }

  /* ---------------------------------------------------------------
     5. STAT COUNT-UP (Work section)
  --------------------------------------------------------------- */
  const statEls = document.querySelectorAll('.band-stats .n');
  function animateCount(el){
    if (el.dataset.countText){
      el.textContent = el.dataset.countText;
      return;
    }
    const target = parseInt(el.dataset.count, 10) || 0;
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 20));
    const tick = () => {
      current += step;
      if (current >= target){ el.textContent = target; return; }
      el.textContent = current;
      requestAnimationFrame(tick);
    };
    tick();
  }
  const statObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        animateCount(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  statEls.forEach(el => statObserver.observe(el));

  /* ---------------------------------------------------------------
     6. DETAIL MODAL — Services / Process / Work "Learn more" actions
  --------------------------------------------------------------- */
  const detailContent = {
    websites: {
      eyebrow: 'SERVICES / SITES',
      title: 'Websites',
      body: 'A marketing site, brand page, or landing page built to load fast and read clearly on every device — no bloated builder, just clean hand-tuned code.',
      list: [
        'Custom design, not a templated theme',
        'SEO-friendly markup and fast load times',
        'CMS hookup if you need to edit content yourself',
        'Typical timeline: 1–3 weeks'
      ]
    },
    webapps: {
      eyebrow: 'SERVICES / WEB APPS',
      title: 'Web apps',
      body: 'Full product builds — dashboards, customer portals, and SaaS tools — with logins, billing, and your data layer wired up from day one.',
      list: [
        'User auth, roles, and permissions',
        'Payments and subscription billing',
        'Scalable backend and database design',
        'Typical timeline: 4–10 weeks'
      ]
    },
    tools: {
      eyebrow: 'SERVICES / INTERNAL TOOLS',
      title: 'Internal tools',
      body: 'Admin panels, ops dashboards, and automation that replace the spreadsheet your team has outgrown — built around how your team actually works.',
      list: [
        'Custom admin and reporting dashboards',
        'Workflow automation and integrations',
        'Role-based access for your team',
        'Typical timeline: 2–6 weeks'
      ]
    },
    android: {
      eyebrow: 'SERVICES / ANDROID',
      title: 'Android apps',
      body: 'Native Kotlin apps built to Material Design guidelines and shipped clean to the Play Store, from prototype through release and updates.',
      list: [
        'Native Kotlin, not a cross-platform shim',
        'Material 3 design system',
        'Play Store listing and release management',
        'Typical timeline: 4–12 weeks'
      ]
    },
    ios: {
      eyebrow: 'SERVICES / IOS',
      title: 'iOS apps',
      body: 'Swift apps that feel native to iPhone and iPad, tuned to the Human Interface Guidelines and built to clear App Store review the first time.',
      list: [
        'Native Swift and SwiftUI',
        'Human Interface Guidelines compliant',
        'App Store submission handled for you',
        'Typical timeline: 4–12 weeks'
      ]
    },
    discover: {
      eyebrow: 'PROCESS / STAGE 01',
      title: 'Discover',
      body: 'Before anything gets designed or built, we map what the product actually needs to do, who it\u2019s for, and what it can leave out.',
      list: ['Stakeholder and user interviews', 'Scope and feature prioritization', 'Technical feasibility check', 'Output: a written project brief']
    },
    design: {
      eyebrow: 'PROCESS / STAGE 02',
      title: 'Design',
      body: 'Wireframes and visual direction come next, reviewed with you before a single line of production code is written.',
      list: ['Wireframes and user flows', 'Visual design system', 'Your sign-off before build starts', 'Output: clickable design files']
    },
    build: {
      eyebrow: 'PROCESS / STAGE 03',
      title: 'Build',
      body: 'Working software ships in weekly increments, so you\u2019re watching progress happen rather than waiting on a black box.',
      list: ['Weekly build check-ins', 'Staging environment to test as we go', 'Code reviewed and version controlled', 'Output: a working, testable product']
    },
    ship: {
      eyebrow: 'PROCESS / STAGE 04',
      title: 'Ship',
      body: 'Launch to the web, Google Play, or the App Store, with monitoring and error tracking switched on from the first day live.',
      list: ['Production deployment', 'Store submission (Android / iOS)', 'Monitoring and uptime alerts', 'Output: your product, live']
    },
    support: {
      eyebrow: 'PROCESS / STAGE 05',
      title: 'Support',
      body: 'After launch you get bug fixes, small iterations, and a direct line to the team that built it — no ticket queue.',
      list: ['Bug fixes and patches', 'Small feature iterations', 'Direct access to your build team', 'Flexible monthly or per-task support']
    },
    platforms: {
      eyebrow: 'WORK / COVERAGE',
      title: '5 platforms, one team',
      body: 'Websites, web apps, internal tools, Android, and iOS — all designed and built by the same team so your product feels consistent everywhere.',
      list: ['Websites', 'Web apps', 'Internal tools', 'Android', 'iOS']
    },
    team: {
      eyebrow: 'WORK / TEAM',
      title: 'One team, no handoffs',
      body: 'The people who scope your project are the same people who design and build it — no agency-to-dev-shop handoff where context gets lost.',
      list: ['Same designers and engineers start to finish', 'No re-explaining your product to a new team', 'Direct communication throughout']
    },
    timeline: {
      eyebrow: 'WORK / TIMELINE',
      title: '2–8 week typical build',
      body: 'Most projects land somewhere between a focused 2-week website and an 8-week full product build, depending on scope.',
      list: ['Website: 1–3 weeks', 'Internal tool: 2–6 weeks', 'Web or mobile app: 4–10+ weeks']
    }
  };

  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose = document.getElementById('modalClose');
  const modalEyebrow = document.getElementById('modalEyebrow');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalList = document.getElementById('modalList');

  let lastFocusedEl = null;

  function openModal(key){
    const data = detailContent[key];
    if (!data || !modalOverlay) return;
    modalEyebrow.innerHTML = `<span class="dot"></span> ${data.eyebrow}`;
    modalTitle.textContent = data.title;
    modalBody.textContent = data.body;
    modalList.innerHTML = data.list.map(item => `<li>${item}</li>`).join('');
    lastFocusedEl = document.activeElement;
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  }

  function closeModal(){
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  if (modalOverlay) {
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeModal();
    });
  }

  /* ---------------------------------------------------------------
     7. GLOBAL ACTION ROUTER — data-action attributes
  --------------------------------------------------------------- */
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-action]');
    if (!trigger) return;
    const action = trigger.dataset.action;

    if (action === 'open-detail'){
      e.preventDefault();
      openModal(trigger.dataset.detail);
    }

    if (action === 'start-project'){
      e.preventDefault();
      closeModal();
      closeMobileMenu();
      const contact = document.getElementById('contact');
      if (contact) contact.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const nameField = document.getElementById('name');
        if (nameField) nameField.focus();
      }, 500);
    }

    if (action === 'toggle-faq'){
      const item = trigger.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    }
  });

  /* ---------------------------------------------------------------
     8. CONTACT FORM VALIDATION + FAKE SUBMIT FEEDBACK
  --------------------------------------------------------------- */
  const form = document.getElementById('contactForm');
  const submitMsg = document.getElementById('submitMsg');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      const requiredFields = form.querySelectorAll('[required]');
      requiredFields.forEach(input => {
        const field = input.closest('.field');
        const isEmpty = !input.value.trim();
        const isBadEmail = input.type === 'email' && input.value.trim() &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());

        if (isEmpty || isBadEmail) {
          field.classList.add('invalid');
          valid = false;
        } else {
          field.classList.remove('invalid');
        }
      });

      if (!valid) {
        const firstInvalid = form.querySelector('.invalid input, .invalid textarea');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const submitBtn = form.querySelector('.submit-btn');
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitMsg.classList.add('show');
        submitBtn.textContent = 'Send message';
        submitBtn.disabled = false;
        form.reset();
        setTimeout(() => submitMsg.classList.remove('show'), 5000);
      }, 700);
    });

    // Clear invalid state as the user fixes a field
    form.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('input', () => {
        input.closest('.field').classList.remove('invalid');
      });
    });
  }

  /* ---------------------------------------------------------------
     10. TEAM CAROUSEL — manual scroll-snap, no auto-advance
  --------------------------------------------------------------- */
  const teamTrack = document.getElementById('teamTrack');
  const teamCards = teamTrack ? Array.from(teamTrack.children) : [];
  const teamPrev = document.getElementById('teamPrev');
  const teamNext = document.getElementById('teamNext');
  const teamDotsWrap = document.getElementById('teamDots');

  if (teamTrack && teamCards.length) {
    let index = 0;
    let scrollEndTimer = null;

    teamCards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Go to team member ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      teamDotsWrap.appendChild(dot);
    });
    const dots = Array.from(teamDotsWrap.children);

    function updateControls(){
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
      if (teamPrev) teamPrev.disabled = index === 0;
      if (teamNext) teamNext.disabled = index === teamCards.length - 1;
    }

    function goTo(i){
      index = Math.max(0, Math.min(i, teamCards.length - 1));
      teamTrack.scrollTo({ left: teamCards[index].offsetLeft, behavior: 'smooth' });
      updateControls();
    }

    function next(){ goTo(index + 1); }
    function prev(){ goTo(index - 1); }

    teamNext.addEventListener('click', next);
    teamPrev.addEventListener('click', prev);

    // keep dots/buttons in sync when the user scrolls/swipes the track manually
    teamTrack.addEventListener('scroll', () => {
      clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => {
        const trackCenter = teamTrack.scrollLeft + teamTrack.clientWidth / 2;
        let closest = 0;
        let closestDist = Infinity;
        teamCards.forEach((card, i) => {
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const dist = Math.abs(cardCenter - trackCenter);
          if (dist < closestDist) { closestDist = dist; closest = i; }
        });
        index = closest;
        updateControls();
      }, 120);
    }, { passive: true });

    updateControls();
  }

  /* ---------------------------------------------------------------
     11. BACK TO TOP BUTTON
  --------------------------------------------------------------- */
  const toTop = document.getElementById('toTop');
  if (toTop) {
    window.addEventListener('scroll', () => {
      toTop.classList.toggle('show', window.scrollY > 480);
    }, { passive: true });
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

});
