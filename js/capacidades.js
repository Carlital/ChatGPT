// Reveal elements on scroll
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.15
  });

  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
  });

  // Inicializar carrusel
  initCarousel();
});

function initCarousel() {
  const track = document.querySelector('.carousel-track');
  const items = Array.from(document.querySelectorAll('.carousel-item'));
  const dotsContainer = document.querySelector('.carousel-dots');
  const prevBtn = document.querySelector('.carousel-arrow.left');
  const nextBtn = document.querySelector('.carousel-arrow.right');

  if (!track || items.length === 0) return;

  let currentIndex = 0;
  const totalItems = items.length;

  // Crear puntos
  dotsContainer.innerHTML = '';
  for (let i = 0; i < totalItems; i++) {
    const dot = document.createElement('div');
    dot.classList.add('carousel-dot');
    if (i === 0) dot.classList.add('active');
    dot.dataset.index = i;
    dotsContainer.appendChild(dot);
  }

  const dots = Array.from(dotsContainer.querySelectorAll('.carousel-dot'));

  function updateDots() {
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  function goToSlide(index) {
    if (index < 0) index = totalItems - 1;
    if (index >= totalItems) index = 0;
    currentIndex = index;

    // 👇 Usa scrollIntoView — ¡mucho más fiable!
    items[currentIndex].scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });

    updateDots();
  }

  // Eventos
  prevBtn?.addEventListener('click', () => goToSlide(currentIndex - 1));
  nextBtn?.addEventListener('click', () => goToSlide(currentIndex + 1));

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.dataset.index);
      goToSlide(index);
    });
  });

  // Detectar scroll manual (para sincronizar dots)
  let isScrolling = false;
  let scrollTimeout;

  track.addEventListener('scroll', () => {
    if (isScrolling) return;
    isScrolling = true;

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      // Encontrar el item más centrado
      const trackRect = track.getBoundingClientRect();
      const center = track.scrollLeft + trackRect.width / 2;

      let closestIndex = 0;
      let minDistance = Infinity;

      items.forEach((item, index) => {
        const itemRect = item.getBoundingClientRect();
        const itemCenter = itemRect.left + itemRect.width / 2 + track.scrollLeft;
        const distance = Math.abs(itemCenter - center);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      if (closestIndex !== currentIndex) {
        currentIndex = closestIndex;
        updateDots();
      }

      isScrolling = false;
    }, 150);
  });

  // Teclado
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goToSlide(currentIndex - 1);
    if (e.key === 'ArrowRight') goToSlide(currentIndex + 1);
  });
}
