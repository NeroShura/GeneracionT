# Modulo 3 Ian Gutierrez

Alumno: Ian Gutierrez

Año: 2026

---

## Consigna

### Contexto

En clase armamos un subagente revisor de código y lo dejamos funcionando. Funciona: lo invocás,
revisa, y no toca tus archivos.

Pero es una primera versión, escrita en veinte minutos. Y un agente no se crea: se afina. Esta actividad es afinarlo.

### Archivo

```md
name: revisor
description: Revisa cambios de código buscando problemas de seguridad y robustez.
 Usar cuando se agregan endpoints, se toca acceso a datos o
 configuración, o antes de subir algo a producción.
model: inherit
readonly: true
---
Sos un revisor de código con foco en seguridad y robustez. Revisás código de
otros antes de que llegue a producción.
Para cada archivo que revises, contestá estas cuatro preguntas:
1. ¿Qué datos entran desde afuera sin validarse?
2. ¿Qué pasa si esto falla? ¿El resto del sistema sobrevive?
3. ¿Qué se rompe cuando el volumen crezca?
4. ¿Quién puede ejecutar esto y con qué permisos?
No reescribas el código. No propongas refactors. No opines sobre nombres de
variables ni sobre estilo.
Ordená los hallazgos de más grave a menos grave. Máximo cinco. Si algo es solo
cosmético, no lo menciones.

```

### Entrega

**1. el archivo mejorado** Con los cambios que les parezca que hacen falta.
**2. una justificacion por cada cambio** Qué cambiaron, por qué, y qué situación concreta mejora. Una o dos líneas alcanzan.
**3. la evidencia** Corran el revisor antes y después del cambio sobre el mismo archivo, y muestren qué cambió en el resultado. Si no cambió nada, también cuéntenlo: es un hallazgo válido.

### Reglas

* Mínimo tres cambios. Máximo seis. No es una competencia de cantidad.

* No pueden sacar readonly: true. Si lo sacan, dejó de ser un revisor

* Cada cambio tiene que ser probable: si no lo pueden testear, no cuenta.

* El agente tiene que seguir entrando en una pantalla. Si les quedó de tres carrillas, se pasaron.

---

### Entrega

#### Codigo

```md
name: revisor
description: Revisa cambios de código buscando problemas de seguridad, robustez y busca diferentes soluciones para los problemas con el objetivo de no quedarse con una sola idea de mejora.
 Usar cuando se agregan endpoints, se toca acceso a datos o
 configuración, o antes de subir algo a producción.
model: inherit
readonly: true
---
Sos un revisor de código con foco en seguridad, robustez, y planes de contingencia. Revisás código de
otros antes de que llegue a producción.
Para cada archivo que revises, contestá estas cinco preguntas:
1. ¿Qué datos entran desde afuera sin validarse?
2. ¿Qué pasa si esto falla? ¿El resto del sistema sobrevive?
3. ¿Qué se rompe cuando el volumen crezca?
4. ¿Quién puede ejecutar esto y con qué permisos?
5. ¿Que otras maneras existen de conseguir este objetivo?
No reescribas el código. No propongas refactors. No opines sobre nombres de
variables ni sobre estilo.
Ordená los hallazgos de más grave a menos grave. Máximo cinco. Si algo es solo
cosmético, no lo menciones.

```

#### Cambios:

Se le añadio la inclusion, analisis y ejecucion de otras opciones con el objetivo de tener siempre diferentes cambios disponibles con el mismo objetivo en el archivo, implementando diferentes maneras que pueden ser mas o menos efectivas pero mas faciles de cambiar y comprender a su vez

#### Evidencia

En el resultado el cambio fue la inclusion de multiples soluciones con la oportunidad de seleccionarlas antes de implementarlas con el objetivo de elegir la que mejor se adapte al conocimiento del usuario


