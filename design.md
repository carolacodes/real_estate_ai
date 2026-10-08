# design.md

## Project

Premium Real Estate Website + AI Chat Assistant UI

## Goal

Diseñar una web completa para una inmobiliaria moderna y premium, con una fuerte dirección visual editorial/luxury y con un chatbot inteligente integrado como componente visual del producto.

La web debe servir como base para conectar luego con un backend real de propiedades y un asistente inteligente.

---

## Design Direction

### Core inspiration

- **Homelytics**
  - inspiración principal para la estética general
  - look premium, limpio, sofisticado
  - muy buen balance entre modernidad, confianza y elegancia
- **Alveo**
  - inspiración principal para el hero
  - hero amplio, fuerte, con sensación luxury/editorial
  - gran jerarquía de título y CTA claros

### Visual personality

- Premium
- Modern
- Elegant
- Editorial
- Refined
- Trustworthy
- Minimal but rich

### Avoid

- look genérico de template barato
- demasiados colores saturados
- diseño “corporativo duro”
- componentes toscos
- chat widget genérico tipo plugin común

---

## Brand Feel

La marca debe sentirse:

- aspiracional
- tecnológica
- confiable
- exclusiva pero clara
- moderna sin perder calidez

---

## Color Direction

No hace falta replicar exactamente una paleta hexadecimal específica, pero sí seguir una dirección visual inspirada en Homelytics:

- base neutra y elegante
- alto contraste limpio
- uso de tonos claros/oscuros sofisticados
- acentos sutiles y premium
- evitar colores chillones
- la paleta debe acompañar un producto premium de real estate

### Suggested mood

- fondos claros o suaves en algunas secciones
- contrastes oscuros premium en hero, navbar o bloques destacados
- acento refinado para CTAs y elementos interactivos

---

## Typography

Tomar como referencia el estilo tipográfico de Homelytics:

- sans serif moderna y refinada
- títulos con fuerte presencia visual
- subtítulos limpios
- body text claro y elegante
- excelente jerarquía visual

### Typography rules

- headings grandes, elegantes y con mucho aire
- line-height cómodo
- peso tipográfico bien escalonado
- evitar fuentes demasiado tech o demasiado decorativas

---

## Layout Principles

- mucho aire visual
- grid limpio
- spacing generoso
- composición editorial
- equilibrio entre imágenes, texto y bloques de contenido
- secciones amplias y bien respiradas

### General spacing

- secciones con padding generoso
- buen uso de whitespace
- cards con padding cómodo
- evitar densidad excesiva

---

## UI Components

### Navbar

Debe ser premium, simple y clara.

Include:

- logo / brand name
- links: Home, Properties, About, Contact
- CTA principal (ej: “Talk to an Advisor” o “Explore Properties”)
- posible acceso rápido al chat

Style:

- limpia
- elegante
- sticky opcional
- fondo sólido o blur premium según convenga

---

### Hero

Debe inspirarse principalmente en Alveo.

#### Hero goals

- causar impacto visual inmediato
- comunicar valor premium
- transmitir exclusividad y confianza
- introducir la propuesta del sitio

#### Hero content

- headline grande y fuerte
- subheadline clara
- CTA primary
- CTA secondary
- imagen o composición visual protagonista
- opcional: métricas rápidas o badge de confianza

#### Hero tone

- editorial
- premium
- aspiracional
- moderno

---

### Search Section

Sección de búsqueda rápida de propiedades.

Include:

- search/filter UI elegante
- campos como:
  - location
  - property type
  - bedrooms
  - budget
- botón principal de búsqueda

Style:

- bloque premium
- visualmente limpio
- componentes suaves y refinados

---

### Property Cards

Las cards son clave.

Each card should include:

- image
- property title/project name
- location
- price
- bedrooms
- bathrooms
- area
- CTA “View Property”

Style:

- premium
- limpia
- buena jerarquía
- hover elegante
- sin sobrecarga visual

---

### Featured Properties

Sección destacada en Home.

Goals:

- mostrar propiedades premium
- generar deseo
- destacar la calidad de la oferta

Style:

- grid o carrusel refinado
- cards más visuales
- spacing generoso

---

### Property of the Week

Bloque destacado tipo editorial.

Include:

- gran imagen
- nombre de propiedad
- location
- price
- features
- CTA

Debe sentirse como una sección muy premium.

---

### Why Choose Us / Benefits

Bloque de beneficios o propuesta de valor.

Possible items:

- curated listings
- expert guidance
- trusted transactions
- premium service
- AI-powered assistance

Style:

- íconos sutiles
- textos cortos
- layout limpio

---

### Stats Section

Bloque de métricas de confianza.

Examples:

- properties listed
- happy clients
- transactions closed
- years of experience

Style:

- elegante
- simple
- sin sobredecoración

---

### Testimonials

Sección de testimonios.

Style:

- premium
- confiable
- layout limpio
- idealmente con imagen/avatar sutil o quote styling elegante

---

### Footer

Include:

- navegación
- contacto
- redes si hace falta
- CTA final
- branding

Debe sentirse consistente con el sitio y no ser un footer genérico.

---

## Pages

### Home

Sections:

1. Navbar
2. Hero
3. Search block
4. Featured properties
5. Benefits / why choose us
6. Property of the week
7. Stats
8. Testimonials
9. CTA
10. Footer

---

### Properties Page

Purpose:

- mostrar catálogo
- permitir explorar propiedades

Include:

- page hero / heading
- filters
- grid de cards
- estado vacío
- paginación o load more

The layout must feel premium and organized.

---

### Property Detail Page

Purpose:

- mostrar una propiedad en profundidad

Include:

- main gallery
- title
- location
- price
- specs
- description
- amenities/features
- contact CTA
- CTA para abrir el chat

The page must balance beauty and clarity.

---

### About Page

Purpose:

- construir confianza
- explicar el diferencial

Include:

- story / positioning
- values
- service quality
- tech-enabled approach
- maybe team or expertise

---

### Contact Page

Purpose:

- conversión
- facilitar contacto

Include:

- form
- contact details
- section to encourage chat usage
- map placeholder optional

---

## Chat Assistant UI

### Goal

Diseñar un chat que se vea premium, profesional y completamente integrado con la marca.

### Chat entry point

- floating button at bottom-right
- refined styling
- premium interaction
- visible but not invasive

### Chat panel

Include:

- header with assistant title
- welcome message
- message list
- user bubbles
- assistant bubbles
- input area
- send button
- typing/searching state
- optional quick suggestions

### Style

- visually aligned with site
- clean
- elegant
- premium
- modern
- not like a cheap support widget

### Optional UI states

- default collapsed
- expanded open state
- loading state
- empty state
- results suggestion state

---

## Frontend Structure Intent

La UI debe quedar preparada para conectarse luego con estos endpoints:

- GET /api/properties
- GET /api/properties/featured
- GET /api/properties/search
- GET /api/properties/:slug
- POST /api/chat
- POST /api/chat/stream

No implementar la lógica del backend acá, pero sí diseñar el frontend contemplando estos flujos.

---

## Responsive Behavior

Must be fully responsive.

### Desktop

- layout amplio
- hero fuerte
- múltiples columnas
- cards bien distribuidas

### Tablet

- simplificar grids
- mantener jerarquía

### Mobile

- navegación clara
- filtros accesibles
- hero adaptado
- chat usable
- cards compactas pero premium

---

## Motion / Interaction

Usar microinteracciones sutiles:

- hover states elegantes
- transiciones suaves
- feedback visual refinado
- animaciones discretas

No exagerar motion.

---

## Content Tone

El copy debe sonar:

- premium
- confiable
- moderno
- realista
- aspiracional

Evitar copy genérico, robótico o muy “template”.

---

## Build Priorities

1. Dirección visual premium correcta
2. Hero fuerte
3. Property cards elegantes
4. Pages coherentes
5. Chat UI premium
6. Responsive polish

---

## Final Expectation

El resultado debe sentirse como una marca premium de real estate con asistencia inteligente integrada.
Debe estar claramente inspirada en la sofisticación visual de Homelytics y en el hero de Alveo, sin copiar literalmente, manteniendo una identidad propia, moderna y muy bien resuelta.
