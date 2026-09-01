# Relevamiento de features desarrollados desde 01/03/2026

## Criterio de relevamiento

Este relevamiento se armó a partir de:

- `git log --since=2026-03-01`, excluyendo merges para identificar unidades de trabajo.
- Inspección de diffs y archivos actuales en `back/src/modules`, `front/src/modules`, `arch/src`, `docs` y tests.
- Cruce con `docs/project-overview.md`, `docs/module-mail.md` y `docs/module-mail-script.md`.

No se listan como features los commits puramente de build, salvo cuando el build acompañaba una funcionalidad ya registrada en código fuente. Los commits tienen mensajes poco granulares, por eso varias funcionalidades se separan en tickets independientes aunque hayan nacido en el mismo commit.

## Resumen ejecutivo por módulo

| Módulo | Foco principal del desarrollo |
| --- | --- |
| Mail | Gestión operativa de casillas compartidas, sesiones de operadores, respuestas/reenvíos, adjuntos, clasificación IA, supervisión y UX de atención. |
| Transferencias | Procesamiento de mails como transferencias, extracción IA/fallback, auditoría humana por sesiones, pagadores, exportación Excel y vínculo con mail. |
| Bajas / Bonificaciones | Alta, gestión, dashboard, exportación y reglas de edición para bonificaciones del área de bajas. |
| Traspasos internos | Nuevo módulo de bonificaciones por traspaso interno, dashboard, exportación y validación de adjuntos bancarios. |
| Llamados / WhatsApp | Gestión de listados de llamada, intentos, dashboard, búsqueda/exportación y envío/trazabilidad de WhatsApp por plantilla. |
| Afilmed / Padrón | Administración e importación de padrón Afilmed/Premedic. |
| Cobranzas / Convenios | Gestión de convenios, carga múltiple, dashboard, filtros/exportación y permisos por grupo. |
| Recovery / Administración | Backup/restore de base de datos y archivos, roles/permisos, selección de proveedor IA y documentación. |

---

## Mail / Gestión de casillas compartidas

### Implementar modelo integral de casillas de mail gestionables

**Descripción:** Se incorporó el dominio de mailboxes, correos entrantes, correos salientes y sesiones de atención para que una casilla corporativa pueda operar dentro del sistema como cola de trabajo compartida. Esto resuelve la falta de trazabilidad y evita operar directamente desde webmail sin asignación ni métricas.

**Evidencia:** commits `f8d28a4`, `5345806`, `0d77035`; archivos `back/src/modules/mail`, `front/src/modules/mail`.

### Configurar conexión IMAP/POP/SMTP por mailbox

**Descripción:** Se agregaron campos y pantallas para parametrizar servidores de entrada y salida, credenciales, TLS, puerto y protocolo de procesamiento. Aporta autonomía para conectar distintas casillas corporativas sin tocar código.

**Evidencia:** commits `f8d28a4`, `8bff508`; `IMailbox`, `MailboxCrud`, `InboundEmailMailboxProvider`.

### Sincronizar correos entrantes desde casillas configuradas

**Descripción:** Se implementó el proceso de lectura de correos entrantes por mailbox, con endpoint manual y soporte para ejecución automática. Permite convertir emails recibidos en casos gestionables dentro de la plataforma.

**Evidencia:** commits `f8d28a4`, `a0ef4de`, `11c1a7f`; rutas `InboundEmailMailboxRoutes`, página `InboundEmailSyncPage`.

### Evitar duplicados en sincronización de mails

**Descripción:** Se incorporó control por `messageId`/UID y registro visible de correos duplicados omitidos. Evita crear múltiples gestiones por el mismo correo y mejora la auditoría de sincronización.

**Evidencia:** commits `a0ef4de`, `11c1a7f`; `InboundEmailMailboxProvider`, repositorios de `InboundEmail`.

### Ordenar procesamiento de correos por antigüedad

**Descripción:** Se ajustó el orden de lectura/procesamiento para trabajar de correos más antiguos a más nuevos. Esto mejora la lógica operativa en bandejas acumuladas.

**Evidencia:** commit `80d701a`.

### Agregar almacenamiento de adjuntos entrantes

**Descripción:** Se agregó soporte para guardar adjuntos de emails entrantes y exponerlos en la vista de gestión. Resuelve la necesidad de consultar comprobantes o documentación recibida sin salir del sistema.

**Evidencia:** commits `273f4a9`, `3f79546`, `b79648f`; componentes `EmailAttachments`, `InboundEmailView`.

### Corregir resolución de paths de adjuntos

**Descripción:** Se ajustó la forma de guardar y resolver rutas de archivos adjuntos para evitar dispersión o fallos al recuperarlos. Mejora la confiabilidad de descargas y reenvíos con archivos.

**Evidencia:** commits `273f4a9`, `568a0dc`; `MailReplyService`, configuración de roles de `Cobrador`.

### Extraer texto de adjuntos PDF e imágenes mediante OCR

**Descripción:** Se agregó extracción de texto en PDF/OCR para que los adjuntos puedan alimentar el análisis IA y la revisión humana. Aporta valor especialmente para comprobantes enviados como imagen o PDF.

**Evidencia:** commits `52ef770`, `a899540`; herramientas `PdfTextExtractor`, `TesseractOCR`.

### Activar o desactivar análisis IA por mailbox

**Descripción:** Se agregó configuración para decidir si una casilla ejecuta análisis IA sobre sus correos. Permite operar casillas simples sin costo/proceso IA y reservar IA para flujos donde aporta valor.

**Evidencia:** commit `e8fba71`; campos `aiAnalysisEnabled`.

### Clasificar mails con IA por categoría, sentimiento, prioridad, tags y entidades

**Descripción:** Se incorporó análisis IA para proponer clasificación, resumen, datos de cliente, sentimiento, prioridad, etiquetas y entidades extraídas. Reduce lectura manual y ayuda a priorizar casos sensibles.

**Evidencia:** commits `49f4311`, `73c510c`, `bd78f26`, `a58fb2d`; `InboundEmailSchema`, `MailboxSchema`, `useMailboxAiOptions`.

### Hacer visibles los resúmenes IA en la gestión

**Descripción:** Se ajustó la UI para mostrar el resumen generado por IA y datos extraídos relevantes del correo. Permite comprender el motivo del contacto más rápido.

**Evidencia:** commit `a899540`; `EmailDetail`, `ExtractedEntitiesPanel`.

### Configurar sentimientos y prioridades personalizables por mailbox

**Descripción:** Se amplió la configuración de mailbox para definir sentimientos y prioridades con nombres, descripciones, iconos y colores. Esto permite adaptar la clasificación IA a cada operación.

**Evidencia:** commits `bd78f26`, `a58fb2d`; `IMailboxSentimentOption`, `IMailboxPriorityOption`.

### Gestionar mails desde una pantalla operativa dedicada

**Descripción:** Se creó la pantalla de gestión de emails con selector de casilla, vistas por estado, listado, detalle, filtros, búsqueda, panel de gestión y acciones. Reemplaza el CRUD simple por una herramienta de trabajo diaria para operadores.

**Evidencia:** commits `0d77035`, `200c1d5`, `874bbcd`, `ae6bb1a`; `EmailManagementPage` y subcomponentes `mailbox/*`.

### Agregar vistas operativas de bandeja por estado

**Descripción:** Se incorporaron vistas como pendientes, asignados a mí, asignados en atención, asignados, cerrados, enviados y destacados. Ayuda a ordenar el trabajo según responsabilidad y estado.

**Evidencia:** commits `0d77035`, `e9a73ef`, `deda59f`; `managementPaginate`, `managementCounts`, `EmailSidebarViews`.

### Implementar toma y reasignación de mails

**Descripción:** Se agregó la acción para tomar un correo, asignarlo al operador actual y reasignarlo cuando corresponde. Evita que dos personas atiendan simultáneamente el mismo caso.

**Evidencia:** commits `0d77035`, `e9a73ef`; endpoints `assign-to-me`, `assignment`.

### Reabrir mails cerrados y tomarlos nuevamente

**Descripción:** Se agregó flujo para reabrir una gestión cerrada y asignarla al operador. Resuelve casos cerrados por error o que requieren nueva intervención.

**Evidencia:** commit `e9a73ef`; endpoint `reopen-and-assign-to-me`.

### Cerrar gestiones con motivo configurable

**Descripción:** Se agregó motivo de cierre por mailbox y validación de obligatoriedad. Permite medir por qué se cierran casos y exigir justificación cuando el proceso lo requiere.

**Evidencia:** commits `de0c777`, `8bff508`; `CloseEmailDialog`, `closeReasonRequired`.

### Exigir respuesta antes de cerrar mails

**Descripción:** Se agregó regla configurable para impedir cerrar un mail si no existe respuesta enviada. Asegura que los casos que requieren contacto no queden cerrados sin contestación.

**Evidencia:** commits `8bff508`, `dc7be2b`, `59979b2`; `replyRequiredToClose`, `MailReplyService`.

### Responder mails desde la plataforma

**Descripción:** Se implementó envío de respuestas usando SMTP del mailbox, con destinatarios, CC/BCC, asunto, cuerpo HTML/texto y registro del correo saliente. Permite resolver casos sin salir del sistema.

**Evidencia:** commits `dc7be2b`, `59979b2`, `04a794c`; `MailReplyRoutes`, `MailReplyService`, `OutboundEmail`.

### Enviar correos nuevos desde una casilla

**Descripción:** Se agregó la posibilidad de redactar y enviar emails salientes no vinculados a un inbound específico. Cubre contactos proactivos desde casillas corporativas.

**Evidencia:** commit `04a794c`; endpoint `/api/mail-replies/send`.

### Reenviar mails entrantes

**Descripción:** Se agregó acción de reenvío con armado de contenido original y registro del outbound. Permite derivar correos a terceros o áreas internas conservando contexto.

**Evidencia:** commit `14faf5c`; endpoint `/api/mail-replies/:inboundEmailId/forward`.

### Incluir historial de conversación en respuestas

**Descripción:** Se incorporó armado de hilo histórico en texto y HTML al responder. Mejora la trazabilidad del intercambio y evita respuestas descontextualizadas.

**Evidencia:** commit `75b6aea`; métodos `buildThreadEntries`, `appendTextHistory`, `appendHtmlHistory`.

### Mostrar cadena de correos entrantes y salientes

**Descripción:** Se agregó visualización de hilo completo con mensajes relacionados, respuestas enviadas y correos previos. Reduce la necesidad de buscar mensajes en la casilla externa.

**Evidencia:** commits `e0ad11c`, `546b142`; `EmailThread`, `EmailThreadItem`, `OutboundEmailList`.

### Ordenar el hilo en forma inversa y expandir solo el mail actual

**Descripción:** Se ajustó la experiencia del hilo para mostrar primero lo más relevante y evitar pantallas extensas con múltiples mensajes abiertos. Mejora la lectura diaria de casos.

**Evidencia:** commit `546b142`.

### Agregar editor enriquecido de mail

**Descripción:** Se agregó un editor rich text para redactar respuestas con formato HTML. Mejora la calidad de las respuestas enviadas desde el sistema.

**Evidencia:** commits `dc7be2b`, `bd02e47`; `MailRichTextEditor`.

### Permitir insertar tablas en el editor de mails

**Descripción:** Se extendió el composer para incluir tablas dentro del cuerpo del mail. Resuelve comunicaciones que requieren detalle tabular, como importes, períodos o saldos.

**Evidencia:** commit `bd02e47`.

### Enviar y reenviar mails con adjuntos

**Descripción:** Se agregó soporte para adjuntar archivos en respuestas, reenvíos y correos nuevos, resolviendo la necesidad de enviar comprobantes o documentación desde la propia plataforma.

**Evidencia:** commits `3f79546`, `568a0dc`, `14faf5c`; `MailReplyService.normalizeAttachments`, `buildSmtpAttachments`.

### Configurar firmas por usuario y mailbox

**Descripción:** Se agregó configuración de firma personalizada por operador y casilla para incorporarla en los correos salientes. Estandariza la comunicación y evita firmas manuales repetidas.

**Evidencia:** commit `9af2aa7`; `MailboxUserSetting`, `MailboxUserSettingsDialog`.

### Configurar comportamiento de “siguiente mail” al cerrar

**Descripción:** Se implementó preferencia por usuario/mailbox para decidir qué ocurre al cerrar una gestión, por ejemplo avanzar al siguiente caso. Mejora la velocidad de atención en colas de alto volumen.

**Evidencia:** commit `d33a23a`; `MailboxUserSettingService`.

### Guardar estado de usuario por mail

**Descripción:** Se agregó estado por usuario sobre emails, incluyendo lectura/destacado y soporte de vistas personalizadas. Permite que cada operador mantenga marcas propias sin modificar el estado global del caso.

**Evidencia:** commits `d33a23a`, `deda59f`; `EmailUserState`.

### Implementar sesiones de atención de operadores

**Descripción:** Se incorporó inicio, pausa, reanudación y cierre de sesiones por mailbox. Permite medir presencia operativa y controlar asignaciones por capacidad.

**Evidencia:** commit `92f5714`; `SessionEmailService`, `SessionEmailPanel`.

### Asignar automáticamente mails según capacidad del operador

**Descripción:** Se agregó asignación automática de correos pendientes a sesiones activas hasta el máximo configurado. Distribuye carga de trabajo sin intervención manual.

**Evidencia:** commits `92f5714`, `5731d4a`; `SessionEmailService`, repositorios de `InboundEmail`.

### Limitar solo la asignación automática, no la asignación manual

**Descripción:** Se ajustó la regla para que el límite de capacidad aplique a la distribución automática, pero no bloquee una reasignación manual necesaria. Evita trabas operativas en casos excepcionales.

**Evidencia:** commit `5731d4a`.

### Supervisar actividad live, diaria y mensual de mailboxes

**Descripción:** Se implementó panel de supervisión con métricas en vivo, vistas diarias y mensuales, operadores, sesiones y casos asignados. Aporta visibilidad de carga, productividad y estado de casillas.

**Evidencia:** commits `05497e9`, `0daf0c8`, `28b0dc9`; `EmailSupervisionPage`, `EmailSupervisionService`.

### Cerrar sesiones de operador desde supervisión

**Descripción:** Se agregó acción para que un supervisor cierre una sesión activa de un operador. Resuelve bloqueos cuando una sesión queda abierta o un usuario no puede cerrarla.

**Evidencia:** commit `28b0dc9`; `SessionEmailController`, `SessionEmailService`.

### Agregar métricas de correos respondidos y cerrados por día

**Descripción:** Se extendieron dashboards para mostrar volumen diario de respuestas y cierres. Permite liquidar o controlar actividad operativa con mejor granularidad.

**Evidencia:** commit `567c5d7`.

### Agregar tablero de mail

**Descripción:** Se creó dashboard de mails con indicadores operativos y filtros. Permite seguimiento agregado de bandejas, estados y actividad.

**Evidencia:** commits `d589f4f`, `ec0261c`, `78035f4`; `InboundEmailDashboardPage`.

### Configurar retención y purga de correos

**Descripción:** Se agregó parámetro de retención por mailbox y proceso de purga automática. Controla crecimiento de datos y mantiene la base con volumen manejable.

**Evidencia:** commit `d589f4f`; `retentionDays`, settings `MailboxAutoPurge`.

### Abrir gestión de mail por query param

**Descripción:** Se agregó soporte para abrir directamente un mail específico desde una URL. Facilita integrar links desde otros módulos o notificaciones.

**Evidencia:** commit `e9a73ef`.

### Vincular categorías de mailbox con URLs de gestión externas

**Descripción:** Se agregó `managementUrl` por categoría y botón contextual para abrir el módulo correspondiente al tipo de caso. Reduce saltos manuales y mantiene contexto entre mail y gestión especializada.

**Evidencia:** commit `14c8ab6`.

### Abrir módulos externos de gestión en modal fullscreen

**Descripción:** Se implementó router embebido y modal fullscreen para operar una pantalla externa desde el detalle de mail. Permite resolver gestiones vinculadas sin abandonar el flujo de atención.

**Evidencia:** commit `c8e865f`; `EmbeddedRouter`, `EmbeddedRouterDialog`.

### Agregar atajos de teclado en gestión de mail

**Descripción:** Se incorporaron atajos para navegar, tomar, clasificar, cerrar o abrir acciones frecuentes, junto con un diálogo de ayuda. Reduce tiempos de operación repetitiva.

**Evidencia:** commits `9e9643d`, `fb9303d`; `EmailShortcutsDialog`.

### Navegar mails con flechas

**Descripción:** Se agregó navegación por correo anterior/siguiente desde la gestión. Mejora la revisión secuencial de colas.

**Evidencia:** commit `a383293`.

### Mostrar indicador y posición del mail seleccionado

**Descripción:** Se agregó indicador visual de correo actual y su posición dentro del listado. Ayuda al operador a ubicarse durante la atención secuencial.

**Evidencia:** commit `5687019`.

### Optimizar queries y payloads de gestión de mail

**Descripción:** Se ajustaron schemas, repositorios y llamadas de red para mejorar rendimiento del módulo de mail, especialmente en listados y conteos de gestión. Reduce latencia y carga innecesaria.

**Evidencia:** commits `16a8ee0`, `deda59f`; `managementPaginate`, `managementCounts`, tests de mail.

### Otorgar permisos de mail saliente a cobradores

**Descripción:** Se ampliaron permisos del rol `Cobrador` para operar funcionalidades de envío de mail y adjuntos vinculadas a cobranzas. Permite que el perfil real del negocio pueda completar gestiones sin permisos administrativos.

**Evidencia:** commits `16a8ee0`, `568a0dc`; `back/src/setup/data/roles/cobrador-role.ts`.

### Documentar y preparar capacitación del módulo mail

**Descripción:** Se creó documentación funcional y guion de capacitación para explicar configuración, operación, supervisión y buenas prácticas del módulo. Facilita adopción por usuarios finales y responsables de área.

**Evidencia:** commits `242c1cc`, `3a9180e`, `98a5922`; `docs/module-mail.md`, `docs/module-mail-script.md`.

---

## Transferencias

### Crear módulo de transferencias desde correos

**Descripción:** Se incorporó el módulo para registrar y gestionar transferencias originadas en emails, con entidades de `TransferEmail`, `Payer` y `BankMovement`. Resuelve el procesamiento manual de comprobantes dispersos en casillas de correo.

**Evidencia:** commits `f8d28a4`, `79c8b39`; `back/src/modules/transferencias`, `front/src/modules/transferencias`.

### Procesar lotes de mails entrantes como transferencias

**Descripción:** Se agregó endpoint y proceso para escanear mails ya incorporados, detectar transferencias y crear registros de auditoría. Permite automatizar una tarea repetitiva de lectura y carga.

**Evidencia:** commits `52ef770`, `5f45f3c`; endpoint `/api/transfer-emails/process-inbound-emails`.

### Procesar individualmente un mail como transferencia

**Descripción:** Se agregó acción para procesar un único mail seleccionado y generar la transferencia correspondiente. Resuelve casos donde el operador necesita forzar o revisar un correo puntual.

**Evidencia:** commit `3de7f02`; endpoint `/api/transfer-emails/process-inbound-email`, `TransferEmailProcessPage`.

### Marcar el mail entrante con estado de procesamiento de transferencia

**Descripción:** Se agregaron `processMarks` en `InboundEmail` para registrar si el mail fue procesado, omitido, falló o sigue pendiente para transferencias. Aporta trazabilidad y evita reprocesos duplicados.

**Evidencia:** commit `5f45f3c`; campo `processMarks`.

### Evitar duplicados de transferencias por mail

**Descripción:** El proceso busca transferencias existentes por `emailMessageId` e `inboundEmail` antes de crear nuevas. Evita doble carga del mismo comprobante.

**Evidencia:** commits `79c8b39`, `52ef770`; `InboundMailTransferProcessor`.

### Extraer datos de transferencia con IA

**Descripción:** Se implementó extracción de importe, moneda, fecha, operación, cuentas, CBU/CVU, bancos, pagador y afiliado usando IA sobre asunto, cuerpo, metadata y OCR. Reduce carga manual y acelera clasificación.

**Evidencia:** commits `52ef770`, `ac07279`, `49f4311`; `InboundMailTransferProcessor`.

### Detectar transferencias con consulta adicional en IA

**Descripción:** Se agregó detección de casos donde el mail contiene una consulta adicional además del comprobante de transferencia. Permite marcar situaciones que requieren revisión o respuesta antes de cerrar el caso.

**Evidencia:** commit `f3e6a46`; campo `hasAdditionalInquiry`.

### Agregar fallback de extracción sin IA

**Descripción:** Se incorporó extractor fallback para crear registros mínimos cuando la IA no está disponible o no logra procesar el mail. Evita perder casos y los deja pendientes de revisión humana.

**Evidencia:** commit `2fc2b91`; `TransferEmailFallbackExtractor`, estado `PROCESADO_SIN_IA`.

### Gestionar estados IA y estados humanos de auditoría

**Descripción:** Se separaron estados de IA, revisión humana y estado general. Permite distinguir procesamiento automático, duda, error, validación, corrección y descarte.

**Evidencia:** commits `15807b2`, `b773a90`; `TransferEmailAiStatus`, `TransferEmailHumanStatus`, `TransferEmailStatus`.

### Soportar múltiples transferencias o múltiples afiliados desde un mismo mail

**Descripción:** Se ajustó el modelo para crear uno o varios registros y soportar afiliados adicionales con importes por afiliado. Resuelve mails donde un pago cubre más de una persona o concepto.

**Evidencia:** commits `79c8b39`, `022c884`, `28b3e5d`.

### Cambiar “mes” por “concepto” y ampliar detalle financiero

**Descripción:** Se modificó la UI de transferencia para reemplazar el campo de afiliado/mes por concepto y agregar copago, financiación y punitorios. Permite reflejar mejor la composición del pago.

**Evidencia:** commit `a489c53`; `TransferEmail.vue`, i18n.

### Agregar titular de cuenta a transferencia y exportación

**Descripción:** Se incorporó el dato de titular de cuenta en el modelo, la UI y el Excel. Mejora conciliación y revisión cuando el origen bancario no coincide con el afiliado.

**Evidencia:** commits `d171bd2`, `e61f546`.

### Agregar pagadores y estrategias de identificación

**Descripción:** Se creó la entidad `Payer` para mapear email, DNI/CUIL, CBU/CVU o número de cuenta contra afiliados. Resuelve la identificación recurrente de pagadores no triviales.

**Evidencia:** commits `aea5a6d`, `6fe3d5c`, `7e88c8a`; `PayerService.findByAnyStrategy`.

### Crear pagadores “on the fly”

**Descripción:** Se agregó capacidad operativa para crear un pagador desde el flujo de transferencia cuando se detecta una relación nueva. Reduce cambios de pantalla y facilita enriquecer el mapeo durante auditoría.

**Evidencia:** commit `7e88c8a`; `TransferEmailReprocessAction`, `PayerCrud`.

### Reprocesar transferencias con reglas actuales de pagador

**Descripción:** Se agregó reprocesamiento para recalcular afiliado/pagador sin volver a invocar IA, usando los mapeos actuales. Permite corregir lotes luego de cargar reglas de pagadores.

**Evidencia:** commits `6fe3d5c`, `7e88c8a`; endpoint `/api/transfer-emails/:id/reprocess`.

### Re-evaluar transferencias enviadas a revisión humana

**Descripción:** Se agregó acción para reevaluar registros que quedaron con dudas o incompletos, permitiendo actualizar estado y datos de revisión. Mejora el flujo de recuperación de casos inciertos.

**Evidencia:** commit `7bb2bf0`.

### Implementar auditoría humana de transferencias

**Descripción:** Se agregó acción de auditoría para validar, corregir o descartar una transferencia, registrar auditor, fecha y estado final. Convierte la extracción automática en un proceso controlado.

**Evidencia:** commits `9fa6449`, `15807b2`; endpoint `/api/transfer-emails/:id/audit`.

### Crear sesiones de auditoría de transferencias

**Descripción:** Se implementaron sesiones con lote asignado, heartbeat, pausa, reanudación, finalización y vencimiento. Organiza el trabajo de auditores y evita que varios operadores tomen los mismos casos.

**Evidencia:** commit `76632c5`; `TransferAuditSessionService`, `TransferAuditSessionView`.

### Asignar lotes de transferencia con lease temporal

**Descripción:** Se agregó asignación temporal de casos a una sesión, renovación por heartbeat y liberación al pausar/completar/vencer. Reduce conflictos y casos bloqueados.

**Evidencia:** commit `76632c5`; métodos `assignAvailableToSession`, `renewAssignments`, `releasePendingAssignments`.

### Cerrar el mail vinculado desde auditoría de transferencia

**Descripción:** Se agregó opción para cerrar el `InboundEmail` asociado al auditar la transferencia. Evita doble trabajo entre el módulo de transferencias y la bandeja de mail.

**Evidencia:** commit `1818df0`; `closeLinkedInboundEmail`.

### Mejorar vínculo visual entre transferencia y correo

**Descripción:** Se agregaron pantallas y componentes para ver el correo origen, comprobante, OCR y datos de mail dentro del flujo de transferencia. Reduce cambios de contexto durante auditoría.

**Evidencia:** commits `bce62d6`, `1818df0`; `InboundEmailTransferManagement`, `TransferEmail.vue`.

### Incorporar tabs de comprobante, OCR y email

**Descripción:** Se reorganizó el panel izquierdo de transferencia para separar comprobante, texto OCR y correo, con HTML abierto por defecto. Mejora revisión documental del caso.

**Evidencia:** commit `bce62d6`.

### Agregar ayuda funcional del proceso de transferencias

**Descripción:** Se creó diálogo de ayuda que explica cómo se procesa un mail, qué extrae la IA, cómo se usa pagadores y cómo se interpretan los estados. Facilita capacitación y soporte a usuarios.

**Evidencia:** `TransferEmailHelpDialog`.

### Exportar transferencias a Excel

**Descripción:** Se agregó exportación Excel de transferencias con datos del mail, transferencia, pagador, afiliado, estados y auditoría. Permite reportar o liquidar trabajo fuera del sistema.

**Evidencia:** commits `3f37647`, `9d7bdb1`; `TransferEmailService.exportExcel`.

### Exportar múltiples afiliados con fila total y detalle

**Descripción:** Se ajustó la exportación para casos con múltiples afiliados, incorporando fila total y filas de detalle con estilos diferenciados. Mejora lectura y control de pagos agrupados.

**Evidencia:** commits `5773a5d`, `30d171c`; `applyMultipleAffiliateTotalRowStyle`, `applyMultipleAffiliateDetailRowStyle`.

### Agregar dashboard de transferencias

**Descripción:** Se incorporó tablero para visualizar estados y métricas de transferencias, con orden por fecha y filtros. Aporta seguimiento gerencial del proceso.

**Evidencia:** commits `ec0261c`, `78035f4`, `f2323fb`, `6bbb63f`; `TransferEmailDashboardPage`.

### Mejorar la vista y CRUD de transferencias

**Descripción:** Se ajustó el CRUD, vista de detalle, colores de estado y layout de edición/auditoría. Reduce fricción para revisar datos complejos de transferencia.

**Evidencia:** commits `b8b2c3e`, `25bbdff`, `799fc33`; `TransferEmail.vue`, `TransferEmailCrud`.

### Aceptar más de una categoría de mail para transferencias

**Descripción:** Se ajustó el filtro de procesamiento para admitir múltiples categorías configuradas como origen de transferencias. Permite contemplar variantes de clasificación como depósito/transferencia.

**Evidencia:** commit `c82e00a`; setting `InboundMailTransferCategory`.

### Configurar procesamiento automático de transferencias

**Descripción:** Se agregaron settings para habilitar/deshabilitar el procesamiento automático y definir categoría origen. Controla cuándo el worker debe convertir mails en transferencias.

**Evidencia:** commits `5f45f3c`, `c82e00a`; `InitializeSettings`.

### Registrar fecha del mail y fecha de procesamiento

**Descripción:** Se agregaron campos de fecha del correo y fecha de proceso para auditar tiempos entre recepción, extracción y revisión. Aporta trazabilidad operacional.

**Evidencia:** commit `e1af044`.

### Ajustar prompt de localización y extracción

**Descripción:** Se refinó el prompt de IA para mejorar detección de datos locales y reducir errores de clasificación. Mejora calidad de extracción en comprobantes reales.

**Evidencia:** commit `ac07279`.

### Aumentar límite de interacciones del proveedor IA

**Descripción:** Se amplió el máximo de interacciones de herramientas del AI Provider para permitir flujos de extracción más complejos. Reduce fallos por límite durante procesamiento.

**Evidencia:** commit `9ad6a97`.

### Registrar `operationTitle` en procesamiento

**Descripción:** Se agregó título operativo para identificar mejor ejecuciones/procesos de transferencia. Aporta trazabilidad en logs y operaciones IA.

**Evidencia:** commits `42323bb`, `52ef770`.

---

## Bajas / Bonificaciones

### Crear módulo de bajas y bonificaciones

**Descripción:** Se implementó el módulo para registrar bonificaciones asociadas a procesos de baja, con entidad, CRUD, permisos, rutas y menú. Reemplaza registros manuales dispersos por una gestión centralizada.

**Evidencia:** commit `a9c6c76`; `back/src/modules/bajas`, `front/src/modules/bajas`.

### Definir campos operativos de bonificación

**Descripción:** Se incorporaron DNI, nombre, plan, mes de aplicación, forma de pago, bonificación, período, valor neto, estado y observación. Permite capturar la información necesaria para aplicar y controlar la bonificación.

**Evidencia:** commits `a9c6c76`, `29048a9`; `IBonus`, `BonusSchema`.

### Agregar período a bonificaciones

**Descripción:** Se agregó campo `period` para indicar período de la bonificación. Mejora segmentación, búsqueda, dashboard y exportación.

**Evidencia:** commit `29048a9`.

### Incorporar selectores en el formulario de bajas

**Descripción:** Se agregaron selectores para campos clave del CRUD de bonificaciones, reduciendo carga libre y errores de tipeo.

**Evidencia:** commit `29048a9`; `BonusCrud`.

### Forzar estado inicial pendiente

**Descripción:** Se agregó lógica para que una bonificación nueva nazca como `Pendiente`. Asegura un ciclo operativo consistente.

**Evidencia:** `BonusController.preCreate` / reglas documentadas en overview.

### Validar observación para estado “No aplicado”

**Descripción:** Se agregó validación para exigir observación cuando una bonificación se marca como no aplicada. Mejora trazabilidad del rechazo o imposibilidad de aplicación.

**Evidencia:** `BonusController.validateObservation`.

### Restringir edición por permisos, creador y fecha

**Descripción:** Se agregó control para que operadores sin permiso de gestión editen solo registros propios del día, mientras supervisores pueden gestionar más ampliamente. Protege información histórica y evita cambios no autorizados.

**Evidencia:** commits `56fb893`, `6dec151`; `BonusController.assertEditable`.

### Crear dashboard de bonificaciones

**Descripción:** Se creó tablero con agrupaciones por mes, plan, operador, período, estado y montos. Permite supervisar volumen y valor económico de bonificaciones.

**Evidencia:** commits `25bbdff`, `0a3eaa3`; `BonusDashboardPage`.

### Agregar filtros al dashboard de bonificaciones

**Descripción:** Se incorporaron filtros de fecha y operador para analizar subconjuntos de gestión. Mejora seguimiento por período liquidable.

**Evidencia:** commits `1624126`, `6bbb63f`.

### Mejorar colores y layout de estados en bonificaciones

**Descripción:** Se ajustó la visualización de estados, columnas y ancho de pantalla para facilitar lectura y control operativo.

**Evidencia:** commits `56fb893`, `13860fd`, `25bbdff`.

### Exportar bonificaciones a Excel por rango y operador

**Descripción:** Se agregó exportación Excel con filtros de fecha y operador, incluyendo columnas operativas y estado. Facilita liquidación, control externo y envío de reportes.

**Evidencia:** `BonusExportPage`, `BonusService.exportExcel`.

### Agregar importación de bonificaciones

**Descripción:** Se habilitó importación desde archivo mediante capacidades CRUD/arch para carga masiva. Reduce carga manual cuando la información llega en planillas.

**Evidencia:** `BonusRoutes.post('/api/bonuses/import')`, `BonusCrud.importFormats`.

### Configurar roles de OperadorBaja y SupervisorBaja

**Descripción:** Se definieron permisos específicos para perfiles de bajas y supervisión, incluyendo acceso a bonificaciones, exportación y archivos. Ordena responsabilidades por rol.

**Evidencia:** commits `a9c6c76`, `3332a19`; `operador-baja-role.ts`, `supervisor-baja-role.ts`.

---

## Traspasos internos

### Crear módulo de traspasos internos

**Descripción:** Se implementó un módulo separado para bonificaciones originadas en traspasos internos. Permite diferenciar este circuito del módulo general de bajas.

**Evidencia:** commits `3189769`, `0ea9208`; `back/src/modules/traspasosInternos`, `front/src/modules/traspasosInternos`.

### Registrar bonificaciones de traspaso con datos específicos

**Descripción:** Se agregaron DNI, nombre, mes de aplicación, valor bonificado, tipo de bonificación, estado, observación y creador. Captura datos propios del proceso de traspaso.

**Evidencia:** `IInternalTransferBonus`, `InternalTransferBonusSchema`.

### Validar adjunto bancario para transferencias bancarias

**Descripción:** Se agregó regla que exige adjunto de datos bancarios cuando el tipo de bonificación es `Transferencia Bancaria`. Evita que se carguen casos incompletos para pago por transferencia.

**Evidencia:** `InternalTransferBonusController.validateBankDataAttachment`.

### Aplicar reglas de edición por permisos, creador y fecha

**Descripción:** Se replicó control operativo para que usuarios sin permiso de gestión solo modifiquen registros propios del día. Reduce riesgo de cambios indebidos.

**Evidencia:** `InternalTransferBonusController.assertEditable`.

### Validar observación para traspasos no aplicados

**Descripción:** Se exige observación cuando una bonificación por traspaso queda `No aplicado`. Mejora explicación y auditoría del resultado.

**Evidencia:** `InternalTransferBonusController.validateObservation`.

### Crear dashboard de traspasos internos

**Descripción:** Se agregó tablero con agrupaciones y métricas del módulo. Permite supervisar cantidad, estado y montos de traspasos.

**Evidencia:** `InternalTransferBonusDashboardPage`.

### Exportar traspasos internos a Excel

**Descripción:** Se agregó exportación por rango y operador con datos bancarios/estado. Facilita liquidación y envío a áreas administrativas.

**Evidencia:** `InternalTransferBonusExportPage`, `InternalTransferBonusService.exportExcel`.

### Habilitar importación de traspasos internos

**Descripción:** Se expuso endpoint de importación para carga masiva de registros de traspasos. Reduce carga manual desde planillas.

**Evidencia:** `InternalTransferBonusRoutes.post('/api/internal-transfer-bonuses/import')`.

---

## Llamados / WhatsApp

### Crear módulo de listados de llamadas

**Descripción:** Se implementaron entidades de listados, logs, tipos de éxito y tipos de fallo, con pantallas CRUD y permisos. Permite gestionar campañas o listados de contactos desde la plataforma.

**Evidencia:** commit `1382c51`; `back/src/modules/caller`, `front/src/modules/caller`.

### Crear pantalla de agente de llamadas

**Descripción:** Se agregó una pantalla operativa para que el llamador vea datos del contacto, registre resultados y consulte historial. Reemplaza carga manual distribuida.

**Evidencia:** commit `1382c51`; `CallAgent.vue`, componentes `CallAgent*`.

### Registrar intentos de llamada

**Descripción:** Se agregó entidad/control de intentos para contar vueltas y resultados de contacto. Permite saber cuántas veces se intentó contactar a un afiliado.

**Evidencia:** commits `f714197`, `51aaaa9`; `CallAttempt`.

### Ajustar vueltas del llamador

**Descripción:** Se corrigió la lógica de vueltas/intentos para reflejar correctamente los contactos realizados. Mejora precisión del seguimiento operativo.

**Evidencia:** commit `51aaaa9`.

### Registrar resultado exitoso o fallido de una llamada

**Descripción:** Se agregó flujo para guardar estado, tipificación, notas, promesa de pago y usuario responsable en el log de llamada. Permite medir gestión y resultados.

**Evidencia:** `CallLogService.registerAttempt`, `CallFailedType`, `CallSuccessType`.

### Buscar llamadas por datos internos del registro

**Descripción:** Se agregó paginado/búsqueda sobre datos dinámicos importados en los logs. Permite encontrar contactos por campos del archivo original, no solo campos fijos del modelo.

**Evidencia:** commit `237fc16`; endpoint `/api/call-logs/paginate-data-search`.

### Exportar llamadas a Excel

**Descripción:** Se agregó exportación Excel de logs de llamadas, incluyendo campos dinámicos detectados en la data. Facilita reportes y conciliación con listados externos.

**Evidencia:** commit `237fc16`; `CallLogService.exportExcel`.

### Crear dashboard de llamadas

**Descripción:** Se agregó tablero para visualizar resultados, intentos y estados por listado/grupo. Permite seguimiento de performance de llamados.

**Evidencia:** commits `f714197`, `8b529f1`, `a383a12`; `CallListDashboardPage`.

### Agregar botón de refresco en dashboard

**Descripción:** Se incorporó acción explícita para actualizar métricas del dashboard sin recargar toda la app. Mejora uso durante supervisión en vivo.

**Evidencia:** commits `8b529f1`, `a383a12`.

### Filtrar listados por grupo/zona

**Descripción:** Se corrigieron filtros para limitar o consultar llamadas según grupo/zona. Permite que cada equipo vea la información que corresponde.

**Evidencia:** commits `1e5a1e4`, `4750d8d`.

### Enviar WhatsApp por plantilla desde llamadas

**Descripción:** Se integró envío de plantillas WhatsApp mediante Multichannel/Sondeos desde el flujo de llamados. Permite contactar afiliados por canal alternativo sin salir de la pantalla de gestión.

**Evidencia:** commit `b6ddd3f`; endpoint `/api/multichannel/send-whatsapp-template`, `CallAgentWhatsappDialog`.

### Registrar mensajes de WhatsApp enviados

**Descripción:** Se agregó entidad `WhatsappMessage` y CRUD para guardar trazabilidad de mensajes enviados. Resuelve la necesidad de controlar qué comunicaciones se enviaron.

**Evidencia:** commit `ffdbdb2`; `WhatsappMessage`.

### Manejar errores de integración WhatsApp

**Descripción:** Se agregó normalización de teléfono y manejo de respuestas 400/404/406/500 del proveedor. Mejora feedback cuando un envío falla.

**Evidencia:** `MultichannelController`, `MultichannelProvider`.

---

## Afilmed / Padrón

### Crear módulo de padrón Afilmed/Premedic

**Descripción:** Se implementó entidad, CRUD, permisos y menú para administrar padrón con datos de afiliados/deuda/contacto. Centraliza información base utilizada por cobranzas y transferencias.

**Evidencia:** commit `14b77fc`; `back/src/modules/afilmed`, `front/src/modules/afilmed`.

### Importar padrón desde archivo

**Descripción:** Se agregó pantalla y endpoint para cargar archivos de padrón, procesarlos y crear registros. Reduce carga manual masiva.

**Evidencia:** commit `16a6c54`; endpoint `/api/padrones/import-file`, `PadronImportPage`.

### Exponer búsqueda, exportación y combobox de padrón

**Descripción:** Se agregaron CRUD, exportación y selector reutilizable para consultar padrón desde otras pantallas. Facilita uso transversal del dato de afiliado.

**Evidencia:** `PadronCrud`, `PadronCombobox`, `PadronProvider`.

---

## Premedic / Afiliados

### Crear administración de afiliados y tipos de afiliado

**Descripción:** Se incorporaron entidades `Affiliate` y `AffiliateType` con CRUD, permisos, rutas y pantallas. Permite mantener datos base de afiliados dentro de la aplicación.

**Evidencia:** commits `14b77fc`, cambios en `back/src/modules/premedic`, `front/src/modules/premedic`.

### Integrar afiliados como dato reusable para otros módulos

**Descripción:** Se agregaron comboboxes y providers para reutilizar afiliados y tipos en formularios o futuras integraciones. Reduce duplicación de carga de datos.

**Evidencia:** `AffiliateCombobox`, `AffiliateTypeCombobox`.

---

## Cobranzas / Convenios

### Crear módulo de cobranzas a domicilio / convenios

**Descripción:** Se implementaron entidades de convenios y grupos/zona, con CRUD backend/frontend y permisos. Permite registrar cobranzas asociadas a afiliados, importes, períodos y zonas.

**Evidencia:** commit `1382c51`; `back/src/modules/collections`, `front/src/modules/collections`.

### Cargar múltiples convenios desde formulario especializado

**Descripción:** Se agregó formulario de carga múltiple de convenios para registrar varios casos de manera más ágil. Reduce carga repetitiva desde planillas.

**Evidencia:** commit `c091755`; `CovenantCreateMultiForm`.

### Exportar convenios filtrados

**Descripción:** Se incorporó exportación de convenios y exportación Excel por fecha/grupo. Facilita reportes operativos y distribución de trabajo.

**Evidencia:** commits `c091755`, `fe8ca71`; `CovenantExportPage`, `CovenantService.exportExcel`.

### Crear dashboard de convenios

**Descripción:** Se agregó tablero de cobranzas/convenios con métricas y agrupaciones. Aporta seguimiento de importes, estados y grupos.

**Evidencia:** commits `a93ddf7`, `c091755`; `ConvenantDashboardPage`, `CustomDashboard`.

### Ajustar filtros de grupo en dashboard/exportación

**Descripción:** Se corrigió el filtrado por grupo para que dashboards y exportaciones respeten la segmentación operativa. Evita reportes con datos fuera de alcance.

**Evidencia:** commits `1e5a1e4`, `fe8ca71`.

### Configurar roles, menús y permisos de cobranzas

**Descripción:** Se ajustaron permisos de convenios, grupos, roles y menú para que los usuarios correctos accedan a cada pantalla. Ordena la operación por perfil.

**Evidencia:** commits `df743c4`, `4750d8d`.

---

## Recovery / Administración / Plataforma

### Crear módulo de recovery de base de datos

**Descripción:** Se agregó módulo para generar dump, restaurar, subir dumps y descargar respaldos de MongoDB con contraseña maestra. Resuelve la necesidad de backup/restore operativo sin intervención manual compleja.

**Evidencia:** commits `10f1c79`, `1f1db8d`; `RecoveryService`, `RecoveryPage`.

### Crear backup y restore de archivos

**Descripción:** Se agregó respaldo y restauración del directorio de archivos de Drax, incluyendo descarga y restauración desde upload. Completa la recuperación de datos binarios además de base de datos.

**Evidencia:** `FileRecoveryService`, rutas `/api/recovery/files/*`.

### Configurar permisos de recovery

**Descripción:** Se agregaron permisos específicos para limitar operaciones de backup/restore a perfiles autorizados. Reduce riesgo de uso indebido de operaciones sensibles.

**Evidencia:** `RecoveryPermissions`.

### Seleccionar proveedor IA por configuración

**Descripción:** Se agregó soporte para seleccionar proveedor/modelo IA desde configuración/env. Permite ajustar backend IA sin reescribir flujos de mail/transferencias.

**Evidencia:** commit `ff2e7de`; cambios de AI provider.

### Inicializar roles funcionales del sistema

**Descripción:** Se consolidó creación de roles funcionales como `Cobrador`, `Llamador`, `OperadorBaja` y `SupervisorBaja`. Permite mapear perfiles reales del negocio a permisos técnicos.

**Evidencia:** commits `df743c4`, `4750d8d`, `a9c6c76`, `3332a19`; `CreateSystemRoles`, `setup/data/roles`.

### Ajustar menús principales por módulo

**Descripción:** Se reorganizó el menú frontend para exponer nuevos módulos y accesos por rol. Hace navegables las funcionalidades desarrolladas.

**Evidencia:** múltiples commits; `front/src/menu/index.ts`.

### Agregar documentación funcional y técnica de alto nivel

**Descripción:** Se generó documentación global del sistema, módulos, entidades, procesos, reglas e integraciones. Sirve como base para soporte, capacitación y transferencia de conocimiento.

**Evidencia:** commit `98a5922`; `docs/project-overview.md`, `docs/project-summary.md`, `docs/prompt.md`.

### Agregar AGENTS.md e instrucciones de trabajo del repo

**Descripción:** Se documentaron reglas de arquitectura, frontend y manejo de errores para mantener consistencia en futuras tareas. Reduce deuda de onboarding y mejora calidad de cambios posteriores.

**Evidencia:** commit `e178f64`; `AGENTS.md`.

---

## Mejoras transversales de UX y calidad

### Mejorar tema visual y navegación general

**Descripción:** Se ajustaron temas, layout, galería de menú y componentes base para mejorar consistencia visual y acceso a módulos. Aporta una experiencia más usable para perfiles operativos.

**Evidencia:** commits `a93ddf7`, `4750d8d`; `LightTheme`, `DarkTheme`, `GalleryMenu`.

### Corregir errores TypeScript y builds de despliegue

**Descripción:** Se realizaron ajustes para estabilizar compilación y despliegue luego de agregar módulos. Aunque no es feature funcional directo, habilita publicación de funcionalidades.

**Evidencia:** commits `e03771e`, `f49d394`, builds posteriores.

### Ajustar timezone en dashboards

**Descripción:** Se corrigió manejo de zona horaria en tableros para que fechas y métricas correspondan al día operativo esperado. Evita diferencias en reportes diarios.

**Evidencia:** commit `3f0d7b4`.

### Ordenar dashboards por fecha

**Descripción:** Se ajustó ordenamiento temporal en dashboards para lectura cronológica consistente. Mejora análisis operativo.

**Evidencia:** commits `b9ec9f1`, `f2323fb`.

---

## Lista compacta de posibles títulos de tickets

Esta sección resume los títulos que podrían cargarse como tickets independientes:

### Mail

- Implementar modelo integral de casillas de mail gestionables.
- Configurar conexión IMAP/POP/SMTP por mailbox.
- Sincronizar correos entrantes desde casillas configuradas.
- Evitar duplicados en sincronización de mails.
- Ordenar procesamiento de correos por antigüedad.
- Almacenar adjuntos de correos entrantes.
- Corregir resolución de paths de adjuntos.
- Extraer texto de adjuntos mediante PDF/OCR.
- Activar o desactivar análisis IA por mailbox.
- Clasificar mails con IA por categoría, sentimiento, prioridad, tags y entidades.
- Mostrar resumen IA y entidades extraídas en la gestión.
- Configurar sentimientos y prioridades por mailbox.
- Crear pantalla operativa de gestión de mails.
- Agregar vistas operativas por estado de mail.
- Implementar toma y reasignación de mails.
- Reabrir mails cerrados y asignarlos al operador.
- Cerrar gestiones con motivo configurable.
- Exigir respuesta antes de cerrar mails.
- Responder mails desde la plataforma.
- Enviar correos nuevos desde una casilla.
- Reenviar mails entrantes.
- Incluir historial de conversación en respuestas.
- Mostrar cadena de correos entrantes y salientes.
- Optimizar visualización del hilo de mails.
- Agregar editor enriquecido de mail.
- Permitir insertar tablas en el editor de mails.
- Enviar y reenviar mails con adjuntos.
- Configurar firmas por usuario y mailbox.
- Configurar comportamiento de siguiente mail al cerrar.
- Guardar estado de usuario por mail.
- Implementar sesiones de atención de operadores.
- Asignar automáticamente mails según capacidad.
- Permitir asignación manual sin límite de capacidad.
- Supervisar actividad live, diaria y mensual de mailboxes.
- Cerrar sesiones de operador desde supervisión.
- Agregar métricas de correos respondidos y cerrados por día.
- Agregar dashboard de mail.
- Configurar retención y purga de correos.
- Abrir gestión de mail por query param.
- Vincular categorías de mailbox con URLs de gestión externas.
- Abrir módulos externos en modal fullscreen desde mail.
- Agregar atajos de teclado en gestión de mail.
- Navegar mails con flechas.
- Mostrar indicador y posición del mail seleccionado.
- Optimizar queries y payloads de gestión de mail.
- Otorgar permisos de mail saliente a cobradores.
- Documentar y preparar capacitación del módulo mail.

### Transferencias

- Crear módulo de transferencias desde correos.
- Procesar lotes de mails entrantes como transferencias.
- Procesar individualmente un mail como transferencia.
- Marcar mail entrante con estado de procesamiento de transferencia.
- Evitar duplicados de transferencias por mail.
- Extraer datos de transferencia con IA.
- Detectar transferencias con consulta adicional.
- Agregar fallback de extracción sin IA.
- Gestionar estados IA y estados humanos de auditoría.
- Soportar múltiples transferencias o múltiples afiliados.
- Cambiar mes por concepto y ampliar detalle financiero.
- Agregar titular de cuenta a transferencia y exportación.
- Agregar pagadores y estrategias de identificación.
- Crear pagadores desde el flujo de transferencia.
- Reprocesar transferencias con reglas actuales de pagador.
- Re-evaluar transferencias enviadas a revisión humana.
- Implementar auditoría humana de transferencias.
- Crear sesiones de auditoría de transferencias.
- Asignar lotes de transferencia con lease temporal.
- Cerrar mail vinculado desde auditoría de transferencia.
- Mejorar vínculo visual entre transferencia y correo.
- Incorporar tabs de comprobante, OCR y email.
- Agregar ayuda funcional del proceso de transferencias.
- Exportar transferencias a Excel.
- Exportar múltiples afiliados con fila total y detalle.
- Agregar dashboard de transferencias.
- Mejorar vista y CRUD de transferencias.
- Aceptar más de una categoría de mail para transferencias.
- Configurar procesamiento automático de transferencias.
- Registrar fecha del mail y fecha de procesamiento.
- Ajustar prompt de localización y extracción.
- Aumentar límite de interacciones del proveedor IA.
- Registrar título operativo de procesamiento.

### Bajas / Bonificaciones

- Crear módulo de bajas y bonificaciones.
- Definir campos operativos de bonificación.
- Agregar período a bonificaciones.
- Incorporar selectores en el formulario de bajas.
- Forzar estado inicial pendiente.
- Validar observación para estado no aplicado.
- Restringir edición por permisos, creador y fecha.
- Crear dashboard de bonificaciones.
- Agregar filtros al dashboard de bonificaciones.
- Mejorar colores y layout de estados en bonificaciones.
- Exportar bonificaciones a Excel por rango y operador.
- Agregar importación de bonificaciones.
- Configurar roles de OperadorBaja y SupervisorBaja.

### Traspasos internos

- Crear módulo de traspasos internos.
- Registrar bonificaciones de traspaso con datos específicos.
- Validar adjunto bancario para transferencias bancarias.
- Aplicar reglas de edición por permisos, creador y fecha.
- Validar observación para traspasos no aplicados.
- Crear dashboard de traspasos internos.
- Exportar traspasos internos a Excel.
- Habilitar importación de traspasos internos.

### Llamados / WhatsApp

- Crear módulo de listados de llamadas.
- Crear pantalla de agente de llamadas.
- Registrar intentos de llamada.
- Ajustar vueltas del llamador.
- Registrar resultado exitoso o fallido de una llamada.
- Buscar llamadas por datos internos del registro.
- Exportar llamadas a Excel.
- Crear dashboard de llamadas.
- Agregar botón de refresco en dashboard.
- Filtrar listados por grupo/zona.
- Enviar WhatsApp por plantilla desde llamadas.
- Registrar mensajes de WhatsApp enviados.
- Manejar errores de integración WhatsApp.

### Afilmed / Padrón

- Crear módulo de padrón Afilmed/Premedic.
- Importar padrón desde archivo.
- Exponer búsqueda, exportación y combobox de padrón.

### Cobranzas / Convenios

- Crear módulo de cobranzas a domicilio / convenios.
- Cargar múltiples convenios desde formulario especializado.
- Exportar convenios filtrados.
- Crear dashboard de convenios.
- Ajustar filtros de grupo en dashboard/exportación.
- Configurar roles, menús y permisos de cobranzas.

### Recovery / Administración / Plataforma

- Crear módulo de recovery de base de datos.
- Crear backup y restore de archivos.
- Configurar permisos de recovery.
- Seleccionar proveedor IA por configuración.
- Inicializar roles funcionales del sistema.
- Ajustar menús principales por módulo.
- Agregar documentación funcional y técnica de alto nivel.
- Agregar AGENTS.md e instrucciones de trabajo del repo.
- Mejorar tema visual y navegación general.
- Corregir errores TypeScript y builds de despliegue.
- Ajustar timezone en dashboards.
- Ordenar dashboards por fecha.

