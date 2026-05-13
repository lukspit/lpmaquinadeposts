(function videoPlayer() {
  const frame = document.querySelector('.video-frame');
  if (!frame) return;

  const videoId = frame.dataset.videoId;
  const fallbackDuration = parseInt(frame.dataset.videoDuration, 10) || 152;
  const poster = frame.querySelector('.video-poster');
  const playerContainer = frame.querySelector('.video-player');
  const playerInner = frame.querySelector('.video-player-inner');
  const progressBar = frame.querySelector('.video-progress-bar');

  // Non-linear curve: faster in the first half, slower toward the end.
  // The viewer reads early momentum and tends to stay through the slower tail.
  function applyCurve(progress) {
    return Math.pow(Math.max(0, Math.min(1, progress)), 0.55);
  }

  let player = null;
  let started = false;
  let progressTimer = null;
  let fallbackStart = 0;

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

  function updateProgress() {
    let real = 0;
    if (player && typeof player.getCurrentTime === 'function') {
      const current = player.getCurrentTime();
      const total = player.getDuration() || fallbackDuration;
      real = total > 0 ? current / total : 0;
    } else {
      // Fallback while the YT API is still loading: tick based on wall clock.
      real = ((Date.now() - fallbackStart) / 1000) / fallbackDuration;
    }
    const visual = applyCurve(real);
    progressBar.style.setProperty('--progress', `${Math.min(visual * 100, 100)}%`);
  }

  function startProgress() {
    if (progressTimer) clearInterval(progressTimer);
    progressTimer = setInterval(updateProgress, 250);
  }

  function startPlay() {
    if (started) return;
    started = true;
    poster.style.display = 'none';
    playerContainer.hidden = false;
    fallbackStart = Date.now();

    // Build the iframe directly with autoplay=1 so the YouTube player starts
    // immediately on the same user gesture — no second click on the YT logo.
    const params = new URLSearchParams({
      autoplay: '1',
      playsinline: '1',
      rel: '0',
      modestbranding: '1',
      enablejsapi: '1',
      color: 'white',
    });
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
    iframe.title = 'Demonstração da Máquina de Posts';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.frameBorder = '0';
    iframe.id = 'maquina-video-iframe';
    playerInner.appendChild(iframe);

    // Start the progress bar immediately on the wall-clock fallback so it
    // reads movement even before the YT API attaches.
    startProgress();

    // Once the YT API is ready, attach it to the live iframe so the bar can
    // follow the real currentTime (including pauses/seeks).
    loadYouTubeAPI(() => {
      try {
        player = new YT.Player(iframe);
      } catch (err) {
        // Keep wall-clock fallback running if API attach fails.
      }
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
