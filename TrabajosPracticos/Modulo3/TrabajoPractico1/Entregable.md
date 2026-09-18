# Modulo 3 - Trabajo Practico 1

Alumno: Ian Gutierrez

Año: 2026

## Consigna

Con ayuda de IA deberás:
1. Analizar tu frontend actual e identificar:
a) funcionalidades principales;
b) entidades;
c) datos;
d) reglas de negocio;
e) forma actual de persistencia.

2. Separar responsabilidades y decidir qué pertenece al:

a) Frontend: interfaz, componentes, estados visuales e interacción con el
usuario.

b) Backend: reglas de negocio, persistencia, validaciones importantes y acceso
a datos.

3. Diseñar los endpoints que necesita tu aplicación.

4. Proponer una arquitectura para el backend antes de escribir código y justificar
brevemente por qué la elegiste.

Ejemplo:
Elegí separar Controller, Service y Repository porque cada parte tiene una
responsabilidad diferente: el Controller recibe las peticiones, el Service maneja las
reglas de negocio y el Repository se ocupa del acceso a los datos.

5. Cuestionar al menos una decisión propuesta por la IA. No aceptes
automáticamente todas sus sugerencias.

6. Implementar una funcionalidad del backend respetando la arquitectura diseñada.


## 1. Análisis del frontend actual

La aplicación es una Pokédex web desarrollada con HTML, CSS y JavaScript. Los datos de los Pokémon se obtienen mediante PokéAPI.

### Funcionalidades principales

- Listado de Pokémon.
- Búsqueda por nombre o número.
- Filtro por región.
- Filtro por tipo.
- Agregar y quitar Pokémon de favoritos.
- Visualización de favoritos.
- Consulta de información detallada.
- Visualización de imágenes normales y shiny.
- Visualización de estadísticas.
- Diseño responsive.

#### Entidades

Las principales entidades son:

- **Pokémon:** contiene nombre, ID, tipos, habilidades, estadísticas, peso, altura e imágenes.
- **Región:** representa las diferentes regiones de Pokémon, como Kanto, Johto, Hoenn, etc.
- **Tipo:** representa los tipos de Pokémon, como fuego, agua, planta, eléctrico, etc.
- **Favorito:** representa un Pokémon guardado por el usuario.

#### Datos

La información de los Pokémon se obtiene desde **PokéAPI**.

Ejemplo:

```text
https://pokeapi.co/api/v2/pokemon
```

Los favoritos actualmente se almacenan en el navegador mediante `localStorage`.

#### Reglas de negocio

- Un Pokémon puede agregarse a favoritos.
- Un Pokémon que ya es favorito puede eliminarse.
- No debería haber favoritos duplicados.
- La información de los Pokémon se obtiene desde PokéAPI.
- Los Pokémon pueden filtrarse por región y tipo.
- El detalle de un Pokémon se consulta cuando el usuario lo solicita.

#### Persistencia actual

Actualmente no existe una base de datos ni un backend propio.

La persistencia se realiza mediante:

```javascript
localStorage
```

Los favoritos se guardan como un array de IDs de Pokémon.

---

## 2. Separación de responsabilidades

Se propone separar las responsabilidades entre frontend y backend.

### Frontend

El frontend será responsable de:

- Interfaz gráfica.
- Componentes.
- Mostrar Pokémon.
- Mostrar favoritos.
- Mostrar detalles.
- Formularios y filtros.
- Estados visuales.
- Eventos e interacción con el usuario.
- Mostrar mensajes de carga y error.

El frontend se encargará principalmente de responder a la pregunta:

> ¿Cómo se muestra la información y cómo interactúa el usuario?

### Backend

El backend será responsable de:

- Reglas de negocio.
- Validaciones importantes.
- Persistencia.
- Acceso a la base de datos.
- Gestión de favoritos.
- Consultas necesarias a los datos.

El backend se encargará principalmente de responder a la pregunta:

> ¿Qué operaciones se pueden realizar y bajo qué condiciones?

----

## 3. Diseño de los endpoints

Se propone utilizar una API REST para comunicar el frontend con el backend.

### Pokémon

#### Obtener Pokémon

```http
GET /api/pokemon
```

Permite obtener y filtrar Pokémon.

También puede recibir parámetros:

```http
GET /api/pokemon?nombre=pika&region=1&tipo=electric
```

#### Obtener un Pokémon específico

```http
GET /api/pokemon/:id
```

Ejemplo:

```http
GET /api/pokemon/25
```

Devuelve la información detallada del Pokémon.

---

### Regiones

#### Obtener regiones

```http
GET /api/regiones
```

Devuelve las regiones disponibles.

#### Obtener Pokémon de una región

```http
GET /api/regiones/:id/pokemon
```

Ejemplo:

```http
GET /api/regiones/1/pokemon
```

---

### Tipos

#### Obtener tipos

```http
GET /api/tipos
```

Devuelve los tipos disponibles.

El filtro también puede realizarse mediante:

```http
GET /api/pokemon?tipo=fire
```

---

### Favoritos

#### Obtener favoritos

```http
GET /api/favoritos
```

#### Agregar un favorito

```http
POST /api/favoritos
```

Body:

```json
{
  "pokemonId": 25
}
```

#### Eliminar un favorito

```http
DELETE /api/favoritos/:pokemonId
```

Ejemplo:

```http
DELETE /api/favoritos/25
```

---

## 4. Arquitectura propuesta para el Backend

Se propone utilizar una arquitectura en capas, separando **Routes, Controller, Service y Repository**.

```text
Backend
│
├── Routes
│   └── Define los endpoints.
│
├── Controllers
│   └── Reciben las peticiones HTTP.
│
├── Services
│   └── Contienen las reglas de negocio.
│
└── Repositories
    └── Se encargan del acceso a los datos.
```

### Justificación

Elegí esta arquitectura porque permite separar responsabilidades:

- **Routes:** define las rutas disponibles.
- **Controller:** recibe las solicitudes y devuelve las respuestas.
- **Service:** procesa las reglas de negocio y validaciones.
- **Repository:** se comunica con la base de datos.

Esta separación facilita el mantenimiento, las pruebas y futuras modificaciones del proyecto.

---

## 5. Cuestionamiento de una decisión propuesta por la IA

No aceptaría automáticamente la propuesta de que el backend sea el encargado de consultar PokéAPI.

Para este proyecto considero que podría ser innecesario agregar esa responsabilidad al backend, ya que PokéAPI es una fuente externa que el frontend puede consultar directamente.

Mantendría en el backend principalmente:

- Gestión de favoritos.
- Validaciones.
- Reglas de negocio.
- Persistencia en la base de datos.

De esta manera, la arquitectura sería más simple y adecuada para el tamaño actual del proyecto.

---

## 6. Implementación de una funcionalidad del Backend

Se implementará la funcionalidad de **gestión de favoritos**, ya que actualmente los favoritos se almacenan en `localStorage` y esta responsabilidad debería pasar al backend.

Se utilizará la arquitectura:

```text
Routes → Controller → Service → Repository
```

### Funcionalidad elegida

La funcionalidad permitirá:

- Agregar un Pokémon a favoritos.
- Obtener la lista de favoritos.
- Eliminar un Pokémon de favoritos.

### Estructura

```text
backend/
│
├── routes/
│   └── favoritos.routes.js
│
├── controllers/
│   └── favoritos.controller.js
│
├── services/
│   └── favoritos.service.js
│
└── repositories/
    └── favoritos.repository.js
```

### Responsabilidades

#### Routes

Define los endpoints disponibles para gestionar favoritos.

#### Controller

Recibe las peticiones HTTP y devuelve las respuestas correspondientes.

#### Service

Contiene las reglas de negocio, por ejemplo:

- Comprobar que el Pokémon exista.
- Evitar favoritos duplicados.
- Procesar la creación y eliminación de favoritos.

#### Repository

Se encarga de acceder a la base de datos para:

- Guardar favoritos.
- Consultar favoritos.
- Eliminar favoritos.

### Endpoints implementados

#### Obtener favoritos

```http
GET /api/favoritos
```

#### Agregar favorito

```http
POST /api/favoritos
```

Body:

```json
{
  "pokemonId": 25
}
```

#### Eliminar favorito

```http
DELETE /api/favoritos/25
```

### Flujo de la funcionalidad

```text
Frontend
   ↓
Route
   ↓
Controller
   ↓
Service
   ↓
Repository
   ↓
Base de datos
```

De esta forma, la gestión de favoritos deja de depender directamente de `localStorage` y queda centralizada en el backend, respetando la arquitectura propuesta.
