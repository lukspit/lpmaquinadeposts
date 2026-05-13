(function videoPlayer() {
  const frame = document.querySelector('.video-frame');
  if (!frame) return;

  const videoId = frame.dataset.videoId;
  const fallbackDuration = parseInt(frame.dataset.videoDuration, 10) || 100;
  const poster = frame.querySelector('.video-poster');
  const playerInner = frame.querySelector('.video-player-inner');
  const progressBar = frame.querySelector('.video-progress-bar');

  // Non-linear curve: faster in the first half, slower toward the end.
  function applyCurve(progress) {
    return Math.pow(Math.max(0, Math.min(1, progress)), 0.55);
  }

  let player = null;
  let playerReady = false;
  let pendingPlay = false;
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
      real = ((Date.now() - fallbackStart) / 1000) / fallbackDuration;
    }
    const visual = applyCurve(real);
    progressBar.style.setProperty('--progress', `${Math.min(visual * 100, 100)}%`);
  }

  function startProgress() {
    if (progressTimer) clearInterval(progressTimer);
    progressTimer = setInterval(updateProgress, 250);
  }

  // Build the YouTube player up front, behind the custom poster. When the
  // user clicks the poster, we only need to call playVideo() — keeping the
  // play call inside the original user gesture (which iOS Safari requires).
  loadYouTubeAPI(() => {
    player = new YT.Player(playerInner, {
      videoId,
      width: '100%',
      height: '100%',
      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        color: 'white',
      },
      events: {
        onReady: () => {
          playerReady = true;
          if (pendingPlay && player && typeof player.playVideo === 'function') {
            player.playVideo();
            pendingPlay = false;
          }
        },
      },
    });
  });

  function startPlay() {
    if (started) return;
    started = true;
    poster.classList.add('is-playing');
    fallbackStart = Date.now();
    startProgress();
    if (playerReady && player && typeof player.playVideo === 'function') {
      // Called synchronously in the click handler — preserves the user gesture.
      player.playVideo();
    } else {
      // API still loading; queue the play so it fires the moment onReady runs.
      pendingPlay = true;
    }
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
