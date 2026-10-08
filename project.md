# project.md

## Project Name

Premium Real Estate Website with AI Property Assistant

## Project Type

Responsive real estate web application frontend.

## Main Goal

Construir una web moderna y premium para una inmobiliaria de Dubai, preparada para conectarse con un backend real de propiedades y un chatbot inteligente.

La aplicación debe permitir:

- explorar propiedades
- filtrar propiedades
- abrir el detalle de una propiedad
- destacar propiedades seleccionadas
- consultar propiedades mediante un asistente inteligente
- mantener una experiencia premium y coherente en desktop y mobile

El chatbot es una feature central del producto, pero debe desarrollarse como un componente independiente y reutilizable dentro de la web.

---

# Technical Context

El backend ya existe y expone endpoints REST.

Frontend expected stack:

- React
- Vite
- component-based architecture
- reusable components
- responsive design

El frontend debe quedar preparado para consumir estos endpoints:

## Properties API

GET /api/properties

GET /api/properties/featured

GET /api/properties/search

GET /api/properties/:slug

## Chat API

POST /api/chat

POST /api/chat/stream

La lógica real de conexión puede implementarse después, pero la UI y estructura de componentes deben diseñarse pensando en estos endpoints.

---

# Core Application Structure

La aplicación debe contener las siguientes rutas principales:

/
Home

/properties
Properties listing

/properties/:slug
Property detail

/about
About

/contact
Contact

No hace falta implementar autenticación.

---

# Global Layout

Todas las páginas deben compartir:

- Navbar
- Main content
- Footer
- Floating AI Chat Assistant

El chat debe estar disponible globalmente en toda la aplicación.

---

# Navigation

## Main Navbar

Links:

- Home
- Properties
- About
- Contact

Primary CTA:

- Explore Properties
  or
- Talk to an Advisor

Optional secondary CTA:

- Open AI Assistant

Behavior:

- responsive
- sticky or fixed if it fits the visual direction
- mobile menu on smaller screens

---

# HOME PAGE

Route:

/

## Section 1 — Hero

Purpose:
Crear una primera impresión fuerte y premium.

Content:

- large headline
- supporting paragraph
- primary CTA
- secondary CTA
- luxury property visual
- optional badge or trust signal

Suggested headline direction:

"Find a Home Worth Staying For"

or

"Exceptional Homes. Smarter Property Search."

Primary CTA:
Explore Properties

Secondary CTA:
Ask Our AI Assistant

Behavior:

- CTA Explore Properties links to /properties
- AI CTA opens chatbot

---

## Section 2 — Property Search

Purpose:
Permitir al usuario iniciar una búsqueda rápidamente.

Fields:

- location
- property type
- bedrooms
- max budget

Button:
Search Properties

Potential filters:

- Apartment
- Villa
- Townhouse
- Penthouse

Behavior:
The UI must be prepared to send these filters to:

GET /api/properties/search

Example future query:

/api/properties/search?location=Dubai Marina&propertyType=Apartment&minBedrooms=2&maxPrice=2000000

The design must remain clean and premium.

---

## Section 3 — Featured Properties

Purpose:
Mostrar una selección de propiedades destacadas.

Data source:
GET /api/properties/featured

Expected property data:

- slug
- project_name
- price
- bedrooms
- bathrooms
- area_sqft
- address
- property_type
- furnishing
- completion_status
- image_url

Display:
3–6 property cards.

CTA:
View All Properties

---

## Section 4 — Why Choose Us

Purpose:
Explicar propuesta de valor.

Suggested items:

- Curated Properties
- Trusted Guidance
- Smart Property Search
- AI-Powered Assistance

Each item:

- icon
- title
- short description

---

## Section 5 — Property of the Week

Purpose:
Crear una sección editorial y premium.

Layout:

- large image
- strong typography
- project name
- address
- price
- bedrooms
- bathrooms
- area
- CTA

CTA:
Explore Property

This can use a placeholder property initially.

---

## Section 6 — Stats

Example content:

- 60+ curated properties
- 30+ Dubai communities
- premium property categories
- AI-assisted property discovery

Avoid fake exaggerated numbers unless clearly presented as demo data.

---

## Section 7 — How It Works

Suggested steps:

1. Tell us what you're looking for
2. Explore matching properties
3. Compare your options
4. Contact an advisor

Include mention of AI assistance.

---

## Section 8 — Testimonials

3–4 testimonial cards.

Content can be placeholder demo content.

---

## Section 9 — Final CTA

Headline:
"Find Your Next Property"

Actions:

- Browse Properties
- Ask the AI Assistant

---

# PROPERTIES PAGE

Route:

/properties

Purpose:
Allow users to explore the property inventory.

## Header

Include:

- page title
- supporting text
- optional total properties count

---

## Filters

Filters should include:

- location
- property type
- minimum price
- maximum price
- exact bedrooms
- minimum bedrooms
- maximum bedrooms
- bathrooms
- furnishing
- completion status
- sort

Sort options:

- Price: Low to High
- Price: High to Low
- Newest

The layout can simplify the visible filters initially and expose advanced filters when needed.

---

## Results Grid

Render PropertyCard components.

Each card:

- image
- project name
- address
- price in AED
- bedrooms
- bathrooms
- area
- property type
- status
- CTA

CTA:
View Property

---

## Pagination

The backend supports:

page
limit

Display:

- Previous
- page numbers if appropriate
- Next

or a premium "Load More" treatment if preferred visually.

---

## Empty State

If there are no results:

Show:

- clear message
- button to clear filters
- optional button to open AI Assistant

Example:

"No properties matched your search."

CTA:
Ask the AI Assistant

---

# PROPERTY DETAIL PAGE

Route:

/properties/:slug

Data source:

GET /api/properties/:slug

## Hero / Gallery

Include:

- main property image
- optional image thumbnails
- project name
- location
- price

---

## Core Property Information

Display:

- property type
- bedrooms
- bathrooms
- area
- furnishing
- completion status
- handover
- location
- price

Use clean visual info blocks.

---

## Description

Placeholder content can be used until descriptions exist in database.

Keep structure ready for real description field later.

---

## Property Details / Features

Use icons or minimal info items.

Possible fields:

- Bedrooms
- Bathrooms
- Area
- Furnishing
- Status
- Handover

---

## Contact / Conversion Block

Include:

- CTA to contact advisor
- CTA to open AI Assistant

Example:

"Want to know if this property fits your needs?"

Button:
Ask the AI Assistant

---

## Related Properties

Optional section:
3 related properties.

Can use placeholder data initially.

---

# ABOUT PAGE

Route:

/about

Purpose:
Build trust and communicate positioning.

Suggested sections:

## Hero

Short premium positioning statement.

## Our Approach

Explain:

- curated inventory
- personal guidance
- technology-assisted property discovery

## Why Technology Matters

Explain that the platform uses smart search and AI assistance to help users narrow down relevant properties faster.

## Values

- Transparency
- Simplicity
- Personal attention
- Better property discovery

---

# CONTACT PAGE

Route:

/contact

Include:

- title
- supporting copy
- contact form
- email placeholder
- phone placeholder
- office location placeholder
- CTA to use the AI Assistant

Fields:

- Name
- Email
- Phone
- Message

No backend submission logic is required in the first UI generation.

---

# PROPERTY CARD COMPONENT

Create a reusable component:

PropertyCard

Props / expected data:

- slug
- project_name
- price
- bedrooms
- bathrooms
- area_sqft
- address
- property_type
- completion_status
- image_url

States:

- normal
- hover
- loading / skeleton optional

CTA:
View Property

---

# PROPERTY FILTERS COMPONENT

Reusable component:

PropertyFilters

Fields:

- location
- propertyType
- minPrice
- maxPrice
- bedrooms
- minBedrooms
- maxBedrooms
- bathrooms
- furnishing
- completionStatus
- sort

Must support responsive layout.

---

# AI CHAT ASSISTANT

This is a core component.

Component suggestion:

AIPropertyAssistant

The assistant should be globally available.

---

## Collapsed State

Display:

- floating button
- assistant icon
- subtle label or pulse

Suggested label:
"Ask AI"

Position:
bottom-right

---

## Expanded State

Panel should contain:

### Header

- assistant name
- small status indicator
- close/minimize button

Suggested assistant name:
Property Assistant

Optional subtitle:
"Find the right property faster"

---

## Welcome State

Message example:

"Hi! Tell me what kind of property you're looking for and I'll help you explore matching options."

Quick prompts:

- "Show me apartments under 2M AED"
- "I need at least 3 bedrooms"
- "Find furnished properties in Dubai Marina"

---

## Chat Messages

Support:

- user message
- assistant message
- loading state
- streaming assistant response

The frontend will later consume:

POST /api/chat/stream

Messages should visually appear progressively as the stream arrives.

---

## Chat Input

Include:

- text input / textarea
- send button
- optional keyboard send behavior
- disabled/loading state

Placeholder:

"Describe the property you're looking for..."

---

## Assistant Loading State

Possible copy:

- Searching properties...
- Checking available options...
- Looking through listings...

Use subtle animated dots or shimmer.

---

## Property Results Inside Chat

The UI should be prepared to show structured property results.

Each result can appear as a compact card:

- image
- project name
- AED price
- bedrooms
- bathrooms
- area
- location
- CTA

CTA:
View Property

The chat panel should support multiple property results in:

- vertical cards
  or
- small horizontal carousel

---

## Chat Empty Results

If no property matches:

Show:
"No exact matches were found."

Then assistant can suggest:

- raise budget
- change location
- reduce bedrooms

Do not automatically alter criteria.

---

## Chat Error State

Show a friendly message:

"Something went wrong while searching. Please try again."

Do not expose internal server errors.

---

# API LAYER PREPARATION

Frontend should be structured so API calls can live in a dedicated services layer.

Suggested:

src/
services/
propertyApi.js
chatApi.js

Expected responsibilities:

## propertyApi.js

- getProperties()
- getFeaturedProperties()
- searchProperties()
- getPropertyBySlug()

## chatApi.js

- sendChatMessage()
- streamChatMessage()

Do not hardcode API logic inside UI components.

---

# Suggested Component Structure

src/
components/
layout/
Navbar
Footer

    property/
      PropertyCard
      PropertyGrid
      PropertyFilters
      PropertySpecs
      PropertyGallery

    chat/
      ChatLauncher
      ChatPanel
      ChatMessage
      ChatInput
      ChatPropertyCard
      ChatLoadingState

    ui/
      Button
      Badge
      SectionHeader
      EmptyState
      Skeleton

pages/
Home
Properties
PropertyDetail
About
Contact

services/
propertyApi.js
chatApi.js

hooks/
useProperties
usePropertySearch
useChatAssistant

---

# State Requirements

The UI should visually support:

## Properties

- idle
- loading
- success
- empty
- error

## Chat

- closed
- open
- typing
- searching
- streaming
- success
- error

---

# Responsive Requirements

## Desktop

- rich visual layout
- multi-column property grids
- large chat panel
- spacious hero

## Tablet

- reduced columns
- preserved typography hierarchy

## Mobile

- stacked sections
- compact filters
- full-width property cards
- chat panel should become almost full-screen or bottom-sheet style
- navbar should collapse into mobile menu

---

# Accessibility

Ensure:

- sufficient contrast
- clear focus states
- keyboard accessible buttons
- form labels
- semantic headings
- aria-labels where needed

---

# Performance

Prefer:

- reusable components
- lazy-loaded property images
- minimal layout shift
- skeletons during loading
- avoid unnecessary animation

---

# Motion

Use:

- subtle card hover
- smooth chat open/close
- gentle section reveal
- minimal button feedback

Avoid:

- excessive parallax
- heavy animation
- distracting effects

---

# Data Assumptions

The current property inventory contains fields such as:

- slug
- price
- bedrooms
- bathrooms
- area_sqft
- country
- city
- address
- property_type
- purpose
- furnishing
- completion_status
- handover
- project_name
- image_url
- available
- featured

Frontend should primarily expose user-facing fields and avoid surfacing technical/internal identifiers.

---

# Final Output Expectation

Stitch should generate a complete and cohesive frontend experience for the real estate platform.

Priority order:

1. Complete site structure
2. Premium visual quality
3. Strong hero
4. Property discovery flow
5. Reusable property components
6. Professional AI chat component
7. Responsive behavior
8. Clean structure ready for React/Vite integration

The AI assistant should feel like a native part of the real estate product, not a separate support widget.
