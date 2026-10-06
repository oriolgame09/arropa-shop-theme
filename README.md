# Arropa Luxe — tema de Shopify

Tema para **arropa.shop**: limpio y lujoso, fresco pero atrevido. Marfil, azul noche y azul cielo como base, burdeos como acento, titulares editoriales en serif (Fraunces) y texto en Inter. Todo en español.

## Cómo conectarlo a tu tienda

### Opción A — Desde GitHub (recomendada)
1. Shopify Admin → **Tienda online → Temas → Añadir tema → Conectar desde GitHub**.
2. Autoriza GitHub y elige el repositorio `oriolgame09/arropa-shop-theme` y la rama `main`.
3. Se creará un tema nuevo sin tocar el actual. Pulsa **Personalizar** para revisarlo y **Publicar** cuando te guste.

### Opción B — Con Shopify CLI
```bash
npm i -g @shopify/cli

shopify theme push --store arropa.myshopify.com --unpublished
```

### Opción C — Zip
Comprime el contenido de este repositorio (sin la carpeta `.git`) y súbelo en **Temas → Añadir tema → Subir archivo zip**.

## Después de subirlo
- **Portada → Personalizar**: sube la foto del koala en la sección *Portada* (formato vertical 4:5) y elige la colección en *Colección destacada*.
- **Menús**: el tema usa `main-menu` (cabecera y columna 1 del pie) y `footer` (columna 2). Créalos en *Contenido → Menús* con Inicio, Catálogo y Contacto.
- **Ajustes del tema**: logo, favicon, colores y redes sociales.
- **Textos a revisar**: las respuestas de las preguntas frecuentes de la portada son una propuesta; ajusta duración del calor y cuidado de la funda a lo que prometáis.

## Estructura
- `sections/`: portada, cinta de mensajes, barra de confianza, pasos, colección destacada, FAQ, cabecera, pie y las secciones de producto, colección, cesta, búsqueda, páginas y 404.
- `templates/`: plantillas JSON (editables desde el personalizador) y `customers/` para las cuentas.
- `assets/theme.css`, `assets/theme.js`: estilos y comportamiento (menú móvil, variantes, cantidad, animaciones suaves).
