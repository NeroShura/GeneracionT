
const API_AUTH = "http://localhost:3000/api/auth";

const authModal = document.querySelector("#authModal");
const openAuth = document.querySelector("#openAuth");
const closeAuth = document.querySelector("#closeAuth");

const loginForm = document.querySelector("#loginForm");
const registerForm = document.querySelector("#registerForm");

const authMessage = document.querySelector("#authMessage");
const authTitle = document.querySelector("#authTitle");

const accountMenu = document.querySelector("#accountMenu");
const accountName = document.querySelector("#accountName");
const logoutButton = document.querySelector("#logoutButton");

const TOKEN_KEY = "umbral_token";
const USER_KEY = "umbral_usuario";

function guardarSesion(data) {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.usuario));

    actualizarCuenta();
}

function cerrarSesion() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    actualizarCuenta();
}

function actualizarCuenta() {
    const token = localStorage.getItem(TOKEN_KEY);
    const usuarioGuardado = localStorage.getItem(USER_KEY);

    if (token && usuarioGuardado) {
        try {
            const usuario = JSON.parse(usuarioGuardado);

            accountName.textContent = `Hola, ${usuario.nombre}`;
            accountMenu.hidden = false;
            openAuth.hidden = true;
            return;
        } catch {
            cerrarSesion();
        }
    }

    accountMenu.hidden = true;
    openAuth.hidden = false;
}

function abrirAuth() {
    authModal.classList.add("active");
    authModal.setAttribute("aria-hidden", "false");
    cambiarFormulario("login");
}

function cerrarAuth() {
    authModal.classList.remove("active");
    authModal.setAttribute("aria-hidden", "true");
    authMessage.textContent = "";
}

function cambiarFormulario(tipo) {
    const esLogin = tipo === "login";

    loginForm.hidden = !esLogin;
    registerForm.hidden = esLogin;

    authTitle.innerHTML = esLogin
        ? "Bienvenido <em>de nuevo.</em>"
        : "Creá tu <em>cuenta.</em>";

    document.querySelectorAll("[data-auth-tab]").forEach(tab => {
        tab.classList.toggle(
            "active",
            tab.dataset.authTab === tipo
        );
    });

    authMessage.textContent = "";
}

async function enviarAutenticacion(endpoint, datos, formulario) {
    const boton = formulario.querySelector('button[type="submit"]');
    const textoOriginal = boton.innerHTML;

    boton.disabled = true;
    boton.textContent = "Procesando...";
    authMessage.textContent = "";

    try {
        const respuesta = await fetch(`${API_AUTH}/${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                resultado.error || "No se pudo completar la operación."
            );
        }

        guardarSesion(resultado);

        formulario.reset();
        cerrarAuth();

        mostrarMensaje(
            resultado.mensaje || "Sesión iniciada correctamente."
        );

    } catch (error) {
        authMessage.textContent = error.message;
    } finally {
        boton.disabled = false;
        boton.innerHTML = textoOriginal;
    }
}

loginForm.addEventListener("submit", event => {
    event.preventDefault();

    enviarAutenticacion(
        "login",
        {
            email: document.querySelector("#loginEmail").value.trim(),
            contrasena: document.querySelector("#loginPassword").value
        },
        loginForm
    );
});

registerForm.addEventListener("submit", event => {
    event.preventDefault();

    enviarAutenticacion(
        "registro",
        {
            nombre: document.querySelector("#registerName").value.trim(),
            apellido: document.querySelector("#registerSurname").value.trim(),
            email: document.querySelector("#registerEmail").value.trim(),
            telefono: document.querySelector("#registerPhone").value.trim(),
            contrasena: document.querySelector("#registerPassword").value
        },
        registerForm
    );
});

openAuth.addEventListener("click", abrirAuth);
closeAuth.addEventListener("click", cerrarAuth);

authModal.addEventListener("click", event => {
    if (event.target === authModal) {
        cerrarAuth();
    }
});

document.querySelectorAll("[data-auth-tab]").forEach(tab => {
    tab.addEventListener("click", () => {
        cambiarFormulario(tab.dataset.authTab);
    });
});

logoutButton.addEventListener("click", () => {
    cerrarSesion();
    mostrarMensaje("Cerraste sesión correctamente.");
});

function mostrarMensaje(mensaje) {
    const toast = document.querySelector("#toast");

    if (!toast) return;

    toast.textContent = mensaje;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

actualizarCuenta();
