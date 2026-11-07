# Proyecto final Generacion T

Alumno: Ian Leon Gutierrez

Año: 2026

---

# Consigna

Realizar una IA desde cero abarcando todo lo visto durante el curso

---

## Reservas de experiencias inmersivas

Es un sistema de reservas para una empresa que se encarga de hacer experiencias innmersivas de diferentes tematicas basadas en peliculas y series iconicas, en esta se reservara el horario, la experiencia(hay distintas sedes con experiencias distintas), merch de las experiencias, la reserva para experiencias futuras o exclusivas y en caso de ser socio tambien habra descuentos en experiencias todas los meses y combos con merch de la misma

---

### SPEC – Sistema de Reservas Inteligente para Experiencias Inmersivas

#### 1. Descripción general

El proyecto consiste en desarrollar una inteligencia artificial conversacional para una empresa dedicada a la creación y comercialización de experiencias inmersivas basadas en películas y series icónicas.

La IA funcionará como un asistente virtual que permitirá a los clientes consultar las experiencias disponibles en las distintas sedes, reservar horarios, adquirir merchandising y acceder a experiencias especiales o exclusivas.

El sistema contará con una membresía de un único nivel que ofrecerá descuentos mensuales, promociones, combos exclusivos y prioridad para reservar determinadas experiencias.

Los pagos de reservas y compras se realizarán mediante una plataforma de pagos externa, integrada al sistema.

#### 2. Objetivo principal

Desarrollar un sistema inteligente que automatice y facilite los procesos de reservas, compras y consultas de los clientes, proporcionando atención personalizada y disponible las 24 horas.

El sistema centralizará la gestión de usuarios, sedes, experiencias, horarios, reservas, productos, compras, membresías y promociones.

#### 3. Tipos de usuarios

- **Visitante:** puede consultar las experiencias, sedes, horarios, precios y productos disponibles.
- **Cliente registrado:** puede realizar reservas, comprar merchandising y consultar sus operaciones.
- **Socio:** posee una membresía activa de nivel único y accede a descuentos, promociones mensuales, combos exclusivos y prioridad de reserva.
- **Administrador:** gestiona sedes, experiencias, horarios, reservas, productos, promociones y membresías.

#### 4. Funcionalidades principales

##### 4.1. Atención mediante inteligencia artificial

La IA será el principal medio de interacción con los clientes.

Deberá permitir:
- Responder consultas sobre experiencias y sedes.
- Recomendar experiencias según los intereses del cliente.
- Informar precios, duración y disponibilidad.
- Guiar al usuario durante las reservas y compras.
- Informar promociones y beneficios.
- Consultar reservas existentes.
- Identificar si el usuario es socio.
- Aplicar los beneficios correspondientes.
- Derivar consultas complejas a un administrador.

##### 4.2. Gestión de sedes

El sistema permitirá:
- Consultar las distintas sedes.
- Mostrar sus ubicaciones y direcciones.
- Consultar las experiencias disponibles en cada sede.
- Informar horarios de atención.
- Consultar disponibilidad y capacidad.
- Informar restricciones de edad y accesibilidad.

##### 4.3. Gestión de experiencias

Cada experiencia estará basada en una película o serie icónica.

El sistema deberá permitir:
- Consultar el catálogo de experiencias.
- Visualizar descripciones e imágenes.
- Consultar duración y precios.
- Identificar las sedes donde está disponible.
- Consultar requisitos y restricciones.
- Consultar fechas y horarios disponibles.
- Identificar experiencias exclusivas para socios.
- Consultar experiencias próximas a lanzarse.

##### 4.4. Sistema de reservas

Los clientes podrán reservar experiencias mediante la IA.

El procedimiento será:

1. Seleccionar una sede.
2. Elegir una experiencia.
3. Seleccionar una fecha.
4. Consultar los horarios disponibles.
5. Elegir un horario.
6. Indicar la cantidad de asistentes.
7. Identificarse o registrarse.
8. Validar si posee una membresía activa.
9. Aplicar descuentos y beneficios correspondientes.
10. Consultar el importe final.
11. Realizar el pago mediante la plataforma externa.
12. Confirmar la reserva una vez validado el pago.
13. Recibir el comprobante de reserva.

También permitirá consultar, modificar y cancelar reservas según las políticas de la empresa.

Cada reserva contará con un identificador único y un estado.

##### 4.5. Gestión de merchandising

El sistema permitirá:
- Consultar el catálogo de productos.
- Visualizar imágenes y descripciones.
- Consultar precios y stock.
- Seleccionar productos y cantidades.
- Agregar productos a una compra.
- Combinar merchandising con reservas.
- Aplicar promociones y descuentos.
- Realizar pagos mediante una plataforma externa.
- Consultar el historial de compras.

##### 4.6. Experiencias futuras y exclusivas

La empresa podrá ofrecer experiencias especiales, futuras o de cupos limitados.

El sistema deberá permitir:
- Consultar próximas experiencias.
- Informar fechas de lanzamiento.
- Realizar reservas anticipadas.
- Consultar cupos disponibles.
- Habilitar períodos de preventa para socios.
- Ofrecer prioridad de reserva a los socios antes de la apertura al público general.
- Permitir que determinadas experiencias sean reservadas exclusivamente por socios.
- Notificar a los clientes sobre nuevos lanzamientos.

La prioridad de los socios se gestionará mediante períodos de acceso anticipado configurables por el administrador.

Las experiencias exclusivas tendrán acceso restringido a usuarios con membresía activa.

##### 4.7. Sistema de membresía

La empresa contará con una única membresía, a la cual podrán suscribirse los clientes registrados.

No existirán diferentes niveles ni categorías de socios.

La membresía ofrecerá los siguientes beneficios:
- Descuentos mensuales en experiencias seleccionadas.
- Combos exclusivos de experiencias y merchandising.
- Promociones especiales.
- Prioridad para reservar experiencias futuras.
- Acceso anticipado a preventas.
- Acceso exclusivo a determinadas experiencias.
- Ofertas especiales de merchandising.

El sistema deberá:
- Permitir consultar las condiciones y el precio de la membresía.
- Permitir contratar la membresía.
- Registrar la fecha de inicio y vencimiento.
- Consultar su estado (activa, vencida o cancelada).
- Identificar automáticamente a los socios.
- Aplicar los descuentos correspondientes.
- Mostrar las promociones disponibles.
- Gestionar renovaciones y cancelaciones.

Los beneficios solamente podrán utilizarse mientras la membresía se encuentre activa y se cumplan las condiciones de cada promoción.

##### 4.8. Integración con plataforma de pagos externa

El sistema no procesará directamente tarjetas ni almacenará datos financieros sensibles.

Se integrará con una plataforma externa de pagos que permitirá:
- Generar solicitudes de pago para reservas.
- Procesar compras de merchandising.
- Cobrar suscripciones de membresía.
- Consultar el estado de las transacciones.
- Validar pagos aprobados, rechazados o pendientes.
- Recibir confirmaciones de pago mediante mecanismos seguros de notificación.
- Registrar el identificador de cada transacción.

La reserva o compra solamente se confirmará cuando el sistema verifique que el pago fue aprobado, según las condiciones comerciales correspondientes.

##### 4.9. Notificaciones

El sistema enviará notificaciones sobre:
- Confirmaciones de reservas.
- Modificaciones y cancelaciones.
- Confirmaciones de compras.
- Recordatorios de experiencias.
- Nuevas experiencias disponibles.
- Preventas para socios.
- Promociones mensuales.
- Combos exclusivos.
- Vencimiento y renovación de membresías.

#### 5. Requisitos funcionales

| Código | Requisito |
|---|---|
| RF01 | Consultar las sedes disponibles. |
| RF02 | Mostrar las experiencias de cada sede. |
| RF03 | Consultar precios, duración y características. |
| RF04 | Consultar disponibilidad de horarios y cupos. |
| RF05 | Realizar reservas de experiencias. |
| RF06 | Modificar o cancelar reservas según las políticas establecidas. |
| RF07 | Generar identificadores únicos para las reservas. |
| RF08 | Consultar el catálogo de merchandising. |
| RF09 | Realizar compras de productos. |
| RF10 | Controlar el stock de merchandising. |
| RF11 | Consultar experiencias futuras y exclusivas. |
| RF12 | Realizar reservas anticipadas. |
| RF13 | Gestionar una membresía de nivel único. |
| RF14 | Aplicar descuentos a socios con membresía activa. |
| RF15 | Gestionar promociones y combos exclusivos. |
| RF16 | Otorgar prioridad de reserva a los socios. |
| RF17 | Restringir determinadas experiencias exclusivamente a socios. |
| RF18 | Integrarse con una plataforma externa de pagos. |
| RF19 | Validar el estado de los pagos antes de confirmar operaciones. |
| RF20 | Enviar notificaciones automáticas. |
| RF21 | Permitir al administrador gestionar sedes, experiencias, horarios y productos. |
| RF22 | Registrar el historial de operaciones de cada cliente. |
| RF23 | Permitir consultar el estado de la membresía. |
| RF24 | Gestionar las fechas de preventa y acceso anticipado. |
| RF25 | La IA deberá responder consultas y asistir a los usuarios. |

#### 6. Requisitos no funcionales

- **Disponibilidad:** el asistente virtual deberá estar disponible las 24 horas.
- **Seguridad:** proteger los datos personales y las operaciones.
- **Rendimiento:** procesar consultas y operaciones en tiempos razonables.
- **Usabilidad:** ofrecer una interfaz conversacional intuitiva.
- **Escalabilidad:** permitir incorporar nuevas sedes y experiencias.
- **Integridad:** evitar reservas duplicadas y superar los cupos disponibles.
- **Confiabilidad:** proporcionar información basada en datos reales.
- **Privacidad:** proteger la información personal y financiera.
- **Interoperabilidad:** permitir la comunicación con plataformas externas de pagos y notificaciones.

#### 7. Reglas de negocio

1. Una sede podrá ofrecer múltiples experiencias.
2. Una experiencia podrá estar disponible en una o varias sedes.
3. Cada experiencia tendrá horarios y cupos definidos.
4. Una reserva solamente podrá confirmarse si existe disponibilidad.
5. No se podrá superar la capacidad máxima de una experiencia.
6. Cada experiencia tendrá un precio establecido.
7. Existirá un único nivel de membresía.
8. Un usuario deberá tener una membresía activa para ser considerado socio.
9. Los descuentos y beneficios solamente podrán aplicarse a socios activos.
10. Las promociones tendrán fechas de vigencia y condiciones específicas.
11. Los combos exclusivos estarán disponibles únicamente para socios.
12. Los socios tendrán prioridad de reserva durante los períodos de preventa establecidos.
13. Algunas experiencias estarán restringidas exclusivamente a socios.
14. Las experiencias exclusivas no podrán reservarse con una cuenta que no tenga una membresía activa.
15. La disponibilidad de merchandising dependerá del stock registrado.
16. Los pagos serán procesados mediante una plataforma externa.
17. El sistema deberá verificar el estado del pago antes de confirmar una operación.
18. La IA no podrá inventar precios, horarios, disponibilidad ni promociones.
19. Las modificaciones y cancelaciones deberán respetar las políticas comerciales de la empresa.
20. El administrador podrá configurar los descuentos, períodos de preventa y condiciones de exclusividad.

#### 8. Entidades principales del sistema

- **Usuario:** almacena los datos personales de los clientes.
- **Membresía:** almacena la información de la membresía única, sus condiciones y beneficios.
- **Suscripción:** relaciona a un usuario con su membresía y registra su vigencia y estado.
- **Sede:** almacena la información de las ubicaciones.
- **Experiencia:** contiene la información de las experiencias inmersivas.
- **Experiencia_Sede:** relaciona las experiencias con las sedes.
- **Horario:** almacena fechas, horarios y cupos disponibles.
- **Reserva:** registra las reservas realizadas.
- **Pago:** almacena los identificadores externos y estados de las transacciones.
- **Producto:** contiene el catálogo de merchandising.
- **Stock:** registra las cantidades disponibles.
- **Compra:** registra las compras realizadas.
- **Detalle_Compra:** almacena los productos y cantidades.
- **Promoción:** contiene los descuentos y beneficios vigentes.
- **Combo:** registra los paquetes especiales.
- **Notificación:** almacena los avisos enviados.
- **Acceso_Preventa:** registra las condiciones y períodos de prioridad para reservar experiencias.

#### 9. Flujo general de interacción con la IA

1. El usuario inicia una conversación.
2. La IA identifica qué operación desea realizar.
3. El sistema consulta la información correspondiente.
4. La IA presenta las opciones disponibles.
5. El usuario selecciona una operación.
6. El sistema solicita los datos necesarios.
7. Se verifica si el usuario posee una membresía activa.
8. Se aplican los beneficios correspondientes.
9. La IA presenta el resumen y el importe.
10. El usuario confirma la operación.
11. El sistema genera una solicitud de pago en la plataforma externa.
12. El cliente realiza el pago.
13. El sistema recibe y verifica el resultado de la transacción.
14. Se confirma la reserva o compra.
15. La IA informa el resultado y proporciona el comprobante.

#### 10. Alcance del proyecto

El sistema abarcará los siguientes módulos:

1. Asistente virtual inteligente.
2. Gestión de usuarios y clientes.
3. Gestión de sedes y experiencias.
4. Gestión de horarios y reservas.
5. Gestión de merchandising y compras.
6. Gestión de experiencias futuras y exclusivas.
7. Gestión de membresías y suscripciones.
8. Gestión de promociones y combos.
9. Integración con plataformas externas de pago.
10. Gestión de notificaciones.
11. Panel administrativo.
