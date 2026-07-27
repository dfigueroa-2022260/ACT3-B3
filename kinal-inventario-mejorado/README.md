# Kinal Inventario

Sistema de gestión de inventario para la bodega de Fundación Kinal. API REST (Node.js, Express, Prisma) y panel web (Angular) para administrar categorías, productos y movimientos de stock.

---

## Índice

1. [Descripción del proyecto](#descripción-del-proyecto)
2. [Tecnologías utilizadas](#tecnologías-utilizadas)
3. [Estructura de carpetas](#estructura-de-carpetas)
4. [Instalación y ejecución](#instalación-y-ejecución)
5. [Variables de entorno](#variables-de-entorno)
6. [Referencia de la API](#referencia-de-la-api)
7. [Funcionalidades implementadas](#funcionalidades-implementadas)
8. [Problemas encontrados y solución](#problemas-encontrados-y-solución)
9. [Solución de problemas rápida](#solución-de-problemas-rápida)
10. [Mejoras futuras](#mejoras-futuras)

---

## Descripción del proyecto

Kinal Inventario reemplaza el control manual de bodega por un sistema centralizado donde se puede:

- Clasificar productos por categoría.
- Llevar el stock de cada producto, con alerta visual cuando cae en o por debajo del stock mínimo definido.
- Registrar movimientos (entradas y salidas) que actúan como kárdex de la bodega.
- Restringir la creación, edición y eliminación de datos a usuarios autenticados mediante JWT, dejando la consulta disponible sin necesidad de iniciar sesión.

El panel es responsive: se usa igual desde una computadora de escritorio en bodega que desde un teléfono al hacer un conteo físico.

---

## Tecnologías utilizadas

### Backend

| Tecnología | Uso |
|---|---|
| Node.js + Express | Servidor HTTP y enrutamiento REST |
| TypeScript | Tipado estático en toda la API |
| Prisma ORM + PostgreSQL | Acceso a datos y migraciones |
| Zod | Validación de payloads de entrada |
| jsonwebtoken + bcryptjs | Autenticación con JWT y hash de contraseñas |
| cors, dotenv | Middlewares e infraestructura |

### Frontend

| Tecnología | Uso |
|---|---|
| Angular 18 | SPA con standalone components, signals y control flow (`@if`, `@for`, `@switch`) |
| RxJS | Manejo reactivo de las llamadas HTTP |
| CSS con custom properties | Sistema de diseño propio, sin librería de UI de terceros |

### Herramientas

- pnpm como gestor de paquetes (también funciona con npm).
- Angular CLI para build y servidor de desarrollo.

---

## Estructura de carpetas

```
kinal-inventario/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Modelos: Categoria, Producto, Movimiento
│   │   ├── migrations/          # Historial de migraciones de la base de datos
│   │   └── seed.ts              # Datos de ejemplo (categorías y productos base)
│   ├── src/
│   │   ├── config/prisma.ts     # Instancia única de PrismaClient
│   │   ├── controllers/         # Handlers de cada ruta (categoria, producto, movimiento, auth)
│   │   ├── middlewares/         # auth (verificación de JWT) y errorHandler
│   │   ├── routes/              # Definición de endpoints por módulo
│   │   ├── services/            # Lógica de negocio y acceso a datos vía Prisma
│   │   ├── types/               # Esquemas Zod y DTOs por módulo
│   │   ├── scripts/             # Utilidades de línea de comandos (ej. generarHash.ts)
│   │   └── index.ts             # Punto de entrada del servidor Express
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── pages/           # Dashboard, Categorias, Productos, Movimientos, Login
│       │   ├── services/        # Clientes HTTP (categoria, producto, movimiento, auth) e interceptor
│       │   ├── models/          # Interfaces TypeScript de cada entidad
│       │   ├── utils/           # Helpers reutilizables (ej. reloadOnRevisit)
│       │   ├── app.component.*  # Layout raíz: topbar, menú lateral, contenido
│       │   ├── app.routes.ts    # Definición de rutas de la SPA
│       │   └── app.config.ts    # Providers (router, HttpClient, interceptores)
│       └── styles.css           # Sistema de diseño global (tokens, botones, tablas, estados)
│
└── README.md
```

---

## Instalación y ejecución

### Requisitos previos

- Node.js 18 o superior.
- PostgreSQL instalado y corriendo, local o remoto. En Windows, si se instaló con el instalador oficial, pgAdmin viene incluido y es la forma más simple de administrar la base sin usar la terminal.
- pnpm (`npm i -g pnpm`), o usar npm como alternativa.

### 1. Backend

```bash
cd backend
pnpm install
```

Al instalar, pnpm ejecuta automáticamente `prisma generate` mediante el hook `postinstall` definido en `package.json`. Si la versión de pnpm bloquea scripts de instalación de paquetes nativos (aviso `ERR_PNPM_IGNORED_BUILDS`), ejecutar `pnpm approve-builds` y volver a instalar.

Copiar el archivo de variables de entorno y ajustarlo con las credenciales reales de PostgreSQL:

```bash
cp .env.example .env
```

Crear la base de datos y aplicar las migraciones en un solo paso:

```bash
npx prisma migrate dev
```

Si la base indicada en `DATABASE_URL` todavía no existe, Prisma la crea automáticamente, aplica las migraciones y regenera el cliente. No es necesario usar `psql` ni herramientas externas.

Cargar datos de ejemplo (opcional):

```bash
npx prisma db seed
```

Generar el hash de la contraseña del usuario administrador, necesario para `ADMIN_PASSWORD_HASH` en `.env`:

```bash
npx ts-node src/scripts/generarHash.ts tu_password
```

Levantar el servidor:

```bash
pnpm run dev      # modo desarrollo con recarga automática (nodemon)
# — o —
pnpm run build && pnpm start   # compila a dist/ y ejecuta la versión compilada
```

La API queda disponible en `http://localhost:4021/api` (ruta de salud: `GET /api/health`).

### 2. Frontend

```bash
cd frontend
pnpm install
pnpm start
```

Angular sirve la aplicación en `http://localhost:4200`. La URL de la API se configura en `src/environments/environment.ts` (por defecto apunta a `http://localhost:4021/api`).

---

## Variables de entorno

Definidas en `backend/.env` (usar `backend/.env.example` como plantilla):

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL | `postgresql://postgres:postgres@localhost:5432/kinal_inventario?schema=public` |
| `PORT` | Puerto donde escucha la API | `4021` |
| `JWT_SECRET` | Secreto para firmar los tokens JWT | cualquier cadena larga y aleatoria |
| `JWT_EXPIRES_IN` | Vigencia del token | `8h` |
| `ADMIN_EMAIL` | Correo del usuario administrador para login | `admin@kinal.edu.gt` |
| `ADMIN_PASSWORD_HASH` | Hash bcrypt de la contraseña del administrador | generado con `src/scripts/generarHash.ts` |

---

## Referencia de la API

Prefijo base: `http://localhost:4021/api`. Las rutas marcadas como protegidas requieren el encabezado `Authorization: Bearer <token>`, obtenido en `/auth/login`.

| Método | Ruta | Protegida | Descripción |
|---|---|---|---|
| GET | `/health` | No | Verifica que el servidor esté activo |
| POST | `/auth/login` | No | Inicia sesión (`{ correo, password }`) y devuelve un JWT |
| GET | `/categorias` | No | Lista todas las categorías con conteo de productos |
| GET | `/categorias/:id` | No | Obtiene una categoría por id |
| POST | `/categorias` | Sí | Crea una categoría |
| PUT | `/categorias/:id` | Sí | Actualiza una categoría |
| DELETE | `/categorias/:id` | Sí | Elimina una categoría (falla si tiene productos asociados) |
| GET | `/productos` | No | Lista todos los productos con su categoría |
| GET | `/productos/stock-bajo` | No | Lista productos con stock en o por debajo del mínimo |
| GET | `/productos/:id` | No | Obtiene un producto por id |
| POST | `/productos` | Sí | Crea un producto |
| PUT | `/productos/:id` | Sí | Actualiza un producto |
| DELETE | `/productos/:id` | Sí | Elimina un producto |
| GET | `/movimientos` | No | Lista todos los movimientos |
| GET | `/movimientos/producto/:productoId` | No | Lista movimientos de un producto específico |
| POST | `/movimientos` | Sí | Registra un movimiento (entrada/salida) y ajusta el stock |

---

## Funcionalidades implementadas

- Panel principal (Dashboard): resumen con el total de categorías, productos y movimientos, con accesos directos a cada módulo.
- Categorías: listado, creación, edición y eliminación, bloqueada esta última si la categoría tiene productos asociados.
- Productos: listado con su categoría, precio, stock actual y stock mínimo; el stock se resalta en rojo cuando está en o por debajo del mínimo. Endpoint dedicado para consultar solo los productos con stock bajo.
- Movimientos: historial de entradas y salidas por producto, con fecha y motivo, diferenciadas visualmente por color.
- Autenticación: login con correo y contraseña, JWT almacenado en `localStorage` y adjuntado automáticamente a las peticiones mediante un interceptor HTTP. Las operaciones de escritura están deshabilitadas en la interfaz y protegidas en el backend cuando no hay sesión activa.
- Recarga fiable de datos: cada página vuelve a pedir sus datos al backend tanto al entrar por primera vez como al volver a hacer clic en su enlace del menú, incluso si una carga anterior falló.
- Estados de carga y error no destructivos: mientras se cargan los datos se muestra un skeleton en la tabla en lugar de una pantalla en blanco, y los errores se muestran como una franja superior con botón de reintento, sin ocultar el resto del contenido.
- Diseño responsive: menú lateral fijo en escritorio y menú deslizable con superposición (overlay) en pantallas angostas.
- Manejo de errores centralizado: middleware único (`errorHandler`) que traduce errores de Zod, de Prisma y errores de aplicación (`AppError`) a respuestas JSON consistentes con el formato `{ ok, mensaje }`.

---

## Problemas encontrados y solución

Durante el desarrollo y la puesta en marcha del proyecto se identificaron y corrigieron los siguientes problemas. Se documentan con detalle porque varios de ellos son representativos de errores comunes al trabajar con Angular, Prisma y pnpm, y sirven de referencia si vuelven a presentarse.

### 1. El botón "Categorías" no respondía tras un error previo

**Síntoma:** después de que una carga de datos fallaba (por ejemplo, con el backend caído), volver a hacer clic en "Categorías" en el menú no producía ningún efecto visible; la pantalla quedaba congelada mostrando el mensaje de error anterior.

**Causa:** Angular reutiliza el componente activo cuando el usuario navega otra vez hacia la misma ruta y, por diseño, no vuelve a ejecutar `ngOnInit` en ese caso. Como la carga de datos ocurre en `ngOnInit`, una carga fallida dejaba el componente en su último estado sin posibilidad de refrescarse mediante el menú.

**Solución:** se configuró el router de Angular con `onSameUrlNavigation: 'reload'` en `app.config.ts`, y se creó un helper reutilizable, `reloadOnRevisit()`, que se suscribe a los eventos de navegación y vuelve a ejecutar la carga de datos cada vez que el usuario re-visita la misma ruta. Se aplicó de forma consistente en las cuatro páginas con datos: Dashboard, Categorías, Productos y Movimientos.

### 2. El panel Dashboard existía en el código pero nunca se mostraba

**Síntoma:** la aplicación no tenía una pantalla de inicio real; al abrirla se mostraba directamente el listado de categorías.

**Causa:** el componente `DashboardPageComponent` estaba completamente implementado, con su propia plantilla y estilos, pero nunca se había registrado en `app.routes.ts` ni se había añadido un enlace hacia él en el menú lateral. La ruta raíz redirigía directamente a `/categorias`.

**Solución:** se agregó la ruta `/dashboard`, se configuró como página de inicio (`redirectTo: 'dashboard'`) y se incorporó al menú de navegación con su propio ícono, quedando así como punto de entrada natural de la aplicación con accesos directos a cada módulo.

### 3. Toda la vista desaparecía ante cualquier error o durante la recarga

**Síntoma:** al ocurrir un error de red, o simplemente mientras se volvían a cargar los datos, el formulario y la tabla completos desaparecían de la pantalla y eran reemplazados por un mensaje de error o de carga.

**Causa:** cada página ocultaba todo su contenido detrás de una única condición (`@if (!loading() && !error())`), de modo que cualquier error transitorio hacía perder de vista el formulario y los datos que ya se habían cargado previamente.

**Solución:** se separó el estado de error a una franja independiente (`error-box`) que se muestra en la parte superior de la página sin ocultar el resto de la interfaz, y se sustituyó el mensaje de "Cargando..." por filas de tipo skeleton en la tabla, de modo que el usuario nunca ve la pantalla completamente vacía.

### 4. Duplicación de estilos de botones, tarjetas y tablas en cada página

**Síntoma:** cada componente definía su propio CSS local para elementos visuales que se repetían en todas las páginas (botones, tarjetas, tablas, mensajes de estado), lo que dificultaba mantener consistencia visual y aumentaba el código a mantener.

**Causa:** ausencia de un sistema de diseño compartido; cada página había sido desarrollada de forma independiente.

**Solución:** se creó un sistema de diseño centralizado en `styles.css`, con variables (tokens) de espaciado, radios de borde y sombras, además de clases reutilizables (`.btn`, `.card`, `.badge`, `.error-box`, `.skeleton`, entre otras) que ahora son consumidas por todos los componentes, eliminando la duplicación.

### 5. `pnpm start` fallaba con "Cannot find module '.prisma/client/default'"

**Síntoma:** después de ejecutar `pnpm install` y compilar el backend, al ejecutar `pnpm start` la aplicación fallaba inmediatamente con un error de módulo no encontrado dentro de `@prisma/client`.

**Causa:** `pnpm install` no genera automáticamente el cliente de Prisma; ese cliente se construye mediante el comando `prisma generate` a partir del esquema (`schema.prisma`), y ese paso se estaba omitiendo.

**Solución:** se agregó el script `"postinstall": "prisma generate"` en `backend/package.json`, de modo que el cliente de Prisma se genera automáticamente cada vez que se instalan las dependencias, sin necesidad de recordar ejecutar el comando por separado.

### 6. La API respondía con error 500 en todas las páginas

**Síntoma:** el frontend cargaba correctamente pero todas las páginas mostraban "Error interno del servidor" y los contadores del Dashboard permanecían en cero.

**Causa:** revisando el registro de errores del backend se identificó un `PrismaClientInitializationError` con el mensaje `Database (not available) does not exist on the database server at localhost:5432`. La base de datos indicada en `DATABASE_URL` nunca había sido creada en PostgreSQL; Prisma puede crear tablas dentro de una base existente, pero no crea la base de datos por sí sola al ejecutar consultas.

**Solución:** se ejecutó `npx prisma migrate dev`, comando que detecta que la base no existe, la crea automáticamente, aplica las migraciones pendientes y regenera el cliente, todo en un solo paso y sin necesidad de herramientas externas como `psql`.

### 7. El proyecto no funcionaba al copiar `node_modules` entre computadoras

**Síntoma:** al entregar el proyecto con la carpeta `node_modules` ya instalada, para evitar el paso de instalación, la aplicación fallaba en la máquina de destino con errores de módulos no encontrados o rutas inexistentes.

**Causa:** dos factores combinados. Primero, pnpm en Windows genera enlaces internos que apuntan a rutas absolutas de la carpeta donde se instalaron originalmente las dependencias; al mover el proyecto a otra ubicación o computadora, esos enlaces quedan rotos. Segundo, los binarios del motor de Prisma son específicos para cada sistema operativo, por lo que un `node_modules` instalado en un entorno Linux no es válido en Windows, y viceversa.

**Solución:** se estableció como práctica excluir siempre `node_modules` de cualquier entrega del proyecto. Cada máquina debe ejecutar su propio `pnpm install`, lo que garantiza rutas y binarios correctos para ese sistema operativo específico, complementado por el hook `postinstall` del punto 5, que además regenera el cliente de Prisma automáticamente.

### 8. Instalación de dependencias bloqueada con `ERR_PNPM_IGNORED_BUILDS`

**Síntoma:** al ejecutar `pnpm install` en el frontend, la instalación terminaba con una advertencia indicando que se habían ignorado scripts de construcción de varios paquetes (esbuild, lmdb, msgpackr-extract), lo que podía dejar dependencias internas de Angular sin compilar correctamente.

**Causa:** versiones recientes de pnpm bloquean por seguridad, de forma predeterminada, la ejecución de scripts de instalación (`postinstall`) de paquetes de terceros hasta que el usuario los apruebe explícitamente.

**Solución:** se documentó el uso del comando `pnpm approve-builds`, que permite seleccionar y aprobar de forma interactiva los paquetes cuyos scripts de construcción deben ejecutarse, tras lo cual se repite `pnpm install`.

---

## Solución de problemas rápida

Referencia breve para los errores más comunes descritos en la sección anterior.

**"Cannot find module '.prisma/client/default'" al ejecutar pnpm start**
Ejecutar `npx prisma generate` dentro de `backend/` y reiniciar el servidor.

**Error 500 o mensaje "Database (not available) does not exist"**
La base de datos indicada en `DATABASE_URL` no existe todavía. Ejecutar `npx prisma migrate dev` desde `backend/`; Prisma la crea automáticamente.

**"ERR_PNPM_IGNORED_BUILDS" al instalar dependencias**
Ejecutar `pnpm approve-builds`, aprobar los paquetes listados y volver a ejecutar `pnpm install`.

**El comando "ng" o "psql" no se reconoce en la terminal**
No están agregados al PATH del sistema. Para Angular, usar `npx ng ...` o los scripts definidos en `package.json` (`pnpm start`, `pnpm run build`) en lugar de invocar `ng` directamente. Para PostgreSQL, usar pgAdmin como alternativa gráfica a `psql`.

**El login falla aunque el correo y la contraseña parezcan correctos**
Verificar que `ADMIN_PASSWORD_HASH` en `.env` corresponda al hash generado con `npx ts-node src/scripts/generarHash.ts tu_password`, y que `ADMIN_EMAIL` coincida exactamente con el correo ingresado en el formulario.

---

## Mejoras futuras

- Paginación y búsqueda o filtrado en las tablas de productos y movimientos, que actualmente cargan el listado completo.
- Confirmaciones de eliminación mediante un modal propio en lugar del `confirm()` nativo del navegador.
- Roles de usuario, por ejemplo lectura frente a administración, en lugar de un único usuario administrador.
- Exportación de reportes de inventario y movimientos a Excel o PDF.
- Pruebas automatizadas: unitarias en los servicios del backend y de extremo a extremo en los flujos críticos del frontend.
- Notificaciones, por push o correo electrónico, cuando el stock de un producto cae por debajo del mínimo.
- Internacionalización (i18n) en caso de que el sistema se utilice fuera de Guatemala.

---

