document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll(".stack-section");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add("visible");
      else e.target.classList.remove("visible"); // anima también al scrollear hacia arriba
    });
  }, { threshold: 0.15 });
  sections.forEach(s => io.observe(s));
});
