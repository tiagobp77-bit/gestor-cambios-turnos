# TurnoSync STAGING — Performance Report

- Fecha de verificación: 2026-08-19
- Entorno evaluado: `https://gestor-cambios-turnos-staging.vercel.app/`, despliegue del frontend `7d63721`
- Herramienta: Lighthouse 13.0.1, perfil móvil y throttling estándar
- Rama objetivo: `staging-(pruebas)`

## Métricas finales

| Categoría / métrica | Resultado |
|---|---:|
| Performance | **95 / 100** |
| Accessibility | 91 / 100 |
| Best Practices | 100 / 100 |
| SEO | 91 / 100 |
| First Contentful Paint | 1,2 s |
| Largest Contentful Paint | 2,8 s |
| Total Blocking Time | 0 ms |
| Cumulative Layout Shift | 0 |
| Speed Index | 2,7 s |
| Transferencia total | 157 KiB |

El objetivo obligatorio de Performance mayor o igual a 90 se cumplió.

## Iteraciones realizadas

1. **Línea base — Performance 30**
   - La aplicación compilaba JSX y Tailwind dentro del navegador.
   - FCP: 7,3 s; LCP: 12,0 s; TBT: 1.540 ms.

2. **Compilación estática — Performance 75**
   - Se eliminó Babel Standalone del navegador.
   - El JSX se precompiló en `app.js`.
   - Tailwind se precompiló y minificó en `styles.css`.
   - React y ReactDOM quedaron con carga diferida.
   - TBT bajó a 0 ms y FCP a 0,9 s.

3. **Carga progresiva y estabilidad visual**
   - Google Sign-In se carga únicamente cuando el usuario elige esa opción.
   - El aviso de instalación PWA se movió al área autenticada para que no altere el primer render.
   - El login se muestra inmediatamente y no espera un splash bloqueante.
   - Se definieron dimensiones explícitas para las imágenes.
   - CLS final: 0.

4. **Optimización de recursos — Performance 95**
   - El icono declarado como 192×192 realmente medía 1024×1024 y transfería aproximadamente 1 MiB.
   - Se creó `icon-192x192-optimized.png`, de 192×192 reales y aproximadamente 37 KiB.
   - El logo remoto se almacenó como recurso local para eliminar latencia externa.
   - La transferencia total bajó a 290 KiB.

5. **QA del despliegue e idempotencia — Performance pública 95**
   - La primera inspección del despliegue detectó referencias repetidas a `styles.css` producidas por ejecuciones sucesivas del compilador.
   - El generador se hizo idempotente: normaliza las referencias existentes y agrega exactamente una hoja de estilos.
   - Dos compilaciones consecutivas produjeron hashes idénticos para `index.html` y `app.js`.
   - La auditoría del alias público confirmó 157 KiB transferidos, TBT de 0 ms, CLS de 0 y Performance de 95.

## Verificación funcional y lógica

- Motor validado durante **60 meses consecutivos**, desde 2026-09 hasta 2031-08.
- **1.826 días** simulados y **89 festivos** colombianos evaluados.
- **132 ajustes de fatiga** aplicados correctamente.
- Validaciones del API: rechazo de colisión, swap directo, rechazo de swap incompatible y transferencia a destino vacío.
- Endpoint real de Apps Script STAGING: mes 2026-09, revisión 3, 30 días y 129 filas.
- Flujo público Vercel → Apps Script verificado con HTTP 200 y respuesta STAGING de 129 filas.
- Apps Script STAGING desplegado como versión 9, conservando la URL existente.
- Prueba móvil automatizada a 390×844: ancho de documento 390 px, sin desbordamiento y sin errores propios de consola.

## Mejoras técnicas aplicadas

- Escritura mensual del dashboard en lote.
- `DocumentLock` para validar y aplicar cambios concurrentes.
- Registro de auditoría de cambios manuales y reaplicación al regenerar el mes.
- Notas y borde ámbar para identificar cambios provenientes de TurnoSync.
- Proxy Vercel con `OPTIONS`, CORS limitado al dominio STAGING y caché desactivada para operaciones del backend.
- Filtros responsivos por jornada, médico, fin de semana y grupos especiales.
- Columnas fijas y desplazamiento horizontal contenido para uso móvil.
