# Preparación de imágenes de propiedades

Esta etapa **solo consulta Supabase y escribe archivos locales de planificación**.
No genera imágenes, no accede a Storage y no actualiza `image_urls`.
Usa Node 22, las dependencias existentes y `libs/supabase.js`, con las variables
server-side del backend. No copiar credenciales al frontend.

Desde `backend/`:

```sh
node scripts/preparePropertyImages.js --plan-only
node scripts/preparePropertyImages.js --slug <slug-featured-real>
node scripts/preparePropertyImages.js --featured-only
node scripts/preparePropertyImages.js --all
```

Piloto preparado inicialmente con el inventario real:

```sh
node scripts/preparePropertyImages.js --slug the-springs-1-apartment-3
```

Se eligió por ser featured, Furnished y Ready, para comparar con la estética
de los interiores piloto sin amueblar artificialmente un inmueble Unfurnished.
No se prepararon lotes en esta etapa.

Sin argumentos también hace únicamente el manifiesto. Los modos son excluyentes.
Cada ejecución lee las propiedades actuales con SELECT paginado, valida slugs
y escribe `data/property-image-plan.json` con el inventario completo. Los totales
se calculan desde los datos: 6 featured + 54 estándar implican 78 imágenes,
pero esos números no están fijados en el código. `featured === true` asigna 4;
`false` asigna 1. Un slug desconocido o valor de featured inválido provoca error.

## Prueba controlada

1. Ejecutar `--plan-only` y elegir un slug de la lista featured mostrada.
2. Ejecutar `--slug <slug>` para preparar **solo esa propiedad**.
3. Revisar los cuatro prompts completos en terminal y en
   `data/property-image-prompts/<slug>.json`.
4. Aprobar el concepto y, en una etapa posterior, generar únicamente ese set.
   Revisar exterior e interiores y usar las primeras imágenes aprobadas como
   referencias de continuidad para las siguientes. No escalar antes de revisar
   la propiedad piloto completa.

`--featured-only` prepara sets de prompts para las featured; `--all` para todas.
Ninguno genera imágenes. Esta implementación no conecta un proveedor de generación
ni convierte PNG a WebP; esos pasos se decidirán después de validar el piloto.

## Referencias y prompts

Las cuatro referencias originales suministradas están copiadas, sin alteración,
en `data/property-image-references/`: `exterior.png`, `living.png`, `bedroom.png`
y `kitchen.png`. Son archivos locales ignorados por Git. En otro equipo habrá que
copiarlas a esas rutas. Los paths del manifiesto y prompt sets son relativos a
`backend/`. Los JSON contienen paths de referencia, no las imágenes incrustadas;
un generador futuro deberá adjuntar los archivos correspondientes explícitamente.

`utils/property-image-prompts.js` establece paleta cálida y neutra, luz natural,
texturas realistas, composición 4:3, sin texto, logos ni marcas de agua. Usa datos
reales, adapta el exterior al tipo de propiedad, respeta Studio y área total,
deja interiores vacíos si es Unfurnished e identifica Off-Plan como concepto.
Los cuatro prompts comparten slug y criterio visual. El rol 04 elige cocina
(kitchenette para Studio), dentro de `kitchen_or_bath`.

Las referencias aportan estética, **no pruebas sobre la propiedad**. No se copian
piscinas, balcones, skyline, vistas al mar, distribución o amenities. El dataset
no verifica fachadas, planos ni acabados: las futuras imágenes serán ilustraciones
conceptuales para revisión, no fotografías auténticas del proyecto nombrado.
Antes de publicarlas, revisar su fidelidad y comunicar su carácter ilustrativo.

## Archivos esperados y upload posterior

```text
data/property-images/<slug>/01.webp  exterior / hero
data/property-images/<slug>/02.webp  living (solo featured)
data/property-images/<slug>/03.webp  bedroom / sleeping zone (solo featured)
data/property-images/<slug>/04.webp  kitchen (solo featured)
```

La preparación crea carpetas vacías solo para los slugs seleccionados. No agrega
imágenes falsas ni `.gitkeep` dentro de ellas. Los prompts quedan fuera de
`property-images/` porque el uploader rechaza archivos ajenos a 01–04.webp.
Repetir la preparación reemplaza el plan/prompts, pero no toca imágenes existentes.
Los manifiestos, prompts y referencias generados/locales están ignorados por Git.

**No ejecutar uploads en esta etapa.** Cuando existan WebP reales aprobados,
el flujo existente sigue siendo, desde `backend/`:

```sh
node scripts/uploadPropertyImages.js --dry-run
# Solo después de revisar el dry-run y autorizar el upload:
node scripts/uploadPropertyImages.js
```

El uploader existente procesa todas las carpetas con imágenes disponibles:
para un piloto, mantener archivos reales únicamente en la carpeta del piloto.
Valida WebP, slugs y orden, sube con upsert y actualiza solamente `image_urls`
tras completar las subidas de una propiedad. No impone la regla featured/estándar:
revisar los conteos contra el manifiesto antes de usarlo. No se cambió ese script.

## Verificación local sin servicios reales

```sh
node --test tests/prepare-property-images.test.js tests/upload-property-images.test.js
```

Los tests utilizan datos, directorios temporales y Supabase mockeados. No llaman
a un generador ni suben archivos o modifican propiedades reales.
