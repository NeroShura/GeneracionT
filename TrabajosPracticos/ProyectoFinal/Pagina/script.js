const API_URL = 'http://localhost:3000/api/asistente';

const menuToggle = document.querySelector('#menuToggle');
const mainNav = document.querySelector('#mainNav');
const reservationModal = document.querySelector('#reservationModal');
const reservationForm = document.querySelector('#reservationForm');
const toast = document.querySelector('#toast');
const chatPanel = document.querySelector('#chatPanel');
const chatMessages = document.querySelector('#chatMessages');
const chatForm = document.querySelector('#chatForm');
const chatInput = document.querySelector('#chatInput');
const chatSuggestions = document.querySelectorAll('.chat-suggestions button');

let isSendingMessage = false;

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

    showToast.timeout = window.setTimeout(() => {
        toast.classList.remove('show');
    }, 3200);
}

function openReservation(experience, venue) {
    document.querySelector('#selectedExperience').value = experience;
    document.querySelector('#selectedVenue').value = venue;

    const today = new Date();

    const localDate = new Date(
        today.getTime() - today.getTimezoneOffset() * 60000
    ).toISOString().slice(0, 10);

    document.querySelector('#visitDate').min = localDate;

    reservationModal.classList.add('open');
    reservationModal.setAttribute('aria-hidden', 'false');
}

function closeReservation() {
    reservationModal.classList.remove('open');
    reservationModal.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('.reserve-button').forEach(button => {
    button.addEventListener('click', () => {
        openReservation(
            button.dataset.experience,
            button.dataset.venue
        );
    });
});

document.querySelector('#closeModal').addEventListener('click', closeReservation);

reservationModal.addEventListener('click', event => {
    if (event.target === reservationModal) {
        closeReservation();
    }
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

    const date = new Date(
        `${data.get('date')}T12:00:00`
    ).toLocaleDateString('es-AR');

    closeReservation();

    showToast(
        `Solicitud de demostración: ${data.get('experience')} · ${date} · ${data.get('visitors')} persona(s).`
    );

    reservationForm.reset();
});

function openChat() {
    chatPanel.classList.add('open');
    chatPanel.setAttribute('aria-hidden', 'false');
    chatInput.focus();
}

function closeChat() {
    chatPanel.classList.remove('open');
    chatPanel.setAttribute('aria-hidden', 'true');
}

document.querySelector('#aiLauncher').addEventListener('click', openChat);
document.querySelector('#closeChat').addEventListener('click', closeChat);

function addMessage(message, type) {
    const element = document.createElement('div');

    element.className = type === 'user'
        ? 'user-message'
        : 'bot-message';

    element.textContent = message;

    chatMessages.appendChild(element);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return element;
}

function setChatLoading(loading) {
    isSendingMessage = loading;

    chatInput.disabled = loading;

    const submitButton = chatForm.querySelector('button[type="submit"]');

    if (submitButton) {
        submitButton.disabled = loading;
    }

    chatSuggestions.forEach(button => {
        button.disabled = loading;
    });
}

async function sendChatMessage(message) {
    const cleanMessage = message.trim();

    if (!cleanMessage || isSendingMessage) {
        return;
    }

    addMessage(cleanMessage, 'user');

    const loadingMessage = addMessage(
        'Umbral está pensando...',
        'bot'
    );

    setChatLoading(true);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mensaje: cleanMessage
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || 'No se pudo procesar tu consulta.'
            );
        }

        if (typeof data.respuesta !== 'string' || !data.respuesta.trim()) {
            throw new Error('El asistente no devolvió una respuesta válida.');
        }

        loadingMessage.textContent = data.respuesta;

    } catch (error) {
        console.error('Error al comunicarse con Umbral:', error);

        loadingMessage.textContent =
            'No pude comunicarme con el asistente en este momento. Verificá que el servidor esté funcionando e intentá nuevamente.';

    } finally {
        setChatLoading(false);
        chatInput.focus();
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

chatForm.addEventListener('submit', event => {
    event.preventDefault();

    const message = chatInput.value;

    if (!message.trim() || isSendingMessage) {
        return;
    }

    chatInput.value = '';

    sendChatMessage(message);
});

chatSuggestions.forEach(button => {
    button.addEventListener('click', () => {
        sendChatMessage(button.dataset.prompt);
    });
});
