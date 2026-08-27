# TurnoSync STAGING — Performance Report

- Fecha de verificación: 2026-08-27
- Entorno: `https://gestor-cambios-turnos-staging.vercel.app/`
- Rama: `staging-(pruebas)`
- Commit funcional auditado: `22e9b03c968fdbff10573e1009836acda7c08850`
- Despliegue Vercel: `dpl_d8gtDjPDz9YKeSUUjvwPMjPiBFhU` (`READY`)
- Apps Script STAGING: versión 14
- Herramienta: Lighthouse 13, perfil móvil y throttling estándar

## Métricas finales

| Categoría / métrica | Resultado |
|---|---:|
| Performance | **94 / 100** |
| Accessibility | 91 / 100 |
| Best Practices | 100 / 100 |
| SEO | 91 / 100 |
| First Contentful Paint | 1,2 s |
| Largest Contentful Paint | 2,8 s |
| Total Blocking Time | 0 ms |
| Cumulative Layout Shift | 0 |
| Speed Index | 3,9 s |
| Transferencia total | 157 KiB |

El objetivo obligatorio de Performance mayor o igual a 90 se cumplió.

## Verificación funcional y lógica

- Los seis archivos descargados del proyecto Apps Script STAGING coinciden byte por byte con la copia local validada.
- El endpoint real devuelve 32 médicos exclusivamente desde `Setup_Medicos`; no existe fallback operativo hacia `Orden A`.
- El historial expone agosto y septiembre de 2026, con 31/30 días y 129 filas por mes. La revisión vigente del motor es 4.
- La ruta temporal de migración fue retirada del Web App y responde `Acción no reconocida`.
- El flujo Vercel → proxy `/api/apps-script` → Apps Script → Google Sheets respondió HTTP 200 para agosto de 2026.
- El motor pasó 60 meses consecutivos (2026-09 a 2031-08): 1.826 días, 89 festivos y 132 reajustes antifatiga.
- Pasaron las pruebas de rechazo por colisión, swap directo, rechazo de swap incompatible, traslado a destino vacío, descombinación parcial de fin de semana y resolución por ID estable.
- Pasó la simulación de cambio anual: archivo `Turnos_2026`, dos meses preservados, enero reiniciado en la columna F y rango A1:D4 intacto.
- Prueba móvil automatizada a 390×844: ancho del documento de 390 px y cero errores propios de consola.
- Vercel registró cero respuestas 4xx/5xx durante la verificación. Solo aparece una advertencia deprecada de la capa Node de la plataforma sobre `url.parse`; el proxy de TurnoSync ya usa la API estándar `new URL`.

## Iteraciones y optimizaciones aplicadas

1. **Fuente única de personal**
   - Se migraron correo y celular a `Setup_Medicos` y se eliminaron las listas temporales del frontend.
   - Endpoints, notificaciones, recordatorios y resolución de médicos consultan una sola fuente.
   - Los secretos de WhatsApp quedaron en Script Properties y el entorno STAGING conserva el desvío obligatorio al número de prueba.

2. **Historial mensual y archivo anual**
   - Cada mes se escribe en lote a la derecha del anterior y las columnas históricas se ocultan sin borrar datos.
   - Al iniciar enero se archiva el año terminado en `Turnos_YYYY` y el dashboard vuelve a comenzar en F.
   - La hoja oculta `Dashboard_Meses` mantiene el índice consultado por la app.

3. **Motor y concurrencia**
   - Se fijó agosto de 2026 como punto cero y se normalizaron las claves mensuales como texto.
   - Se añadió intercambio antifatiga para disponibilidades nocturnas contiguas alrededor de festivos.
   - Los cambios parciales AM/PM de fin de semana descombinan únicamente el día afectado.
   - Los endpoints de escritura mantienen `DocumentLock`, validación de revisión, auditoría y reaplicación de cambios manuales.

4. **Formato y experiencia móvil**
   - Se preserva A1:D4, se usan bordes negros en toda la cuadrícula y nombres con fuente dinámica entre 6 y 10 pt.
   - Las disponibilidades entre semana usan `#d9d9d9`; solo el código `2` de disponibilidad nocturna es rojo. Sala 2 y EX1/EX2/EX3 permanecen negros.
   - La app agrupa el nombre del médico con `rowSpan`, ofrece navegación histórica y reduce columnas de día a 28 px y filas a 22 px.

5. **Rendimiento web**
   - JSX y Tailwind permanecen precompilados; no se compilan en el navegador.
   - Google Sign-In se carga bajo demanda, los recursos críticos están optimizados y las imágenes tienen dimensiones explícitas.
   - Resultado final: TBT 0 ms, CLS 0, 157 KiB transferidos y Performance 94.
