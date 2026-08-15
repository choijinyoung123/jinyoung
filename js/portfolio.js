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

  const contestReel = document.querySelector('[data-contest-reel]');
  if (contestReel) {
    const segments = [
      { start: 15, end: 41, time: '00:15 — 00:41', role: 'Motion Design' },
      { start: 65, end: 73, time: '01:05 — 01:13', role: 'Motion Design' },
      { start: 74, end: 88, time: '01:14 — 01:28', role: 'Scene Design' },
      { start: 120, end: 136, time: '02:00 — 02:16', role: 'Motion Design' }
    ];
    const buttons = [...document.querySelectorAll('[data-contest-segment]')];
    const progress = contestReel.querySelector('.contest-progress span');
    let player;
    let activeIndex = 0;
    let isVisible = false;
    let timer;

    const updateReel = (index) => {
      const segment = segments[index];
      buttons.forEach((button, buttonIndex) => button.closest('li')?.classList.toggle('is-active', buttonIndex === index));
      if (progress) progress.style.width = '0%';
    };

    const playSegment = (index) => {
      activeIndex = (index + segments.length) % segments.length;
      updateReel(activeIndex);
      if (!player?.seekTo) return;
      player.seekTo(segments[activeIndex].start, true);
      player.mute();
      if (isVisible) player.playVideo();
    };

    const beginTracking = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => {
        if (!player?.getCurrentTime) return;
        const segment = segments[activeIndex];
        const currentTime = player.getCurrentTime();
        const percent = Math.max(0, Math.min(100, ((currentTime - segment.start) / (segment.end - segment.start)) * 100));
        if (progress) progress.style.width = `${percent}%`;
        if (currentTime >= segment.end - .12) playSegment(activeIndex + 1);
      }, 160);
    };

    window.onYouTubeIframeAPIReady = () => {
      player = new window.YT.Player('contest-highlight-player', {
        events: {
          onReady: () => {
            player.mute();
            playSegment(0);
            beginTracking();
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) playSegment(activeIndex + 1);
          }
        }
      });
    };

    buttons.forEach((button) => button.addEventListener('click', () => playSegment(Number(button.dataset.contestSegment))));

    if ('IntersectionObserver' in window) {
      const contestObserver = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        if (!player?.playVideo) return;
        if (isVisible) player.playVideo();
        else player.pauseVideo();
      }, { threshold: .35 });
      contestObserver.observe(contestReel);
    } else {
      isVisible = true;
    }

    const youtubeApi = document.createElement('script');
    youtubeApi.src = 'https://www.youtube.com/iframe_api';
    youtubeApi.async = true;
    document.head.appendChild(youtubeApi);
  }
})();
