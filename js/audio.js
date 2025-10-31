// js/audio.js
document.addEventListener("DOMContentLoaded", () => {
  const audioButtons = document.querySelectorAll(".audio-btn");
  let selectedVoice = null;
  let isSpeaking = false;
  let currentButton = null;

  // =========================
  // Buscar voz femenina en español
  // =========================
  function pickPreferredSpanishVoice() {
    const voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) return null;

    // voces en español (es-ES, es-MX, es-US latino, etc.)
    const vocesES = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith("es"));
    if (!vocesES.length) return null;

    // intentar nombres femeninos comunes
    const posiblesFemeninas = [
      /camila/i,
      /paulina/i,
      /sofia/i,
      /lucia/i,
      /luciana/i,
      /google.*espa(ñ|n)ol/i,
      /espa(ñ|n)ol.*(female|femenina)?/i,
    ];

    for (const regex of posiblesFemeninas) {
      const match = vocesES.find(v => regex.test(v.name));
      if (match) return match;
    }

    // luego intenta Google/Microsoft en español
    const marca = vocesES.find(v => /google|microsoft/i.test(v.name));
    if (marca) return marca;

    // fallback: primera voz en español
    return vocesES[0];
  }

  // =========================
  // Cargar voces
  // =========================
  function loadVoicesAndSelect() {
    selectedVoice = pickPreferredSpanishVoice();
  }

  // Algunos navegadores cargan voces tarde
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = loadVoicesAndSelect;
  }
  loadVoicesAndSelect();

  // =========================
  // Helper para resetear íconos visuales
  // =========================
  function resetAllButtons() {
    isSpeaking = false;
    currentButton = null;
    speechSynthesis.cancel();
    document.querySelectorAll(".audio-btn i").forEach(ic => {
      ic.classList.remove("bi-pause-circle");
      ic.classList.add("bi-play-circle");
    });
  }

  // =========================
  // Configurar cada botón de audio
  // =========================
  audioButtons.forEach(button => {
    const targetSelector = button.getAttribute("data-target");
    const targetElement = document.querySelector(targetSelector);

    if (!targetElement) {
      console.warn(`⚠️ No se encontró el texto para: ${targetSelector}`);
      return;
    }

    const icon = button.querySelector("i");

    button.addEventListener("click", () => {
      // si este mismo botón está activo → detener
      if (isSpeaking && currentButton === button) {
        resetAllButtons();
        return;
      }

      // parar cualquier cosa anterior
      resetAllButtons();

      const text = (targetElement.getAttribute("data-texto") || targetElement.textContent || "").trim();
      if (!text) {
        alert("No hay texto para leer.");
        return;
      }

      // crear el utterance
      const utterance = new SpeechSynthesisUtterance(text);

      // Rate/pitch ajustados para que suene natural y más femenina
      utterance.rate = 1.0;    // velocidad normal
      utterance.pitch = 1.15;  // un poco más agudo, pero no caricatura

      // idioma por defecto
      utterance.lang = (selectedVoice && selectedVoice.lang) || "es-ES";

      // si tenemos voz seleccionada, úsala
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        isSpeaking = true;
        currentButton = button;
        if (icon) {
          icon.classList.remove("bi-play-circle");
          icon.classList.add("bi-pause-circle");
        }
      };

      utterance.onend = () => {
        resetAllButtons();
      };

      utterance.onerror = () => {
        console.warn("❌ Error en síntesis de voz");
        resetAllButtons();
      };

      // hablar
      window.speechSynthesis.speak(utterance);
    });
  });
});


window.addEventListener('pageshow', (event) => {
  if (typeof cleanupCurrent === 'function') cleanupCurrent();

  // Forzar recarga de voces si usa speechSynthesis
  if ('speechSynthesis' in window) {
    try { speechSynthesis.cancel(); } catch(e) { /* noop */ }
  
    window.speechSynthesis.getVoices();
    if (typeof getPreferredVoice === 'function') getPreferredVoice();
  }


});

window.addEventListener('pagehide', () => {
  if ('speechSynthesis' in window) {
    try { speechSynthesis.cancel(); } catch(e) { /* noop */ }
  }
  if (typeof cleanupCurrent === 'function') cleanupCurrent();
});

