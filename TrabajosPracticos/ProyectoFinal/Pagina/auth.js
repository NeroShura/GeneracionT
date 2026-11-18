
(() => {
    const API_AUTH = "http://localhost:3000/api/auth";
    const TOKEN_KEY = "umbral_token";
    const USER_KEY = "umbral_usuario";

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

    const chatAccountStatus = document.querySelector("#chatAccountStatus");

    let perfilActual = null;

    function obtenerToken() {
        return localStorage.getItem(TOKEN_KEY);
    }

    function actualizarInterfaz() {
        const token = obtenerToken();

        if (!token) {
            accountMenu.hidden = true;
            openAuth.hidden = false;

            chatAccountStatus.textContent = "Asistente virtual · Invitado";
            return;
        }

        accountMenu.hidden = false;
        openAuth.hidden = true;

        const usuario = perfilActual?.usuario;

        accountName.textContent = usuario
            ? `Hola, ${usuario.nombre}`
            : "Mi cuenta";

        if (perfilActual?.esSocio) {
            chatAccountStatus.textContent =
                `Socio activo · ${perfilActual.membresia.nombre}`;
        } else if (perfilActual) {
            chatAccountStatus.textContent = "Cuenta sin membresía";
        } else {
            chatAccountStatus.textContent = "Consultando cuenta...";
        }
    }

    function cerrarSesion() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);

        perfilActual = null;
        actualizarInterfaz();
    }

    async function cargarPerfil() {
        const token = obtenerToken();

        if (!token) {
            perfilActual = null;
            actualizarInterfaz();
            return;
        }

        try {
            const respuesta = await fetch(`${API_AUTH}/perfil`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (respuesta.status === 401 || respuesta.status === 403) {
                cerrarSesion();
                return;
            }

            if (!respuesta.ok) {
                throw new Error("No se pudo obtener el perfil.");
            }

            perfilActual = await respuesta.json();

            localStorage.setItem(
                USER_KEY,
                JSON.stringify(perfilActual.usuario)
            );

            actualizarInterfaz();

        } catch (error) {
            console.error("Error al cargar el perfil:", error);

            chatAccountStatus.textContent =
                "No se pudo actualizar la cuenta.";
        }
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

            if (!resultado.token) {
                throw new Error("El servidor no devolvió un token.");
            }

            localStorage.setItem(TOKEN_KEY, resultado.token);

            await cargarPerfil();

            formulario.reset();
            cerrarAuth();

            mostrarMensaje(
                resultado.mensaje || "Operación completada correctamente."
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

    document.querySelectorAll("[data-auth-tab]").forEach(tab => {
        tab.addEventListener("click", () => {
            cambiarFormulario(tab.dataset.authTab);
        });
    });

    openAuth.addEventListener("click", abrirAuth);
    closeAuth.addEventListener("click", cerrarAuth);

    authModal.addEventListener("click", event => {
        if (event.target === authModal) {
            cerrarAuth();
        }
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

    cargarPerfil();
})();
