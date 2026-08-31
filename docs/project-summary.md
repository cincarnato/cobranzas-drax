
## Contexto general

Cobranzas Premedic es una plataforma interna para digitalizar, ordenar y automatizar tareas operativas de cobranzas y procesos asociados. El sistema busca reemplazar el uso de planillas Excel y gestiones descentralizadas por una aplicacion con trazabilidad, asignacion de trabajo, metricas, supervision e integraciones.

El foco funcional esta en el area de Cobranzas y el area de Bajas. Los usuarios principales informados son Operador, Cobrador, Supervisor y Administrador. En el sistema aparecen roles concretos como Admin, Cobrador, Llamador, OperadorBaja y SupervisorBaja.

Problemas que resuelve:

- centralizar informacion y gestiones;
- distribuir tareas entre operadores;
- evitar duplicidad de trabajo;
- registrar actividad y resultados;
- facilitar supervision y metricas;
- automatizar procesamiento de mails, transferencias, llamadas y archivos.

## Modulos funcionales

### Seguridad y administracion

**Objetivo:** controlar acceso, usuarios, roles, permisos, auditoria, configuracion general, archivos y tareas administrativas sensibles.

**Funcionalidades:**

- administracion de usuarios, roles y permisos;
- autenticacion con JWT, API keys y Google;
- control RBAC por permiso individual;
- auditoria y consulta de actividad;
- gestion de archivos;
- recuperacion, backup y restore de datos/archivos;
- administracion de parametros generales del sistema.

### Cobranzas / Convenios

**Objetivo:** gestionar cobranzas a domicilio o convenios de cobro vinculados a afiliados/deudores, importes, periodos y zonas de trabajo.

**Funcionalidades:**

- alta y mantenimiento de convenios;
- seguimiento por fecha, periodo, mes, domicilio, monto y grupo;
- dashboard operativo de convenios;
- exportacion de informacion para gestion externa o reporte;
- administracion de grupos/zona para organizar trabajo.

**Conceptos relevantes:**

- Convenio;
- Covenant;
- Cobranza a domicilio;
- Grupo/Zona;
- GroupZone;
- estado `activo`;
- estado `rechazado`;
- motivo o comentario de rechazo;
- usuario creador/actualizador.

### Llamados

**Objetivo:** administrar listados/campanas de llamadas y registrar las gestiones telefonicas de cobranza con resultados medibles.

**Funcionalidades:**

- creacion de listados desde archivos Excel;
- conversion de filas del archivo en gestiones de llamada;
- asignacion o visibilidad de listados por usuario o grupo/zona;
- pantalla de agente para operar una lista;
- registro de intentos, notas, tipificacion y resultado;
- registro de promesas de pago;
- contadores por listado: total, intentos, exitosas, fallidas y promesas;
- busqueda sobre datos dinamicos importados;
- exportacion de resultados;
- mantenimiento de tipificaciones de exito y fallo;
- envio de plantillas WhatsApp y registro de trazabilidad.

**Conceptos relevantes:**

- CallList / Listado de llamadas;
- CallLog / Gestion de llamada;
- CallAttempt / Intento;
- tipificacion;
- promesa de pago;
- fecha de promesa;
- estados de lista: `PREPARANDO`, `EN_CURSO`, `ARCHIVADO`, `FINALIZADO`, `VENCIDO`;
- estados de gestion: `pendiente`, `intentada`, `fallida`, `promesa`, `exitosa`;
- CallSuccessType;
- CallFailedType;
- WhatsappMessage;
- Sondeos / Multichannel.

### Mail / Gestion de casillas compartidas

**Objetivo:** convertir casillas corporativas compartidas en colas de trabajo ordenadas, asignables, trazables y supervisables.

**Funcionalidades:**

- configuracion de casillas de correo gestionadas por el sistema;
- definicion de operadores habilitados por casilla;
- sincronizacion manual o automatica de correos entrantes;
- almacenamiento y lectura de adjuntos;
- extraccion de texto desde PDF e imagenes mediante OCR;
- analisis IA para sugerir categoria, prioridad, sentimiento, resumen, etiquetas y entidades;
- vistas de trabajo: pendientes, asignados a mi, asignados en atencion, asignados, cerrados, enviados y destacados;
- asignacion manual o automatica de correos;
- sesiones de atencion para medir y distribuir carga;
- respuesta, reenvio y envio de correos nuevos desde la plataforma;
- cierre y reapertura de gestiones;
- supervision live, diaria y mensual de casillas y operadores;
- purga de correos segun retencion configurada.

**Conceptos relevantes:**

- Mailbox;
- Correo entrante / InboundEmail;
- Correo saliente / OutboundEmail;
- TemplateEmail;
- SessionEmail / Sesion de atencion;
- operador de mailbox;
- categoria;
- prioridad;
- sentimiento;
- etiqueta;
- entidad extraida;
- resumen IA;
- motivo de cierre;
- respuesta obligatoria para cerrar;
- estados de atencion: `PENDING`, `ASSIGNED`, `CLOSED`;
- estados de procesamiento: `PENDING`, `PROCESSING`, `PROCESSED`, `REVIEW_REQUIRED`, `REJECTED`, `ERROR`;
- destacado;
- hilo de correo;
- adjunto;
- OCR.

### Transferencias

**Objetivo:** procesar comprobantes o avisos de transferencias recibidos por mail, extraer datos relevantes y someterlos a auditoria humana antes de validarlos.

**Funcionalidades:**

- gestion de comprobantes de transferencia detectados desde correos;
- procesamiento manual o automatico de correos categorizados como transferencias/depositos;
- extraccion de importe, fecha, operacion, cuentas, pagador y afiliados mediante IA o fallback;
- creacion de uno o mas registros de transferencia por correo;
- deteccion y prevencion de duplicados por correo origen;
- reprocesamiento para recalcular pagador o afiliados;
- gestion de pagadores con distintas estrategias de identificacion;
- auditoria por sesiones con asignacion temporal de lotes;
- validacion, correccion o descarte humano;
- cierre del correo vinculado cuando corresponde;
- exportacion para control operativo.

**Conceptos relevantes:**

- TransferEmail;
- TransferAuditSession;
- Payer / Pagador;
- BankMovement / Movimiento bancario;
- comprobante de transferencia;
- pagador detectado;
- estrategia de identificacion: email, DNI/CUIL, CBU/CVU, numero de cuenta;
- afiliados afectados;
- lease/asignacion temporal;
- estados IA: `PENDIENTE`, `PROCESADO_CONFIABLE`, `PROCESADO_CON_DUDAS`, `PROCESADO_INCOMPLETO`, `PROCESADO_SIN_IA`, `ERROR_PROCESAMIENTO`;
- estados humanos: `PENDIENTE`, `VALIDADO`, `CORREGIDO`, `DESCARTADO`;
- estados generales: `PENDIENTE_IA`, `PENDIENTE_AUDITORIA`, `AUDITADO`;
- revision humana requerida.

### Bajas / Bonificaciones

**Objetivo:** registrar, controlar y exportar bonificaciones asociadas a procesos de baja.

**Funcionalidades:**

- carga y mantenimiento de bonificaciones;
- seguimiento por operador y fecha;
- dashboard de bonificaciones;
- importacion/exportacion operativa;
- control de edicion segun permisos, creador y fecha;
- obligacion de justificar bonificaciones no aplicadas.

**Conceptos relevantes:**

- Bonus / Bonificacion;
- baja;
- plan;
- mes de aplicacion;
- metodo de pago;
- periodo de bonificacion;
- valor bonificado;
- estado `Pendiente`;
- estado `Aplicado`;
- estado `No aplicado`;
- observacion obligatoria;
- operador de baja;
- supervisor de baja.

### Traspasos internos

**Objetivo:** registrar y controlar bonificaciones vinculadas a traspasos internos, incluyendo casos que requieren transferencia bancaria.

**Funcionalidades:**

- carga y mantenimiento de bonificaciones por traspaso interno;
- dashboard y exportacion;
- adjunto de datos bancarios cuando el tipo es transferencia bancaria;
- control de edicion segun permisos, creador y fecha;
- obligacion de justificar registros no aplicados.

**Conceptos relevantes:**

- InternalTransferBonus;
- traspaso interno;
- tipo `Credito en Cuenta Corriente`;
- tipo `Transferencia Bancaria`;
- adjunto bancario;
- estado `Pendiente`;
- estado `Aplicado`;
- estado `No aplicado`;
- observacion obligatoria.

### Afilmed / Padron

**Objetivo:** mantener informacion importada de afiliados/deudores, deuda, contacto, plan, domicilio y medios de pago como fuente operativa para cobranzas.

**Funcionalidades:**

- consulta y administracion de registros de padron;
- importacion de padrones desde archivos;
- busqueda de afiliados/deudores por datos identificatorios o de contacto;
- disponibilidad de datos para llamados, cobranzas y analisis operativo.

**Conceptos relevantes:**

- Padron;
- contrato;
- afiliado/deudor;
- deuda;
- periodo de deuda;
- plan;
- domicilio;
- forma de pago;
- cobrador;
- CBU SIRO;
- baja.

### Premedic / Afiliados

**Objetivo:** administrar informacion base de afiliados Premedic y tipos de afiliado, usada como referencia por otros procesos.

**Funcionalidades:**

- gestion de afiliados;
- gestion de tipos de afiliado;
- asociacion entre afiliado y titular;
- soporte a procesos que necesitan identificar personas por DNI, CUIL/CUIT o titular.

**Conceptos relevantes:**

- Afiliado;
- Tipo de afiliado;
- Titular;
- DNI;
- CUIL/CUIT;
- relacion titular-afiliado.

## Flujos principales

- **Gestion de cobranza a domicilio:** se carga un convenio con datos del afiliado/deudor, domicilio, periodo, monto y grupo/zona; luego se consulta, actualiza, rechaza o exporta para gestion y control.

- **Gestion de llamadas:** se crea un listado desde Excel, cada fila se transforma en una gestion, el operador registra intentos y resultados, y el sistema mantiene metricas de avance, promesas, exitos y fallos.
- **Envio WhatsApp:** desde una gestion se envia una plantilla por Sondeos/Multichannel y se registra el mensaje enviado con usuario, destino y template.
- **Atencion de mails:** un operador inicia sesion sobre una casilla, toma o recibe correos, los revisa, clasifica, responde/reenvia y cierra la gestion cumpliendo reglas del mailbox.
- **Sincronizacion y clasificacion de mails:** el sistema trae correos por IMAP, guarda adjuntos, puede aplicar OCR y usa IA para clasificar, resumir y extraer datos.
- **Procesamiento de transferencias:** correos procesados y categorizados como transferencias se analizan para crear registros de transferencia; si la IA falla, se genera un registro minimo para completar manualmente.
- **Auditoria de transferencias:** un operador inicia una sesion, recibe un lote temporal, valida/corrige/descarta cada transferencia y el sistema evita doble auditoria por vencimiento y asignacion.
- **Bonificaciones de bajas/traspasos:** operadores cargan bonificaciones en estado pendiente; supervisores u operadores autorizados actualizan estado y exportan, con observacion obligatoria si no se aplican.
- **Importacion de padron:** se sube un archivo de padron, se importan registros con deuda/contacto/plan y esa informacion queda disponible para busqueda y soporte operativo.

## Integraciones relevantes

- **IMAP:** lectura de casillas corporativas.
- **SMTP/Gmail:** envio de respuestas, reenvios y correos nuevos.
- **Sondeos / Multichannel:** envio de mensajes WhatsApp por plantilla.
- **IA Drax:** clasificacion de mails y extraccion de datos de transferencias.
- **OCR/PDF:** lectura de texto en adjuntos para mejorar clasificacion y extraccion.
- **Media/File:** almacenamiento de archivos, adjuntos e importaciones.
- **Excel:** entrada/salida operativa para padrones, listados, reportes y exportaciones.

## Tecnologia util para interpretar tickets

El sistema es un monorepo TypeScript con frontend Vue 3 + Vuetify y backend Fastify. Usa modulos Drax para CRUD, identidad, permisos, auditoria, settings, dashboard, media e IA. La persistencia principal es MongoDB/Mongoose, con repositorios SQLite alternativos en varias entidades. La validacion se realiza con Zod. El frontend usa Vue Router, Pinia e i18n. Hay procesos automaticos separados para sincronizacion de mails y procesamiento de transferencias.

