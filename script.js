(function videoPlayer() {
  const frame = document.querySelector('.video-frame');
  if (!frame) return;

  const videoId = frame.dataset.videoId;
  const fallbackDuration = parseInt(frame.dataset.videoDuration, 10) || 152;
  const poster = frame.querySelector('.video-poster');
  const playerContainer = frame.querySelector('.video-player');
  const progressBar = frame.querySelector('.video-progress-bar');
  const timeCurrent = frame.querySelector('.video-time-current');
  const timeTotal = frame.querySelector('.video-time-total');

  function formatTime(sec) {
    const total = Math.max(0, Math.floor(sec || 0));
    const m = Math.floor(total / 60);
    const s = (total % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  timeTotal.textContent = formatTime(fallbackDuration);

  // Non-linear curve: faster in the first half, slower toward the end.
  // The viewer perceives early momentum and stays through the slower tail.
  function applyCurve(progress) {
    return Math.pow(Math.max(0, Math.min(1, progress)), 0.55);
  }

  let player = null;
  let started = false;
  let progressTimer = null;

  function loadYouTubeAPI(cb) {
    if (window.YT && window.YT.Player) {
      cb();
      return;
    }
    window._ytQueue = window._ytQueue || [];
    window._ytQueue.push(cb);
    if (window._ytQueue.length === 1) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () {
        if (previousReady) previousReady();
        const queue = window._ytQueue || [];
        window._ytQueue = [];
        queue.forEach((fn) => fn());
      };
    }
  }

  function startProgress() {
    if (progressTimer) clearInterval(progressTimer);
    progressTimer = setInterval(() => {
      if (!player || typeof player.getCurrentTime !== 'function') return;
      const current = player.getCurrentTime();
      const total = player.getDuration() || fallbackDuration;
      const real = total > 0 ? current / total : 0;
      const visual = applyCurve(real);
      progressBar.style.setProperty('--progress', `${visual * 100}%`);
      timeCurrent.textContent = formatTime(current);
    }, 250);
  }

  function startPlay() {
    if (started) return;
    started = true;
    poster.style.display = 'none';
    playerContainer.hidden = false;

    loadYouTubeAPI(() => {
      player = new YT.Player(playerContainer, {
        videoId,
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          color: 'white',
        },
        events: {
          onReady: (event) => {
            event.target.playVideo();
            const dur = event.target.getDuration();
            if (dur > 0) timeTotal.textContent = formatTime(dur);
            startProgress();
          },
        },
      });
    });
  }

  poster.addEventListener('click', startPlay);
  poster.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      startPlay();
    }
  });
})();

(function reveal() {
  const items = document.querySelectorAll('.hero-content, .hero-visual, .section, .final-cta');
  if (!items.length) return;
  items.forEach((item) => item.classList.add('reveal'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px',
    }
  );

  items.forEach((item) => observer.observe(item));
})();
