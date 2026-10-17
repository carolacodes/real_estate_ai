# Chatbot — Fase 2

Implementación funcional sobre el diseño de Stitch existente. No se cambiaron páginas,
CSS del chat, tokens, dependencias ni endpoints.

## Archivos

Creados:
- `src/api/chatStream.js`: lector SSE incremental.
- `src/hooks/chatAssistantStore.js`: estado de conversación y coordinación del transporte, comprobable sin servicios externos.
- `src/components/chat/chatContent.js`: bienvenida estática y sugerencias, sin resultados ficticios.
- `tests/chat.test.js`: pruebas de estado, transporte, renderizado y enlaces.
- `CHAT.md`: este registro.

Completado el archivo previamente vacío `src/hooks/useChatAssistant.js`.

Modificados:
- `src/api/chat.api.js`.
- `src/App.jsx` y `src/router/AppRouter.jsx`.
- `src/components/chat/AIPropertyAssistant.jsx`, `ChatPanel.jsx`, `ChatInput.jsx`,
  `ChatLauncher.jsx`, `ChatErrorState.jsx` y `ChatPropertyCard.jsx`.
- `../backend/controllers/chat.controller.js`, `../backend/services/chat.service.js`,
  `../backend/tools/searchProperties.tool.js` y `../backend/tests/chat.api.test.js`.

Eliminado `src/components/chat/chatMockData.js`.

## Hook e historial

`useChatAssistant` enlaza React con un store local mediante `useSyncExternalStore`.
La UI agrega inmediatamente el usuario y un assistant vacío. El transporte actualiza
el assistant con cada delta; al finalizar agrega sus propiedades estructuradas.
Los estados son `welcome`, `searching`, `streaming`, `success` y `error`.

Cerrar conserva historial y continúa el stream; cambiar de página tampoco pierde
la conversación. Recargar la página inicia una conversación nueva. Reset aborta,
limpia mensajes/resultados y vuelve a la bienvenida. Desmontar aborta la petición.
Los callbacks de peticiones canceladas no pueden sobrescribir una conversación nueva.
Retry repite el mismo contexto del intento fallido, sin duplicar la pregunta.
Los intentos fallidos no se incluyen en futuras consultas.

El backend recibe exclusivamente `role` y `content`. Se conserva todo el historial
visual en memoria, enviando una ventana reciente ajustada al esquema existente:
hasta 19 mensajes, 20.000 caracteres en total y 4.000 por mensaje. Los textos largos
del assistant se recortan solo en el contexto enviado; la UI muestra el texto completo.
No se persisten datos en almacenamiento local.

## Streaming y cambio mínimo de backend

El endpoint existente solo entregaba texto, y la herramienta omitía las imágenes.
Ahora `POST /api/chat/stream` acepta `Accept: text/event-stream` para entregar:

```text
event: start
data: {}

event: text-delta
data: {"text":"Texto incremental"}

event: properties
data: {"properties":[...]}

event: done
data: {}
```

En caso de fallo entrega `event: error` con un mensaje genérico; no entrega `done`
ni resultados como si la búsqueda hubiera terminado correctamente. La desconexión
aborta el proveedor. Hay un límite de 120 segundos para peticiones pendientes.

Las propiedades vienen de los `tool-result` de la misma ejecución de AI SDK,
deduplicadas por slug; no se realiza una segunda consulta para construir las cards.
La herramienta incluye `image_urls` del inventario. No se fabrican propiedades.

`POST /api/chat` conserva su respuesta JSON; `image_urls` es un campo adicional de
las propiedades. El streaming sin Accept SSE conserva la respuesta original de
texto y sigue funcionando con `curl -N`.

El lector frontend soporta eventos partidos entre paquetes, UTF-8, CRLF, errores,
finalización y cancelación. Un cierre sin `done` produce error y permite retry.
Los componentes no hacen peticiones HTTP directamente.

## Cards y navegación

`ChatPropertyCard` muestra proyecto, ubicación, AED formateado, tipo, dormitorios
(0 = Studio), baños, superficie, furnishing y estado de construcción. Usa
`image_urls[0]` con el placeholder existente de `PropertyImage` si falta o falla.
No inventa yields, etiquetas de verificación ni precios en USD.

`View Property` navega por React Router a `/properties/:slug`. `Schedule Viewing`
navega a `/properties/:slug#inquiry-card`. Ambos cierran el panel conservando la
conversación. El contenedor global espera que cargue el anchor existente para
posicionar la consulta, sin modificar `PropertyDetail`.

La instancia global se movió dentro del BrowserRouter existente para usar Link.
El scroll sigue el texto incremental mientras el usuario está cerca del final;
permite leer mensajes anteriores sin arrastrarlo hacia abajo y muestra el inicio
de las nuevas cards al terminar.

## Validación

Node utilizado: 22.23.3, cargado explícitamente con nvm para ejecuciones fuera del
sandbox (que inicialmente seleccionaba Node 20). No se modificó package.json.

- Frontend: 21 tests aprobados; proveedor mockeado, sin consumir Gemini.
- ESLint: aprobado.
- Build: aprobado con Node 22.
- Backend: 123 tests aprobados y 1 omitido; incluye compatibilidad de texto,
  SSE, imágenes, deduplicación, errores sanitizados y cancelación al desconectar.
  La prueba opt-in de Gemini queda omitida. Las pruebas de propiedades existentes
  pueden consultar el inventario real en modo lectura.

Pruebas manuales en navegador con backend local y proveedor real:

1. `Busco un departamento de 2 habitaciones por menos de 2000000 AED`:
   Samana Waves, Mayfair Tower, Orchid Residence y One Sky Park by IMAN.
   Las cuatro cards cargaron sus imágenes del inventario.
2. `Quiero algo amueblado en Dubai Marina`:
   The Springs 1 y Botanica Tower, con imágenes cargadas y datos reales.
3. `Quiero comprar una propiedad`:
   pregunta aclaratoria por tipo, zona, habitaciones, presupuesto y estado;
   cero cards.

También se comprobó un quick prompt real después de la consulta genérica:
se observó el texto parcial del assistant con `aria-busy=true`, seguido de dos
cards al completar. Se verificaron cierre/reapertura con historial conservado,
reset, navegación a detalle y Schedule Viewing con anchor. Responsive revisado
en 1440, 768, 390 y 320 px; en mobile el input quedó dentro del viewport y no
hubo overflow horizontal.

## Diferencias visuales necesarias

Se mantienen CSS, medidas, spacing, sombras y tipografías. Cambian únicamente
el copy solicitado y los datos reales. Los badges usan furnishing/tipo y estado
reales en lugar de afirmaciones ficticias. La cantidad de cards depende del
inventario; ya no aparecen acciones o respuestas de ejemplo.

No quedan mocks de resultados en producción. Los fixtures están solo en tests.
Esta fase no implementa reservas ni almacenamiento persistente del historial.
