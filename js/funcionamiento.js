// ==========================================
// FUNCIONAMIENTO.JS - Interactividades
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ funcionamiento.js cargado');

  // ==========================================
  // 1. TOKENIZADOR INTERACTIVO
  // ==========================================
  const tokenInput = document.getElementById('tokenInput');
  const tokenOutput = document.getElementById('tokenOutput');

  if (tokenInput && tokenOutput) {
    tokenInput.addEventListener('input', (e) => {
      const text = e.target.value.trim();
      
      if (!text) {
        tokenOutput.innerHTML = '<span class="token-hint">Los tokens aparecerán aquí...</span>';
        return;
      }

      // Simulación simple de tokenización
      // Divide por espacios y puntuación
      const tokens = text.split(/(\s+|[.,!?;:¿¡()[\]{}])/g)
        .filter(t => t.trim().length > 0);
      
      tokenOutput.innerHTML = tokens.map(token => 
        `<span class="token-item">${escapeHtml(token)}</span>`
      ).join('');
    });
  }

  // Helper para escapar HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }


  // ==========================================
  // 2. MODALES DE ARQUITECTURA
  // ==========================================
  const modalTriggers = document.querySelectorAll('.modal-trigger');
  
  // Abrir modal al hacer clic en las cards de arquitectura
  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const modalId = trigger.dataset.modal;
      console.log('🔍 Abriendo modal:', modalId);
      openModal(modalId);
    });
  });

  // Cerrar modal al hacer clic fuera del contenido o en el botón X
  document.addEventListener('click', (e) => {
    // Si es el overlay (fondo oscuro)
    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.remove('active');
      document.body.style.overflow = '';
    }
    
    // Si es el botón cerrar
    if (e.target.classList.contains('modal-close')) {
      const modal = e.target.closest('.modal-overlay');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  });

  // Cerrar con tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-overlay.active');
      if (activeModal) {
        activeModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  });

  // ==========================================
  // 3. CLICKS EN LOS PASOS DEL FLUJO
  // ==========================================
  const flowSteps = document.querySelectorAll('.clickable-flow');
  const flowDetailPanel = document.getElementById('flowDetailPanel');
  const flowDetailText = document.getElementById('flowDetailText');

  const flowDetails = {
    '1': '📝 <strong>Tu mensaje es recibido</strong> por la interfaz de ChatGPT y enviado al servidor de procesamiento donde comienza el análisis.',
    '2': '🔎 <strong>El texto se divide en tokens</strong> (fragmentos de palabras o caracteres). El modelo analiza el contexto, la intención y el tema de tu pregunta.',
    '3': '🧠 <strong>El modelo Transformer predice</strong> palabra por palabra cuál es la respuesta más útil basándose en patrones que aprendió durante el entrenamiento.',
    '4': '🛡️ <strong>Se aplican filtros de seguridad</strong> para evitar contenido dañino, verificar que la respuesta sea apropiada y cumplir las políticas de uso.',
    '5': '✅ <strong>La respuesta final se formatea</strong> y se te muestra en lenguaje natural, clara y legible para que puedas leerla fácilmente.'
  };

  flowSteps.forEach(step => {
    step.addEventListener('click', () => {
      const flowId = step.dataset.flow;
      
      // Remover active de todos
      flowSteps.forEach(s => s.classList.remove('active'));
      
      // Activar el clickeado
      step.classList.add('active');
      
      // Mostrar detalle
      if (flowDetailPanel && flowDetailText && flowDetails[flowId]) {
        flowDetailText.innerHTML = flowDetails[flowId];
        flowDetailPanel.style.display = 'block';
        
        // Scroll suave hacia el panel
        setTimeout(() => {
          flowDetailPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
    });
  });


  // ==========================================
  // 4. MINI-CHAT INTELIGENTE
  // ==========================================
  const chatForm = document.getElementById('mini-chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');

  // Respuestas basadas en palabras clave
  const chatResponses = {
    'token': 'Un <strong>token</strong> es una unidad básica de texto que el modelo procesa. Puede ser una palabra completa, parte de una palabra, o incluso símbolos. Por ejemplo: "ChatGPT" podría dividirse en 1-2 tokens según el modelo. Los tokens son importantes porque limitan cuánto texto puede procesar el modelo de una vez.',
    
    'transformer': 'El <strong>Transformer</strong> es una arquitectura de red neuronal que revolucionó el procesamiento del lenguaje natural. Usa mecanismos de "atención" para entender qué partes de un texto son más relevantes. Es la base de ChatGPT, GPT-4, y otros modelos modernos de IA.',
    
    'educación': 'En <strong>educación</strong>, ChatGPT puede: 1) Actuar como tutor personalizado 24/7, 2) Generar ejercicios y exámenes, 3) Explicar conceptos difíciles de múltiples formas, 4) Dar retroalimentación instantánea, 5) Ayudar con ideas para proyectos. Pero siempre debe <em>complementar</em>, nunca <em>reemplazar</em> al docente.',
    
    'límites': 'ChatGPT tiene <strong>límites importantes</strong>: 1) Puede "alucinar" (inventar datos que suenan reales pero son falsos), 2) Su conocimiento tiene una fecha de corte, 3) No tiene acceso a internet en tiempo real, 4) No debe usarse para decisiones médicas o legales críticas, 5) Puede tener sesgos de sus datos de entrenamiento.',
    
    'funciona': 'ChatGPT <strong>funciona</strong> en 4 pasos principales: 1) Analiza tu mensaje dividiéndolo en tokens, 2) Usa una red neuronal Transformer para entender el contexto, 3) Predice palabra por palabra la mejor respuesta basándose en patrones aprendidos, 4) Aplica filtros de seguridad antes de mostrarte la respuesta final.',
    
    'atención': 'El mecanismo de <strong>atención</strong> (self-attention) permite que el modelo decida qué partes de tu mensaje son más relevantes para generar una buena respuesta. Por ejemplo, en "El gato que estaba en la casa maullaba", el modelo "presta más atención" a "gato" y "maullaba" para entender de qué hablas.',
    
    'entrenamiento': 'ChatGPT fue <strong>entrenado</strong> con enormes cantidades de texto de internet, libros, artículos científicos y otros datos. Primero aprende patrones del lenguaje (pre-entrenamiento), luego recibe ajuste fino con ejemplos corregidos por humanos (RLHF - Reinforcement Learning from Human Feedback).',
    
    'ia': 'La <strong>Inteligencia Artificial</strong> es un campo de la informática que busca crear sistemas capaces de realizar tareas que normalmente requieren inteligencia humana: entender lenguaje, reconocer patrones, tomar decisiones, resolver problemas. ChatGPT es un ejemplo de IA especializada en procesamiento de lenguaje natural.',
    
    'gpt': '<strong>GPT</strong> significa "Generative Pre-trained Transformer" (Transformador Generativo Pre-entrenado). Es una familia de modelos de lenguaje desarrollados por OpenAI. GPT-3, GPT-4 y GPT-5 son versiones cada vez más avanzadas, con más parámetros y mejor capacidad de comprensión.',
    
    'default': 'Interesante pregunta. ChatGPT funciona analizando patrones en tu texto y prediciendo la mejor respuesta basándose en su entrenamiento masivo. ¿Quieres saber algo más específico sobre: <em>tokens, transformer, límites, educación, o cómo funciona internamente</em>?'
  };

  if (chatForm && chatInput && chatMessages) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const userMessage = chatInput.value.trim();
      if (!userMessage) return;

      // Agregar mensaje del usuario
      addChatMessage('user', userMessage);
      
      // Limpiar input
      chatInput.value = '';
      
      // Mostrar indicador de "escribiendo"
      showTypingIndicator();
      
      // Simular delay de respuesta (1.5 segundos)
      setTimeout(() => {
        removeTypingIndicator();
        
        // Buscar respuesta según palabra clave
        let response = chatResponses.default;
        const lowerMessage = userMessage.toLowerCase();
        
        for (const [keyword, answer] of Object.entries(chatResponses)) {
          if (lowerMessage.includes(keyword)) {
            response = answer;
            break;
          }
        }
        
        // Agregar respuesta del bot
        addChatMessage('assistant', response);
      }, 1500);
    });
  }

  // Función para agregar mensaje al chat
  function addChatMessage(type, text) {
    const row = document.createElement('div');
    row.className = `mini-chat-row mini-chat-${type}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'mini-chat-avatar';
    avatar.textContent = type === 'user' ? 'TÚ' : 'GPT';
    
    const bubble = document.createElement('div');
    bubble.className = 'mini-chat-bubble';
    bubble.innerHTML = text;
    
    row.appendChild(avatar);
    row.appendChild(bubble);
    chatMessages.appendChild(row);
    
    // Scroll al final
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Mostrar indicador de "escribiendo..."
  function showTypingIndicator() {
    const row = document.createElement('div');
    row.className = 'mini-chat-row mini-chat-assistant';
    row.id = 'typing-indicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'mini-chat-avatar';
    avatar.textContent = 'GPT';
    
    const bubble = document.createElement('div');
    bubble.className = 'mini-chat-bubble typing-indicator';
    bubble.innerHTML = `
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    `;
    
    row.appendChild(avatar);
    row.appendChild(bubble);
    chatMessages.appendChild(row);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Remover indicador de "escribiendo..."
  function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }


  // ==========================================
  // 5. EFECTOS HOVER ADICIONALES
  // ==========================================
  
  // Cuando pasas el mouse sobre un paso, activa visualmente
  const interactiveSteps = document.querySelectorAll('.interactive-step');
  
  interactiveSteps.forEach((step, index) => {
    step.addEventListener('mouseenter', () => {
      step.classList.add('hovered');
    });
    
    step.addEventListener('mouseleave', () => {
      step.classList.remove('hovered');
    });
  });


  // ==========================================
  // 6. ANIMACIÓN DE ENTRADA PROGRESIVA
  // ==========================================
  
  // Observador de intersección para animar elementos al entrar en viewport
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observar todas las secciones
  document.querySelectorAll('.fx-block, .fx-flow-block, .fx-arch-block').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
  });


  // ==========================================
  // 7. LOGS DE DEPURACIÓN
  // ==========================================
  
  console.log('📊 Elementos inicializados:');
  console.log('  - Tokenizador:', tokenInput ? '✓' : '✗');
  console.log('  - Modales:', modalTriggers.length);
  console.log('  - Pasos de flujo:', flowSteps.length);
  console.log('  - Chat:', chatForm ? '✓' : '✗');
  console.log('  - Pasos interactivos:', interactiveSteps.length);
});


// ==========================================
// FUNCIONES GLOBALES PARA MODALES
// ==========================================

function openModal(modalId) {
  const modal = document.getElementById('modal' + modalId.charAt(0).toUpperCase() + modalId.slice(1));
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevenir scroll del body
  }
}

function closeModal(modalId) {
  const modal = document.getElementById('modal' + modalId.charAt(0).toUpperCase() + modalId.slice(1));
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restaurar scroll
  }
}


// ==========================================
// FUNCIONES GLOBALES AUXILIARES
// ==========================================

// Función para scroll suave a un elemento
function scrollToElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Función para copiar texto al portapapeles
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      console.log('✓ Texto copiado');
    }).catch(err => {
      console.error('Error al copiar:', err);
    });
  }
}