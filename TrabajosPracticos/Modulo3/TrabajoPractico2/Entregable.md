# Generacion T Trabajo 21

Alumno: Ian Gutierrez

Año: 2026

## Contexto

La siguiente función vive en el repositorio del backend y se ejecuta en cada GET /tickets. Su trabajo es traer los tickets desde SQL Server.


Hoy la base tiene 5 tickets con títulos cortos y una sola persona usando el sistema. La función no da errores: la aplicación anda. Más adelante vamos a necesitar crear y editar tickets desde el formulario.

## Codigo

```js
import { execFile } from "child_process";
import { promisify } from "util";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
const executeFileAsync = promisify(execFile);
const SQL_COMMAND_MAXIMUM_COLUMN_WIDTH = 8000;
const SQL_COMMAND_MAXIMUM_BUFFER_BYTES = 10 * 1024 * 1024;
export async function queryTicketRows(): Promise<unknown[]> {
 const databaseServer = process.env.DB_SERVER ?? "";
 const databaseName = process.env.DB_DATABASE ?? "";
 if (databaseServer.trim().length === 0) {
 throw new Error("DB_SERVER is missing. Create a .env file in the project root.");
 }
 const { stdout } = await executeFileAsync(
 "sqlcmd",
 [
 "-S", databaseServer,
 "-d", databaseName,
 "-E",
 "-y", String(SQL_COMMAND_MAXIMUM_COLUMN_WIDTH),
 "-h", "-1",
 "-Q", "SET NOCOUNT ON; SELECT * FROM Tickets FOR JSON PATH;"
 ],
 { maxBuffer: SQL_COMMAND_MAXIMUM_BUFFER_BYTES }
 );
 const jsonText = stdout.trim();
 if (jsonText.length === 0) {
 return [];
 }
 const parsedRows: unknown = JSON.parse(jsonText);
 if (!Array.isArray(parsedRows)) {
 throw new Error("SQL Server did not return a JSON array of tickets.");
 }
 return parsedRows;
}
```

## Entrega

1. **Tres problemas** Ordenados del más grave al menos grave. Para cada uno, escriban en qué situación concreta se rompe o se vuelve caro. No vale “está desprolijo” ni “se puede hacer mejor”: queremos el escenario.

2. **Un prompt** El que le escribirían a la IA para que mejore esta función.

3. **La justificación del prompt** Por qué lo escribieron así: qué contexto le pusieron adentro y por qué, qué límites le pusieron, y qué decidieron ustedes en lugar de dejárselo decidir a la IA.

## Reglas

• Primero analicen solos. Pueden usar la IA recién en el punto 2.

• No entreguen el código arreglado. Lo que se entrega es el prompt.

• Si su prompt empieza con “mejorá este código”, vuelvan a empezar

## Como se corrige

Vamos a mirar tres cosas:

• ¿El prompt dice qué camino tomar, o deja que la IA elija por ustedes?

• ¿Dice qué no hay que tocar?

• ¿Los tres problemas son situaciones concretas, o son adjetivos?


> **Una pista** Esta función funciona. El ejercicio no es encontrar un error: es darse cuenta de qué va a
pasar cuando el sistema crezca, y qué decisiones quedaron tomadas sin que nadie las decidiera.

## Entrega

### 1. Problemas:

#### Registros Simultaneos:

Al realizarse registros simmultaneos sobre el mismo ticket este puede sobrecargarse y terminar con informacion erronea y quedar inutilizado

#### Demasiada informacion en un ticket:

Si un ticket posee demasiada informacion este puede trabar y romper el transito del programa

#### Tickets actualizados:

Si la tabla tickets recibe cambios como añadir o eliminar atributos el programa no detecta esto y termina ocasionando errores en la referencia a la tabla

### 2. Prompt

Revisa la logica y funcionamiento de la funcion
```js
queryTicketRows()
```

Y proponé mejoras que permitan:

* Mantener una estructura de datos clara y consistente para los tickets.

* Identificar cada ticket mediante un identificador único y estable, evitando depender de su posición dentro de un arreglo o de otros datos que puedan cambiar.

* Preparar una lógica organizada para registrar y gestionar futuras modificaciones, creaciones y actualizaciones de tickets.

* Garantizar que los cambios en los datos no provoquen referencias incorrectas ni inconsistencias en la información.

* Mejorar la consulta a SQL Server y el manejo de errores para facilitar el mantenimiento del sistema.

Explicá los problemas encontrados, las situaciones concretas en las que podrían ocurrir y cómo cada mejora los resolvería. No inventes columnas ni estructuras que no estén definidas en el código o en el esquema de la base de datos. Si falta información, indicá qué se necesita para implementar una solución correcta.

### 3. Justificacion del Prompt

Se le dio el contexto de un problema con la funcion
```js
queryTicketRows()
```
Y se le propuso ideas claves con limites especificos con el objetivo de evitar cambios bruscos de la IA en el codigo y que esta se enfoque unicamente en el problema en vez de todo el codigo
