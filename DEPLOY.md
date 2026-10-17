# Deploy de real_estate_ai

Preparación para Render (API Express) y Vercel (SPA Vite). Esta tarea solo preparó
código, configuración y documentación: no creó servicios, conectó cuentas ni hizo deploy.
Los pasos siguientes se ejecutan manualmente cuando se decida publicar.

## Requisitos y verificación local

- Ambos paquetes declaran Node `>=22`. Se verificó con **Node 22.23.3**; usar una
  versión actualizada de Node 22, no 22.0: las herramientas de frontend tienen
  requisitos mínimos de versión menor. Seleccionar Node **22.x** en Vercel.
- Instalar dependencias por separado en `backend/` y `frontend/` con `npm install`.
- Copiar cada `.env.example` a `.env` solo en el entorno local y completar los
  valores privados del backend fuera de Git. Los `.env`, `.env.local` y
  `.env.production` de ambos paquetes están ignorados.
- Backend local: `npm run dev`; frontend local: `npm run dev`.
- Backend: `npm test`. Usa fixtures y credenciales ficticias; bloquea peticiones
  externas. La prueba de integración real de Gemini se omite deliberadamente.
- Frontend: `npm test`, `npm run lint`, `npm run build`.
  Para comprobar el build sin una URL definitiva ni secretos:

  ```sh
  cd frontend
  VITE_API_URL=https://backend.example.test/api npm run build
  ```

  Esa URL es ficticia y solo sirve para verificar la compilación. No publicar ese
  bundle. En producción se exige `VITE_API_URL` con HTTPS; el build falla si falta,
  usa HTTP o apunta a localhost. El `.env` local puede contener una URL HTTP, por
  lo que se debe proporcionar explícitamente el valor HTTPS al verificar producción.

## Render: backend

1. Elegir **New → Web Service** e importar el repositorio **real_estate_ai**.
2. Configurar:

   | Campo | Valor |
   | --- | --- |
   | Root Directory | `backend` |
   | Runtime | Node |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Health Check Path | `/api/health` |

3. Configurar las variables obligatorias de la aplicación por nombre, sin
   guardarlas en Git ni compartir sus valores:

   ```text
   NODE_ENV
   SUPABASE_URL
   SUPABASE_SECRET_KEY
   GOOGLE_GENERATIVE_AI_API_KEY
   ```

   `NODE_ENV` debe ser `production`. Reutilizar las credenciales existentes de
   Supabase y Gemini; no cambiar proyectos, modelos, tablas, imágenes o inventario.
   El código usa **SUPABASE_SECRET_KEY**, no `SUPABASE_SERVICE_ROLE_KEY`.
   Es una credencial privada y debe permanecer únicamente en el backend.

4. `FRONTEND_URL` será obligatorio para habilitar el acceso desde el frontend
   publicado. Agregarlo después de conocer la URL de producción de Vercel:

   ```text
   FRONTEND_URL=https://<vercel-production-url>
   ```

   Usar un único origen HTTPS sin rutas, query o fragmento. Se acepta una barra
   final y se normaliza al origen. No se habilitan automáticamente previews de
   Vercel ni comodines. Sin `FRONTEND_URL`, el backend puede arrancar y responder
   health checks, pero no habilita CORS para ningún origen de navegador.

5. Variables opcionales: `GEMINI_MODEL` conserva el valor predeterminado existente
   `gemini-2.5-flash` si no se define. `PORT` lo proporciona Render: no fijarlo a
   3000 en la plataforma. Localmente el valor predeterminado es 3000.

`npm start` ejecuta `node index.js`. `nodemon` se usa solo en `npm run dev`.
El servidor escucha en `0.0.0.0` y `process.env.PORT || 3000`.
`GET /api/health` devuelve HTTP 200 con:

```json
{ "success": true, "status": "ok" }
```

Este endpoint comprueba que el servidor responde: no consulta Supabase ni Gemini.
La aplicación sigue necesitando sus variables de inicialización para arrancar.

## Vercel: frontend

1. Elegir **Import Git repository** e importar **real_estate_ai**.
2. Configurar:

   | Campo | Valor |
   | --- | --- |
   | Root Directory | `frontend` |
   | Framework | Vite |
   | Node.js | 22.x |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |

3. Agregar la única variable de aplicación necesaria al frontend:

   ```text
   VITE_API_URL=https://<render-service>.onrender.com/api
   ```

   Reemplazar el placeholder con la URL real obtenida de Render antes del build.
   Vite incorpora este valor público al bundle durante la compilación: cambiarlo
   requiere un nuevo build/deploy del frontend. Nunca poner claves privadas en
   variables `VITE_*`. No configurar claves de Supabase ni Gemini en Vercel.

4. Tras el primer deploy de Vercel, volver a Render, establecer `FRONTEND_URL`
   con el origen de producción de Vercel y redeployar el backend.

Axios y el `fetch` del chat comparten la misma base configurada; el stream usa
`<VITE_API_URL>/chat/stream`. En desarrollo, si la variable falta, la API usa
`http://localhost:3000/api`. CORS permite localhost y 127.0.0.1 en puertos 5173,
5174 y 4173 únicamente en desarrollo (también cuando `NODE_ENV` no está definido).

`frontend/vercel.json` reescribe las rutas a `/index.html` para que React Router
resuelva `/properties`, `/properties/:slug`, `/about` y `/contact` al abrir o
recargar directamente. El comodín `*` de React Router conserva la página interna
NotFound para rutas desconocidas. Es una SPA: esa página no implica un status
HTTP 404 del servidor. La API apunta directamente a Render y no necesita un proxy
ni redirects en Vercel.

## Orden de deploy

1. Deploy del backend en Render.
2. Obtener su URL: `https://xxxxx.onrender.com`.
3. Probar `https://xxxxx.onrender.com/api/health`.
4. Configurar Vercel con `VITE_API_URL=https://xxxxx.onrender.com/api`.
5. Deploy del frontend.
6. Obtener la URL de producción de Vercel.
7. Volver a Render.
8. Agregar `FRONTEND_URL=<URL Vercel>` (origen HTTPS).
9. Redeploy del backend.
10. Probar el flujo completo de extremo a extremo.

## Checks posteriores al deploy

- **Health:** `GET <render>/api/health` responde 200 y el JSON esperado.
- **Frontend:** abrir Home, Properties, un Detail con slug existente, About y
  Contact. Abrir una ruta desconocida y verificar la página NotFound interna.
- **Chat:** enviar una consulta en español y otra en inglés; verificar texto
  incremental, cards con resultados y navegación con **View Property**.
- **Recarga directa:** abrir y recargar `/about`, `/contact`, `/properties` y
  `/properties/<slug>` con un slug existente. Deben cargar React y la página
  correspondiente, sin la 404 de Vercel.
- **DevTools / Network:** confirmar API y chat contra HTTPS de Render, sin
  solicitudes a localhost, errores CORS ni mixed content. El preflight OPTIONS
  de `/api/chat/stream` debe permitir POST y Content-Type desde el origen Vercel
  configurado; la respuesta debe incluir ese origen en `Access-Control-Allow-Origin`.
- **Streaming:** `POST /api/chat/stream`, `Accept: text/event-stream`, mantiene
  `Content-Type: text/event-stream; charset=utf-8`, `Cache-Control: no-cache,
  no-transform` y `X-Accel-Buffering: no`. Se envían headers inmediatamente y se
  conserva el protocolo existente (`start`, `text-delta`, `properties`, `done`,
  `error`). La cancelación del frontend se transmite con AbortController y la
  desconexión aborta la generación del backend. Verificar recepción progresiva
  en los servicios publicados; las pruebas locales no certifican su red/proxy.

Si se usa el plan gratuito de Render, puede haber cold start y demora inicial.
No se agregaron keep-alives ni cambios de arquitectura.

## Validación realizada y pendientes

Con Node 22.23.3: backend 126 tests aprobados, 1 integración real de Gemini omitida;
frontend 60 tests aprobados; lint y build de producción correctos usando la URL
ficticia indicada arriba. Los tests de health/CORS y streaming no acceden a servicios
externos. Las dependencias conservan sus versiones.

Antes de publicar faltan las URLs definitivas y cargar manualmente las variables
privadas en Render. El build final debe usar la URL real de la API. Los checks
de recarga de rutas y streaming sobre HTTPS en Render/Vercel quedan para después
del deploy; no se ejecutó ninguno de esos deploys en esta preparación.

Referencias oficiales: [Render Web Services](https://render.com/docs/web-services),
[Render Health Checks](https://render.com/docs/health-checks),
[Vite en Vercel y fallback SPA](https://vercel.com/docs/frameworks/frontend/vite),
[Render Free](https://render.com/docs/free).
