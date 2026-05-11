const slides = Array.from(document.querySelectorAll('.sales-slide'));
const dotsContainer = document.querySelector('.carousel-dots');
const prev = document.querySelector('.carousel-control.prev');
const next = document.querySelector('.carousel-control.next');
let current = 0;

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

document.querySelectorAll('[data-checkout-placeholder="true"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    alert('Coloque aqui o link do checkout quando estiver pronto.');
  });
});
