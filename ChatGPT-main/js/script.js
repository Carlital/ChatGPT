document.addEventListener('DOMContentLoaded', () => {
  console.log('script.js loaded');

  // =========================
  // ENTRY ANIMATIONS
  // =========================
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = 1;
        entry.target.style.transform = 'translateY(0)';
        entry.target.classList.remove('fade-in', 'slide-up');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.fade-in, .slide-up').forEach(el => observer.observe(el));

  // =========================
  // AVATAR LOADING MARK
  // =========================
  document.querySelectorAll('.talking-avatar .avatar-img').forEach(img => {
    const mark = () => {
      const parent = img.closest('.talking-avatar');
      if (parent) parent.classList.add('has-img');
    };
    if (img.complete && img.naturalWidth !== 0) mark();
    else img.addEventListener('load', mark);
  });



  // =========================
  // MINI CHAT
  // =========================
  const miniForm = document.getElementById('mini-chat-form');
  if (miniForm) {
    const msgs = document.getElementById('chat-messages');
    const input = document.getElementById('chat-input');

    // Palabras clave y respuestas simuladas
    const canned = [
      {
        q: 'hola',
        a: 'Hola — puedo ayudarte a estudiar. ¿Sobre qué tema necesitas práctica?'
      },
      {
        q: 'integración',
        a: 'Para integración por partes: eliges u y dv. Luego ∫u·dv = u·v − ∫v·du. ¿Quieres un ejemplo con números?'
      },
      {
        q: 'explica',
        a: 'Puedo explicar paso a paso cualquier tema. Dime la materia y nivel (básico, medio, avanzado).'
      }
    ];

    // estilos inline reutilizables para que TODO se vea oscuro y legible
    // avatar base
    const avatarBaseStyle = [
      'width:32px',
      'height:32px',
      'border-radius:8px',
      'font-size:12px',
      'font-weight:600',
      'line-height:32px',
      'text-align:center',
      'flex-shrink:0',
      'border:1px solid rgba(255,255,255,.08)',
      'box-shadow:0 12px 24px rgba(0,0,0,.7)'
    ].join(';');

    // avatar usuario (gris oscuro)
    const avatarUserStyle = [
      'background:#1f242f',
      'color:#ffffff'
    ].join(';');

    // avatar gpt (verde luz)
    const avatarGptStyle = [
      'background:radial-gradient(circle at 30% 30%, #1ce7b2 0%, #0c4d3d 70%)',
      'color:#d8fced',
      'border:1px solid rgba(16,163,127,.5)',
      'box-shadow:0 16px 32px rgba(0,0,0,.8),0 0 24px rgba(16,163,127,.4)'
    ].join(';');

    // fila de mensaje
    const rowStyle = [
      'display:flex',
      'gap:10px',
      'margin-bottom:12px',
      'align-items:flex-start'
    ].join(';');

    // burbuja oscura reutilizable (texto claro SIEMPRE visible)
    const bubbleStyle = [
      'background:rgba(0,0,0,.55)',
      'border:1px solid rgba(255,255,255,.12)',
      'border-radius:12px',
      'padding:10px 12px',
      'color:#f8fffd',
      'box-shadow:0 16px 32px rgba(0,0,0,.8),0 0 24px rgba(16,163,127,.3)',
      'max-width:90%',
      'font-size:13px',
      'line-height:1.3rem',
      'font-family:inherit'
    ].join(';');

    // helper: crea bloque usuario
    function addUserMessage(text) {
      const row = document.createElement('div');
      row.setAttribute('style', rowStyle);

      const avatar = document.createElement('div');
      avatar.setAttribute('style', avatarBaseStyle + ';' + avatarUserStyle);
      avatar.textContent = 'CL';

      const bubble = document.createElement('div');
      bubble.setAttribute('style', bubbleStyle);
      bubble.textContent = 'Tú: ' + text;

      row.appendChild(avatar);
      row.appendChild(bubble);

      msgs.appendChild(row);
    }

    // helper: crea bloque tutor/gpt
    function addTutorMessage(text) {
      const row = document.createElement('div');
      row.setAttribute('style', rowStyle);

      const avatar = document.createElement('div');
      avatar.setAttribute('style', avatarBaseStyle + ';' + avatarGptStyle);
      avatar.textContent = 'GPT';

      const bubble = document.createElement('div');
      bubble.setAttribute('style', bubbleStyle);
      bubble.textContent = 'Tutor: ' + text;

      row.appendChild(avatar);
      row.appendChild(bubble);

      msgs.appendChild(row);
    }

    miniForm.addEventListener('submit', (ev) => {
      ev.preventDefault();

      const raw = (input.value || '').trim();
      if (!raw) return;

      // 1. pinta mensaje usuario
      addUserMessage(raw);

      // 2. busca respuesta simulada
      const found = canned.find(c => raw.toLowerCase().includes(c.q));
      const reply = found
        ? found.a
        : 'Puedo ayudarte a estudiar, generar preguntas tipo test o explicar un concepto paso a paso. ¿Qué prefieres?';

      // 3. pinta respuesta tutor medio segundo después (feel "typing")
      setTimeout(() => {
        addTutorMessage(reply);

        // scroll bottom
        msgs.scrollTop = msgs.scrollHeight;
      }, 600);

      // 4. limpia input
      input.value = '';

      // 5. scroll bottom del mensaje del user también
      msgs.scrollTop = msgs.scrollHeight;
    });
  }
});



  // =========================
  // DELEGATED CLICK FOR SPEAK BUTTONS
  // =========================
  document.addEventListener('click', (e) => {
    let el = e.target;
    while (el && el !== document) {
      if (el.classList && el.classList.contains && el.classList.contains('speak-btn')) {
        e.preventDefault();
        try { leerTexto(el); } catch (err) { console.error('leerTexto error', err); }
        return;
      }
      el = el.parentNode;
    }
  });

  // Precalentar voces si el navegador deja
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
  }


// =========================
// VOZ / LECTURA EN VOZ ALTA
// =========================

let currentUtterance = null;
let currentBtn = null;
let currentCard = null;

// Busca una voz femenina en español si existe
function getPreferredVoice() {
  const voices = (window.speechSynthesis && window.speechSynthesis.getVoices()) || [];
  if (!voices.length) return null;

  // 1. Filtrar solo voces en español (es-ES, es-MX, es-US, etc.)
  const vocesES = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('es'));
  if (!vocesES.length) {
    return null;
  }

  // 2. Intentar voces femeninas comunes por nombre
  const posiblesFemeninas = [
    /camila/i,
    /paulina/i,
    /sofia/i,
    /lucia/i,
    /google.*espa(ñ|n)ol/i,
    /espa(ñ|n)ol.*(female|femenina)?/i,
  ];

  for (const regex of posiblesFemeninas) {
    const match = vocesES.find(v => regex.test(v.name));
    if (match) return match;
  }

  // 3. Si no encontramos "femenina" explícita,
  // priorizamos voces de Google/Microsoft en español
  const marca = vocesES.find(v => /google|microsoft/i.test(v.name));
  if (marca) return marca;

  // 4. Último recurso: la primera voz en español
  return vocesES[0];
}

// Cambia el circulito/luz de "está hablando"
function toggleVoiceIndicator(card, active) {
  const ind = card?.querySelector?.('.voice-indicator');
  if (!ind) return;
  if (active) ind.classList.add('active');
  else ind.classList.remove('active');
}

// Lector principal
function leerTexto(btn) {
  if (!('speechSynthesis' in window)) {
    alert('Síntesis de voz no soportada en este navegador.');
    return;
  }

  const card = btn.closest('.student-card');
  const bubble = card?.querySelector?.('.bubble');
  const texto = bubble?.getAttribute('data-texto') || bubble?.innerText || '';
  if (!texto) return;

  // si es el mismo botón -> pausar / resumir
  if (currentBtn === btn) {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      btn.textContent = '▶ Reanudar';
      card?.classList?.remove('speaking');
      toggleVoiceIndicator(card, false);
      return;
    }
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      btn.textContent = '⏸ Pausar';
      card?.classList?.add('speaking');
      toggleVoiceIndicator(card, true);
      return;
    }
  }

  // cortar lo que estuviera sonando
  if (currentUtterance) {
    window.speechSynthesis.cancel();
    cleanupCurrent();
  }

  // crear el objeto de voz
  const u = new SpeechSynthesisUtterance(texto);
  u.rate = 1.02;
  u.pitch = 1.15; // un poco más agudo para sonar más femenino
  u.lang = 'es-ES';

  function asignarVozYHablar() {
    const pref = getPreferredVoice();
    if (pref) {
      u.voice = pref;
      u.lang = pref.lang || u.lang;
    }

    u.onstart = () => {
      currentUtterance = u;
      currentBtn = btn;
      currentCard = card;

      btn.textContent = '⏸ Pausar';
      card?.classList?.add('speaking');
      toggleVoiceIndicator(card, true);

      const ava = card?.querySelector?.('.talking-avatar');
      if (ava) ava.classList.add('animating-mouth');

      updateLiveRegion('Reproduciendo audio');
    };

    u.onend = () => {
      cleanupCurrent();
    };

    u.onerror = (e) => {
      console.warn('speech error', e);
      cleanupCurrent();
    };

    window.speechSynthesis.speak(u);
  }

  // si las voces aún no están listas, esperamos el evento y luego hablamos con voz femenina
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      asignarVozYHablar();
    };
    // fuerza carga inicial de voces
    window.speechSynthesis.getVoices();
  } else {
    asignarVozYHablar();
  }
}

// Limpieza de estado UI cuando termina, pausa o se cancela
function cleanupCurrent() {
  if (currentCard) currentCard.classList.remove('speaking');

  const ava = currentCard?.querySelector?.('.talking-avatar');
  if (ava) ava.classList.remove('animating-mouth');

  if (currentBtn) currentBtn.textContent = '▶ Escuchar';

  toggleVoiceIndicator(currentCard, false);

  currentUtterance = null;
  currentBtn = null;
  currentCard = null;

  updateLiveRegion('Reproducción finalizada');
}

// Región aria-live para accesibilidad (lectores de pantalla)
function updateLiveRegion(text) {
  let live = document.getElementById('speech-live');
  if (!live) {
    live = document.createElement('div');
    live.id = 'speech-live';
    live.className = 'visually-hidden';
    live.setAttribute('aria-live', 'polite');
    document.body.appendChild(live);
  }
  live.textContent = text;
}



  const tabBtns = document.querySelectorAll('.ref-tabs [data-tab]');
  const panels = document.querySelectorAll('.ref-panel');
  function showTab(id){
    panels.forEach(p => p.hidden = !(p.id === 'tab-' + id));
    tabBtns.forEach(b => b.setAttribute('aria-selected', b.dataset.tab === id));
  }
  tabBtns.forEach(btn => btn.addEventListener('click', () => showTab(btn.dataset.tab)));
  showTab('doc');

  // Filtro dentro del panel activo
  const input = document.getElementById('ref-search');
  const clear = document.getElementById('clear-filter');
  function activePanel(){ return [...panels].find(p => !p.hidden); }
  function filter(){
    const q = (input.value || '').toLowerCase().trim();
    const items = activePanel().querySelectorAll('.ref-list > li');
    items.forEach(li => {
      const hay = (li.dataset.keywords || li.textContent).toLowerCase();
      li.style.display = q ? (hay.includes(q) ? '' : 'none') : '';
    });
  }
  input.addEventListener('input', filter);
  clear.addEventListener('click', () => { input.value=''; filter(); input.focus(); });

  // Copiar cita
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.copy');
    if(!btn) return;
    navigator.clipboard.writeText(btn.dataset.copy || '').then(()=>{
      const old = btn.textContent;
      btn.textContent = 'Copiado ✓';
      setTimeout(()=> btn.textContent = old, 1200);
    });
  });
