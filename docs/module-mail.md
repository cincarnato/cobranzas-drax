# Modulo de mails

## Objetivo del modulo

El modulo de mails centraliza la atencion de casillas corporativas compartidas, por ejemplo una cuenta de un area que recibe muchos correos por dia y necesita ser atendida por varios operadores.

En lugar de que cada persona ingrese directamente al webmail o trabaje sin visibilidad sobre lo que hacen los demas, la plataforma permite:

- Recibir los correos de una casilla corporativa dentro del sistema.
- Distribuir la atencion entre operadores autorizados.
- Evitar que dos personas respondan el mismo correo al mismo tiempo.
- Clasificar los correos por categoria, prioridad, sentimiento y etiquetas.
- Responder desde la plataforma y mantener el historial de la conversacion.
- Cerrar gestiones con reglas configurables.
- Supervisar en tiempo real el estado de la casilla y la actividad de los operadores.
- Obtener metricas operativas para seguimiento y reporteria.

La idea principal es transformar una bandeja de entrada con alto volumen en una cola de trabajo ordenada, medible y distribuible.

## Conceptos principales

### Mailbox

Un mailbox representa una casilla de correo que la plataforma va a gestionar. Puede ser una cuenta corporativa como cobranzas, atencion al cliente, administracion, legales u otra area de la empresa.

Cada mailbox define tres aspectos importantes:

- Como se conecta la plataforma al servidor de mail.
- Como se organiza la gestion diaria de los correos.
- Como se comporta el analisis con inteligencia artificial.

### Correo entrante

Es cada email recibido desde la casilla configurada. Al ingresar al sistema, el correo queda disponible para gestionarse, asignarse, responderse, clasificarse y cerrarse.

### Operador

Es el usuario que atiende correos. Para trabajar sobre una casilla, el operador debe estar incluido en la configuracion del mailbox correspondiente.

### Sesion de atencion

Es el estado de trabajo del operador dentro de una casilla. Cuando el operador inicia la atencion, la plataforma puede considerarlo disponible para recibir o tomar correos. La sesion tambien registra actividad, respuestas, cierres y cantidad de casos en curso.

## Configuracion del mailbox

La configuracion del mailbox se realiza desde la pantalla de administracion de mailboxes. Esta configuracion impacta en la conexion con el servidor de correo, en las opciones visibles dentro de Email Management y en el analisis IA que se aplica a cada correo.

### Datos generales

En la seccion General se cargan los datos basicos de la casilla:

- Nombre: identifica la casilla dentro de la plataforma.
- Email: direccion de correo corporativa que se va a gestionar.
- Usuario: usuario utilizado para conectarse al servidor de mail.
- Password: clave de acceso de la casilla.
- Activo: indica si el mailbox esta disponible para operar.

Estos datos permiten que la plataforma identifique la casilla y sepa con que credenciales debe conectarse.

### Conexion IMAP

IMAP se utiliza para leer correos desde el servidor manteniendo la logica de una bandeja sincronizada.

La configuracion incluye:

- Habilitar IMAP.
- Host del servidor.
- Puerto.
- Uso de TLS.

Cuando el procesamiento se realiza por IMAP, la plataforma consulta la casilla en el servidor y trae los correos entrantes para convertirlos en casos gestionables.

### Conexion POP

POP es otra forma de leer correos desde el servidor. La configuracion incluye:

- Habilitar POP.
- Host del servidor.
- Puerto.
- Uso de TLS.

En la practica, la empresa debe elegir el protocolo indicado segun como este configurado su servidor de mail. El campo Protocolo de procesamiento define si se usara IMAP o POP para traer los correos.

### Conexion SMTP

SMTP se utiliza para enviar correos desde la plataforma usando la misma casilla corporativa.

La configuracion incluye:

- Habilitar SMTP.
- Host del servidor.
- Puerto.
- Uso de TLS.

Esta seccion es clave para que los operadores puedan responder correos o redactar nuevos mensajes desde Email Management sin salir de la plataforma.

### Gestion operativa

La seccion Gestion define como se trabaja la casilla en el dia a dia.

Categorias:
Permiten ordenar los correos por tipo de gestion. Por ejemplo, reclamos, pagos, facturacion, consultas o derivaciones internas. Las categorias aparecen como opciones de filtro y clasificacion en Email Management.

URL de gestion por categoria:
Cada categoria puede tener una URL asociada. Cuando un correo queda clasificado con esa categoria, la pantalla de detalle puede mostrar un acceso directo para abrir otra pantalla del sistema relacionada con esa gestion. La plataforma agrega el identificador del correo a la URL para mantener el contexto.

Motivos de cierre:
Permiten registrar por que se cierra una gestion. Por ejemplo, respondido, resuelto, duplicado, derivado o no corresponde.

Motivo de cierre obligatorio:
Si esta opcion esta activa, el operador no puede cerrar la gestion sin seleccionar un motivo.

Respuesta obligatoria para cerrar:
Si esta opcion esta activa, el operador debe haber enviado al menos una respuesta antes de cerrar el correo.

Operadores:
Define que usuarios pueden trabajar sobre ese mailbox. Solo los operadores incluidos en la casilla pueden verla y gestionarla desde Email Management.

Maximo de correos asignables por usuario:
Define la capacidad maxima de trabajo simultaneo por operador. Sirve para distribuir la carga y evitar que una persona acumule demasiados correos en curso.

### Procesamiento

La seccion Procesamiento define como se incorporan y conservan los correos.

Procesamiento automatico:
Cuando esta activo, la plataforma revisa periodicamente la casilla y trae nuevos correos sin intervencion manual.

Intervalo de procesamiento:
Define cada cuantos minutos se revisa la casilla.

Protocolo de procesamiento:
Indica si la lectura de correos se realiza por IMAP o POP.

Almacenamiento de adjuntos:
Permite guardar los archivos adjuntos recibidos junto con el correo.

OCR de adjuntos:
Permite extraer texto de ciertos adjuntos, como imagenes o PDF, para que ese contenido tambien pueda ser considerado en el analisis.

Dias de retencion:
Define por cuanto tiempo se conservan los correos del mailbox. Cuando se configura, ayuda a mantener el volumen de informacion bajo control.

### Analisis IA

La seccion Analisis IA define que informacion puede sugerir o completar la inteligencia artificial al procesar correos.

Analisis IA habilitado:
Activa o desactiva el analisis automatico de los correos entrantes.

Categorias:
La IA puede utilizar las categorias configuradas para sugerir una clasificacion inicial del correo.

Sentimientos:
Permiten identificar el tono general del mensaje. Por defecto se contemplan opciones como positivo, negativo y neutral. Esto ayuda a detectar reclamos, disconformidades o mensajes que requieren mayor cuidado.

Prioridades:
Permiten destacar correos segun urgencia o importancia. Por defecto existen prioridades baja, media y alta, con iconos y colores para facilitar la lectura visual.

Etiquetas:
Son palabras clave que ayudan a agrupar correos por temas transversales. Sirven para filtros, busquedas y analisis posterior.

Entidades:
Permiten indicar datos que la IA debe intentar detectar dentro del correo. Por ejemplo, nombre, documento, numero de afiliado, telefono, importe, fechas u otros datos relevantes para el negocio.

Resumen:
Cuando el analisis IA esta activo, el correo puede incluir un resumen para que el operador entienda rapidamente el motivo del contacto sin leer todo el hilo desde cero.

## Email Management

Email Management es la pantalla principal de trabajo para los operadores. Esta pensada para resolver la problematica de una empresa que recibe mucho volumen de correo en cuentas compartidas y necesita organizar la atencion entre varias personas.

La pantalla se divide en tres grandes zonas:

- Barra lateral: seleccion de mailbox, sesion de atencion, vistas principales y categorias.
- Barra superior: busqueda, filtros, refresco, paginacion y densidad de visualizacion.
- Area principal: listado de correos, detalle del correo seleccionado, historial y panel de gestion.

### Seleccion de mailbox

El operador primero selecciona la casilla sobre la que va a trabajar. Solo vera los mailboxes en los que este configurado como operador.

Esto es importante porque cada casilla puede tener sus propias categorias, prioridades, motivos de cierre, operadores y reglas de gestion.

### Sesion de atencion

Antes de comenzar la jornada o el bloque de trabajo, el operador puede iniciar su atencion sobre el mailbox.

La sesion muestra:

- Estado de atencion: activa o pausada.
- Duracion de la sesion.
- Cantidad de correos asignados durante la sesion.
- Cantidad de respuestas enviadas.
- Cantidad de gestiones cerradas.
- Cantidad de casos actualmente en curso frente al maximo permitido.

Acciones disponibles:

- Iniciar atencion: marca al operador como disponible.
- Pausar: mantiene la sesion pero detiene temporalmente la atencion.
- Reanudar: vuelve a activar la atencion.
- Finalizar: cierra la sesion de atencion.

Si el operador finaliza la atencion con correos todavia asignados, esos casos continuan asignados a esa persona, pero deja de recibir nuevas asignaciones automaticas.

### Vistas de trabajo

La barra lateral permite cambiar rapidamente entre distintas vistas:

- Pendientes: correos que aun no fueron asignados.
- Asignados a mi: correos que tiene asignados el usuario actual.
- Asignados en atencion: correos asignados dentro de la sesion activa.
- Asignados: correos ya tomados por algun operador.
- Cerrados: gestiones finalizadas.
- Enviados: correos enviados desde la plataforma.
- Destacados: correos marcados por el usuario para seguimiento.

Estas vistas ayudan a separar el trabajo pendiente, el trabajo propio, el trabajo del equipo y el historial.

### Categorias

Las categorias configuradas en el mailbox aparecen en la barra lateral y en los filtros. Permiten enfocar la bandeja en un tipo de gestion concreto.

Por ejemplo, un operador puede revisar solo correos de reclamos, otro puede concentrarse en pagos, y un supervisor puede mirar una categoria especifica para detectar atrasos o acumulacion.

### Busqueda y filtros

La barra superior permite encontrar correos rapidamente.

Filtros disponibles:

- Busqueda por texto.
- Categoria.
- Prioridad.
- Operador asignado.
- Correos con adjuntos.
- Fecha de recepcion desde.
- Fecha de recepcion hasta.
- Etiquetas.
- Correos sin respuesta.

Los filtros activos se muestran como chips, para que el usuario pueda ver facilmente que condiciones esta aplicando y quitar alguna sin limpiar todo.

Tambien se puede:

- Limpiar filtros.
- Actualizar el listado.
- Cambiar la cantidad de correos por pagina.
- Navegar entre paginas.
- Cambiar la densidad entre vista comoda y compacta.

### Listado de correos

El listado muestra los correos de la vista seleccionada. Cada item permite identificar rapidamente informacion clave como asunto, remitente, fecha, estado, categoria, prioridad, sentimiento, adjuntos y estado de respuesta.

El usuario puede marcar correos como destacados para volver a encontrarlos con facilidad.

Al abrir un correo, la plataforma lo marca como leido para ese usuario.

### Detalle del correo

El detalle muestra la conversacion completa asociada al correo:

- Datos del remitente.
- Destinatarios.
- Fecha de recepcion.
- Asunto.
- Estado de la gestion.
- Asignacion actual.
- Categoria.
- Indicadores de prioridad y sentimiento.
- Hilo de mensajes entrantes y salientes.
- Adjuntos, cuando corresponda.

El operador puede leer el contexto completo antes de tomar una accion.

### Tomar y asignar correos

Para responder o cerrar una gestion, el correo debe estar asignado al operador.

Acciones posibles:

- Tomar correo: asigna el caso al usuario actual.
- Tomar correo asignado a otro usuario: permite reasignarlo al usuario actual, con confirmacion.
- Asignar a usuario: disponible para perfiles con permisos de supervision o reasignacion.

Esta logica evita que varios operadores trabajen al mismo tiempo sobre el mismo correo sin coordinacion.

### Responder correos

Cuando el correo esta asignado al operador y la gestion no esta cerrada, aparece el editor de respuesta.

El editor permite:

- Responder al remitente.
- Agregar destinatarios en copia o copia oculta.
- Editar el asunto.
- Escribir el mensaje con formato.
- Adjuntar archivos.
- Enviar la respuesta desde el mailbox configurado.
- Opcionalmente cerrar la gestion luego de responder.

Las respuestas quedan asociadas al hilo del correo, permitiendo consultar el historial desde la misma pantalla.

### Redactar nuevos correos

Desde el boton Redactar se puede crear un correo nuevo usando el mailbox seleccionado como casilla de envio.

Esta funcion sirve para comunicaciones que nacen desde la empresa y no necesariamente como respuesta a un correo entrante.

Los correos enviados pueden consultarse desde la vista Enviados.

### Clasificacion manual

El panel de gestion permite revisar y corregir la clasificacion del correo:

- Prioridad.
- Sentimiento.
- Categoria.
- Motivo de cierre.

Aunque la IA sugiera valores, el operador puede ajustarlos segun su criterio. Los cambios se guardan automaticamente.

### Entidades extraidas y etiquetas

Cuando el analisis IA esta activo, el sistema puede mostrar datos extraidos del contenido del correo y sus adjuntos, como datos del cliente u otra informacion configurada en el mailbox.

Tambien puede mostrar etiquetas asociadas al caso. Esto ayuda a detectar temas repetidos y facilita el filtrado posterior.

### Cierre de gestion

Cerrar una gestion indica que el caso ya fue atendido.

Segun la configuracion del mailbox, la plataforma puede exigir:

- Que el correo tenga al menos una respuesta enviada.
- Que se seleccione un motivo de cierre.

Estas reglas ayudan a mantener criterios consistentes entre operadores y a mejorar la calidad de la reporteria.

### Reabrir una gestion

Los usuarios con permisos pueden reabrir un correo cerrado y tomarlo nuevamente. Esto es util cuando un caso fue cerrado por error o necesita una nueva intervencion.

## Email Supervision

Email Supervision es la pantalla orientada al monitoreo en tiempo real de la operacion.

Su objetivo es que supervisores o responsables de equipo puedan ver el estado actual de una casilla, la carga de trabajo y la actividad de los operadores sin tener que revisar correo por correo.

### Seleccion de mailbox y actualizacion

La pantalla permite seleccionar el mailbox a supervisar y actualizar la informacion manualmente.

Ademas, la vista se refresca periodicamente mientras la pantalla esta abierta, para mantener la informacion al dia.

### Indicadores generales

En la parte superior se muestran indicadores resumidos:

- Operadores activos.
- Operadores pausados.
- Correos pendientes.
- Correos asignados.
- Correos cerrados hoy.

Estos datos permiten entender rapidamente si la casilla esta ordenada, si hay acumulacion de pendientes o si el equipo esta trabajando con capacidad suficiente.

### Filtros de supervision

La pantalla permite filtrar operadores por:

- Estado.
- Nombre o email del operador.
- Incluir operadores sin sesion.

Estados disponibles:

- Activo: el operador esta en atencion.
- Pausado: el operador tiene una sesion iniciada pero pausada.
- Fuera de sesion: el operador no esta actualmente atendiendo.

### Tabla de operadores

La tabla muestra una fila por operador y permite comparar rapidamente la actividad del equipo.

Columnas principales:

- Operador.
- Estado.
- Duracion de la sesion.
- Casos en curso frente a la capacidad configurada.
- Correos asignados durante la sesion.
- Correos respondidos.
- Correos cerrados.
- Ultima actividad.

Si un operador figura activo pero sin actividad reciente, la pantalla lo marca como una advertencia para facilitar el seguimiento.

### Detalle del operador

Al seleccionar un operador se abre un panel lateral con informacion ampliada:

- Estado actual.
- Inicio de la sesion.
- Duracion.
- Ultima actividad.
- Capacidad utilizada.
- Metricas de asignados, respondidos y cerrados.
- Casos actualmente asignados.

Desde ese panel se puede abrir un caso asignado para revisar su detalle.

### Uso operativo de la supervision

Email Supervision ayuda a responder preguntas como:

- Cuantos correos quedan pendientes en la casilla.
- Quienes estan activos en este momento.
- Quienes pausaron la atencion.
- Que operadores tienen mas carga.
- Que operadores tienen capacidad disponible.
- Cuantos casos se respondieron o cerraron durante la jornada.
- Si hay operadores activos sin actividad reciente.

Esto facilita redistribuir trabajo, detectar cuellos de botella y sostener una atencion ordenada en casillas con alto volumen.

## Flujo recomendado de trabajo

1. El administrador configura el mailbox con conexion, operadores, categorias, prioridades, motivos de cierre y reglas de gestion.
2. La plataforma procesa los correos entrantes desde el servidor de mail.
3. La IA analiza los correos si el mailbox lo tiene habilitado.
4. Los operadores ingresan a Email Management y seleccionan la casilla.
5. Cada operador inicia su sesion de atencion.
6. Los correos se toman, asignan o reasignan segun la carga del equipo.
7. El operador revisa el detalle, responde y clasifica si hace falta.
8. La gestion se cierra cuando cumple las reglas del mailbox.
9. El supervisor monitorea la operacion desde Email Supervision.

## Beneficios para usuarios finales

- Mayor orden sobre cuentas corporativas compartidas.
- Menor riesgo de respuestas duplicadas o casos olvidados.
- Mejor distribucion del trabajo entre operadores.
- Trazabilidad de quien tomo, respondio y cerro cada correo.
- Priorizacion visual para detectar casos urgentes.
- Clasificacion uniforme por categorias, motivos y etiquetas.
- Visibilidad de productividad y carga operativa.
- Mejor base de informacion para reportes y decisiones.
