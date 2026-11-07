const menuToggle = document.querySelector('#menuToggle');
const mainNav = document.querySelector('#mainNav');
const reservationModal = document.querySelector('#reservationModal');
const reservationForm = document.querySelector('#reservationForm');
const toast = document.querySelector('#toast');
const chatPanel = document.querySelector('#chatPanel');
const chatMessages = document.querySelector('#chatMessages');

menuToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove('show'), 3200);
}

function openReservation(experience, venue) {
  document.querySelector('#selectedExperience').value = experience;
  document.querySelector('#selectedVenue').value = venue;
  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  document.querySelector('#visitDate').min = localDate;
  reservationModal.classList.add('open');
  reservationModal.setAttribute('aria-hidden', 'false');
}

function closeReservation() {
  reservationModal.classList.remove('open');
  reservationModal.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('.reserve-button').forEach(button => {
  button.addEventListener('click', () => openReservation(button.dataset.experience, button.dataset.venue));
});
document.querySelector('#closeModal').addEventListener('click', closeReservation);
reservationModal.addEventListener('click', event => {
  if (event.target === reservationModal) closeReservation();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeReservation();
    closeChat();
  }
});

reservationForm.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(reservationForm);
  const date = new Date(`${data.get('date')}T12:00:00`).toLocaleDateString('es-AR');
  closeReservation();
  showToast(`Solicitud de demostración: ${data.get('experience')} · ${date} · ${data.get('visitors')} persona(s).`);
  reservationForm.reset();
});

function openChat() {
  chatPanel.classList.add('open');
  chatPanel.setAttribute('aria-hidden', 'false');
  document.querySelector('#chatInput').focus();
}
function closeChat() {
  chatPanel.classList.remove('open');
  chatPanel.setAttribute('aria-hidden', 'true');
}
document.querySelector('#aiLauncher').addEventListener('click', openChat);
document.querySelector('#closeChat').addEventListener('click', closeChat);

function addMessage(message, type) {
  const element = document.createElement('div');
  element.className = type === 'user' ? 'user-message' : 'bot-message';
  element.textContent = message;
  chatMessages.appendChild(element);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getDemoReply(message) {
  const query = message.toLowerCase();
  if (query.includes('membres') || query.includes('socio') || query.includes('descuento')) {
    return 'La membresía Umbral ofrece descuentos mensuales en experiencias seleccionadas, prioridad para reservar experiencias futuras, acceso a propuestas exclusivas y combos especiales de experiencia + merchandising. Los detalles y precios se consultarán desde el backend cuando esté integrado.';
  }
  if (query.includes('sede') || query.includes('ubic')) {
    return 'En esta maqueta contamos con tres sedes de ejemplo: Puerto Madero y Palermo, en Buenos Aires, y Córdoba Centro. Cada sede tendrá su propio catálogo y horarios disponibles.';
  }
  if (query.includes('reserva') || query.includes('horario') || query.includes('sábado') || query.includes('sabado')) {
    return '¡Te ayudo! Primero elegí una experiencia en la sección “Experiencias destacadas”. Desde su ficha podés iniciar una solicitud de reserva de demostración. La consulta de horarios reales se incorporará al conectar el backend.';
  }
  if (query.includes('merch') || query.includes('producto') || query.includes('combo')) {
    return 'Vamos a ofrecer productos asociados a cada universo, como remeras, objetos coleccionables y pósters. También habrá combos especiales para socios. El catálogo de esta página es ilustrativo.';
  }
  if (query.includes('experiencia') || query.includes('película') || query.includes('serie') || query.includes('terror')) {
    return 'Podés explorar tres propuestas ilustrativas: Dimensión desconocida en Puerto Madero, El reino encantado en Palermo y La última señal en Córdoba Centro. En la versión conectada podré filtrar el catálogo real por temática, sede y disponibilidad.';
  }
  return 'Puedo orientarte sobre experiencias, sedes, membresía y merchandising. En esta primera versión respondo con información de demostración; más adelante me conectaré al backend para consultar datos reales y ayudarte con operaciones.';
}

function sendChatMessage(message) {
  const cleanMessage = message.trim();
  if (!cleanMessage) return;
  addMessage(cleanMessage, 'user');
  window.setTimeout(() => addMessage(getDemoReply(cleanMessage), 'bot'), 350);
}

document.querySelector('#chatForm').addEventListener('submit', event => {
  event.preventDefault();
  const input = document.querySelector('#chatInput');
  sendChatMessage(input.value);
  input.value = '';
});
document.querySelectorAll('.chat-suggestions button').forEach(button => {
  button.addEventListener('click', () => sendChatMessage(button.dataset.prompt));
});
