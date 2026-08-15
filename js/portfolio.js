(() => {
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.site-nav');
  const navLinks = document.querySelectorAll('.site-nav a');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const updateHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 24);
  };

  const closeMenu = () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    navigation?.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  menuButton?.addEventListener('click', () => {
    const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(willOpen));
    navigation?.classList.toggle('is-open', willOpen);
    document.body.style.overflow = willOpen ? 'hidden' : '';
  });

  navLinks.forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  const reveals = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((item) => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach((item) => observer.observe(item));
  }

  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  document.querySelectorAll('[data-sync-pair]').forEach((pair) => {
    const reference = pair.querySelector('.sync-reference');
    const work = pair.querySelector('.sync-work');
    const offset = Number(pair.dataset.offset || 0);
    if (!reference || !work) return;

    let previousWorkTime = 0;
    reference.muted = true;
    work.muted = true;

    const setWorkSound = (enabled) => {
      reference.muted = true;
      work.muted = !enabled;
      work.volume = 0.35;
      pair.classList.toggle('is-sound-on', enabled);
      const status = pair.querySelector('.sound-status');
      if (status) status.textContent = enabled ? 'SOUND ON' : 'CLICK FOR SOUND';
    };
    const align = () => {
      if (!Number.isFinite(work.duration) || reference.readyState < 1) return;
      const target = offset + work.currentTime;
      if (Math.abs(reference.currentTime - target) > 0.12) reference.currentTime = target;
      if (!work.paused && reference.paused) reference.play().catch(() => {});
    };

    const startTogether = () => {
      reference.currentTime = offset + work.currentTime;
      Promise.allSettled([reference.play(), work.play()]);
    };

    work.addEventListener('loadedmetadata', startTogether, { once: true });
    reference.addEventListener('loadedmetadata', startTogether, { once: true });
    work.addEventListener('play', startTogether);
    work.addEventListener('pause', () => reference.pause());
    work.addEventListener('seeking', align);
    work.addEventListener('timeupdate', () => {
      if (work.currentTime + .4 < previousWorkTime) reference.currentTime = offset + work.currentTime;
      previousWorkTime = work.currentTime;
    });
    pair.addEventListener('click', (event) => {
      if (event.target.closest('a')) return;
      setWorkSound(work.muted);
      if (work.paused) startTogether();
    });
    window.setInterval(align, 250);
  });
})();
