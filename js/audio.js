// js/audio.js
document.addEventListener("DOMContentLoaded", () => {
  const audioButtons = document.querySelectorAll(".audio-btn");
  let selectedVoice = null;

  // Espera a que el navegador cargue las voces
  function loadVoices() {
    const voices = speechSynthesis.getVoices();
    
    selectedVoice =
    voices.find(v =>
        /Google español|español (latino|latam)|español de México|Sabina|Helena|Zira|Luciana/i.test(v.name)
      )
      voices.find(v => v.lang.startsWith("es")); // Si no encuentra una femenina, toma la primera en español
  }

  // Algunos navegadores cargan las voces de forma asíncrona
  speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();

  audioButtons.forEach(button => {
    const targetSelector = button.getAttribute("data-target");
    const targetElement = document.querySelector(targetSelector);

    if (!targetElement) {
      console.warn(`⚠️ No se encontró el texto para: ${targetSelector}`);
      return;
    }

    const icon = button.querySelector("i");
    let isPlaying = false;

    const stopAllAudio = () => {
      speechSynthesis.cancel();
      document.querySelectorAll(".audio-btn i").forEach(ic => {
        ic.classList.remove("bi-pause-circle");
        ic.classList.add("bi-play-circle");
      });
      isPlaying = false;
    };

    button.addEventListener("click", () => {
      if (isPlaying) {
        stopAllAudio();
        return;
      }

      stopAllAudio();
      const text = targetElement.textContent.trim();
      if (!text) {
        alert("No hay texto para leer.");
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedVoice ? selectedVoice.lang : "es-ES";
      utterance.voice = selectedVoice || null;
      utterance.rate = 0.96;   // velocidad normal
      utterance.pitch = 1.6; // tono suave y un poco más alto (voz más cálida)

      utterance.onstart = () => {
        isPlaying = true;
        icon.classList.remove("bi-play-circle");
        icon.classList.add("bi-pause-circle");
      };

      utterance.onend = () => {
        isPlaying = false;
        icon.classList.remove("bi-pause-circle");
        icon.classList.add("bi-play-circle");
      };

      utterance.onerror = () => {
        isPlaying = false;
        icon.classList.remove("bi-pause-circle");
        icon.classList.add("bi-play-circle");
      };

      speechSynthesis.speak(utterance);
    });
  });
});
