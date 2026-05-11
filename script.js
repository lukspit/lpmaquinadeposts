const slides = Array.from(document.querySelectorAll('.sales-slide'));
const dotsContainer = document.querySelector('.carousel-dots');
const prev = document.querySelector('.carousel-control.prev');
const next = document.querySelector('.carousel-control.next');
const carousel = document.querySelector('.sales-carousel');
let current = 0;
let touchStartX = 0;
let touchStartY = 0;
let isDraggingCarousel = false;

function renderDots() {
  slides.forEach((_, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `Ir para o slide ${index + 1}`);
    button.addEventListener('click', () => showSlide(index));
    dotsContainer.appendChild(button);
  });
}

function showSlide(index) {
  slides[current].classList.remove('current');
  current = (index + slides.length) % slides.length;
  slides[current].classList.add('current');
  Array.from(dotsContainer.children).forEach((dot, dotIndex) => {
    dot.classList.toggle('active', dotIndex === current);
  });
}

renderDots();
showSlide(0);

prev.addEventListener('click', () => showSlide(current - 1));
next.addEventListener('click', () => showSlide(current + 1));

carousel.addEventListener('touchstart', (event) => {
  const touch = event.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  isDraggingCarousel = false;
}, { passive: true });

carousel.addEventListener('touchmove', (event) => {
  const touch = event.touches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;

  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 12) {
    isDraggingCarousel = true;
    document.body.classList.add('is-touching-carousel');
  }
}, { passive: true });

carousel.addEventListener('touchend', (event) => {
  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStartX;

  document.body.classList.remove('is-touching-carousel');

  if (!isDraggingCarousel || Math.abs(deltaX) < 42) {
    return;
  }

  showSlide(deltaX < 0 ? current + 1 : current - 1);
});

carousel.addEventListener('touchcancel', () => {
  document.body.classList.remove('is-touching-carousel');
});

carousel.addEventListener('click', () => {
  showSlide(current + 1);
});

document.querySelectorAll('[data-checkout-placeholder="true"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    alert('Coloque aqui o link do checkout quando estiver pronto.');
  });
});

const revealItems = document.querySelectorAll('.hero-content, .hero-visual, .section, .final-cta');

revealItems.forEach((item) => item.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -8% 0px',
});

revealItems.forEach((item) => revealObserver.observe(item));
