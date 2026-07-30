# Guion de capacitacion - Modulo de mails

## Enfoque del video

Publico objetivo:
Usuarios finales, operadores, supervisores y responsables de area.

Objetivo:
Presentar el modulo de mails como una herramienta para ordenar la atencion de casillas corporativas compartidas, distribuir el trabajo entre operadores y dar visibilidad de la operacion.

Tono sugerido:
Claro, practico y orientado al uso diario. Evitar explicaciones tecnicas salvo cuando sean necesarias para entender una configuracion.

Formato recomendado:
Grabar en segmentos cortos. Cada segmento puede grabarse como un bloque separado y luego editarse en un video unico.

---

## Segmento 1 - Introduccion al problema y objetivo del modulo

Duracion estimada:
1 a 2 minutos.

Pantalla sugerida:
Mostrar la pantalla principal del modulo o el menu donde se accede a Email Management.

Guion:

En este video vamos a recorrer el modulo de mails de la plataforma.

Este modulo esta pensado para empresas que trabajan con casillas corporativas compartidas, por ejemplo una cuenta de cobranzas, administracion, atencion al cliente o cualquier area que recibe mucho volumen de correo.

El problema habitual con estas casillas es que muchas personas necesitan atender los mismos correos. Entonces puede pasar que dos operadores respondan el mismo mensaje, que un correo quede sin atender, que no sepamos quien lo tomo, o que sea dificil medir cuanta carga tiene cada persona.

La plataforma busca ordenar ese trabajo.

Cada correo que entra a la casilla se convierte en una gestion dentro del sistema. Desde ahi se puede asignar a un operador, responder, clasificar, cerrar y luego consultar el historial.

Ademas, los supervisores pueden ver en tiempo real como esta la casilla: cuantos correos hay pendientes, que operadores estan activos, cuantos casos tiene cada uno y que actividad se esta generando.

La idea es que la bandeja de entrada deje de ser solamente una lista de mails y pase a funcionar como una cola de trabajo ordenada, compartida y medible.

---

## Segmento 2 - Conceptos basicos antes de usar el modulo

Duracion estimada:
1 minuto.

Pantalla sugerida:
Mostrar el menu del modulo y, si es posible, una casilla seleccionada.

Guion:

Antes de entrar en las pantallas, repasemos algunos conceptos simples.

Cuando hablamos de mailbox, nos referimos a la casilla de correo que la plataforma va a gestionar. Por ejemplo, una casilla de cobranzas o una casilla de atencion.

Cada correo entrante es un email recibido en esa casilla. Una vez que ingresa a la plataforma, ese correo se puede atender como un caso de trabajo.

Los operadores son los usuarios que van a gestionar esos correos. Cada operador debe estar habilitado dentro del mailbox correspondiente.

Y la sesion de atencion es el momento en que el operador indica que esta trabajando sobre una casilla. Mientras la sesion esta activa, la plataforma puede registrar su actividad y mostrar sus metricas de trabajo.

Con estos conceptos, ya podemos ver primero como se configura una casilla y despues como se trabaja en el dia a dia.

---

## Segmento 3 - Configuracion del mailbox: datos generales

Duracion estimada:
1 a 2 minutos.

Pantalla sugerida:
Abrir la pantalla de administracion de mailboxes y crear o editar un mailbox. Mostrar la pestana General.

Guion:

La configuracion del mailbox es el punto de partida.

Desde esta pantalla se define que casilla va a gestionar la plataforma y como se va a comportar despues en la operacion.

En la pestana General encontramos los datos principales.

El nombre sirve para identificar la casilla dentro del sistema. Conviene usar un nombre claro, por ejemplo Cobranzas, Atencion al Cliente o Administracion.

El email es la direccion real de la casilla corporativa.

El usuario y la clave son los datos que la plataforma va a utilizar para conectarse al servidor de mail.

Y el campo Activo indica si esa casilla esta disponible para ser utilizada. Si una casilla ya no se usa, se puede desactivar para que no forme parte de la operacion diaria.

Esta informacion parece simple, pero es importante porque todo el modulo se organiza alrededor del mailbox seleccionado.

---

## Segmento 4 - Configuracion del mailbox: conexion al servidor de mail

Duracion estimada:
2 a 3 minutos.

Pantalla sugerida:
Mostrar las pestanas IMAP, POP, SMTP y Procesamiento.

Guion:

Ahora vamos a ver la configuracion de conexion.

La plataforma necesita dos tipos de conexion con el servidor de correo.

Por un lado, necesita leer los correos que llegan a la casilla. Para eso puede usar IMAP o POP, segun como este configurado el servidor de mail de la empresa.

En la pestana IMAP se indica si IMAP esta habilitado, cual es el servidor, el puerto y si utiliza conexion segura.

En la pestana POP aparece una configuracion similar, pero para el protocolo POP.

No hace falta que el operador final conozca el detalle tecnico de estos protocolos. Lo importante es entender que esta configuracion permite que la plataforma traiga los correos entrantes desde la casilla corporativa.

Luego tenemos SMTP.

SMTP es la configuracion que se usa para enviar correos desde la plataforma. Esto permite que el operador responda o redacte mensajes sin salir del sistema, usando la misma casilla corporativa.

En la pestana Procesamiento se define como se van a traer los correos.

El procesamiento automatico permite que la plataforma revise la casilla periodicamente. El intervalo indica cada cuantos minutos se hace esa revision.

Tambien se define si el procesamiento se hara por IMAP o por POP.

Y hay configuraciones relacionadas con adjuntos: si se guardan los archivos recibidos y si se intenta extraer texto de adjuntos, por ejemplo de imagenes o PDF, para que esa informacion tambien pueda ayudar en el analisis.

Por ultimo, los dias de retencion permiten definir durante cuanto tiempo se conservaran los correos dentro de la plataforma.

---

## Segmento 5 - Configuracion del mailbox: reglas de gestion

Duracion estimada:
2 a 3 minutos.

Pantalla sugerida:
Mostrar la pestana Gestion.

Guion:

La pestana Gestion define como se va a trabajar la casilla en el dia a dia.

Primero tenemos las categorias.

Las categorias sirven para ordenar los correos por tipo de tramite o motivo. Por ejemplo, se pueden configurar categorias como reclamos, pagos, facturacion, consultas o derivaciones.

Estas categorias despues aparecen en Email Management para filtrar correos y tambien para clasificar cada gestion.

Cada categoria puede tener una direccion de gestion asociada. Esto sirve para que, cuando un correo pertenezca a una categoria determinada, el sistema muestre un acceso directo a otra pantalla relacionada. Por ejemplo, una pantalla interna donde se resuelve ese tipo de caso.

Despues tenemos los motivos de cierre.

Los motivos de cierre permiten indicar por que se finaliza una gestion. Por ejemplo: respondido, resuelto, duplicado, derivado o no corresponde.

Tambien se puede configurar que el motivo de cierre sea obligatorio. Si esta opcion esta activa, el operador no podra cerrar el caso sin elegir un motivo.

Otra regla importante es la respuesta obligatoria para cerrar. Si esta opcion esta activa, el operador tiene que enviar al menos una respuesta antes de cerrar la gestion.

Luego estan los operadores.

Aca se define que usuarios pueden trabajar sobre este mailbox. Esto es importante porque un usuario solo vera y gestionara las casillas donde este incluido como operador.

Por ultimo, el maximo de correos asignables por usuario permite limitar cuantos casos puede tener una persona en curso al mismo tiempo.

Esta configuracion ayuda a distribuir la carga y evita que un operador acumule demasiados correos mientras otros tienen disponibilidad.

---

## Segmento 6 - Configuracion del mailbox: analisis IA

Duracion estimada:
2 minutos.

Pantalla sugerida:
Mostrar la pestana Analisis IA y luego, si hay datos, un correo con prioridad, sentimiento, etiquetas o resumen.

Guion:

La pestana Analisis IA permite definir como la inteligencia artificial puede ayudar en la clasificacion de los correos.

Si el analisis IA esta habilitado, la plataforma puede leer el contenido del correo y sugerir informacion util para la gestion.

Por ejemplo, puede sugerir una categoria, una prioridad, un sentimiento, etiquetas y un resumen.

Las prioridades ayudan a detectar rapidamente si un correo requiere atencion normal o si deberia tratarse con mayor urgencia.

Los sentimientos permiten identificar el tono general del mensaje. Por ejemplo, si el correo expresa conformidad, una consulta neutral o una disconformidad.

Las etiquetas sirven para agrupar temas que se repiten. Esto despues ayuda a filtrar, buscar y analizar tendencias.

Tambien se pueden configurar entidades, que son datos que la plataforma intentara detectar dentro del correo. Por ejemplo, nombre, documento, telefono, numero de afiliado, importe o cualquier dato relevante para el negocio.

Es importante aclarar que la IA ayuda a acelerar la lectura y la clasificacion, pero el operador puede revisar y corregir los datos cuando sea necesario.

---

## Segmento 7 - Email Management: recorrido general de la pantalla

Duracion estimada:
2 minutos.

Pantalla sugerida:
Abrir Email Management con un mailbox seleccionado.

Guion:

Ahora vamos a pasar a Email Management, que es la pantalla principal de trabajo para los operadores.

La pantalla esta dividida en tres zonas.

A la izquierda tenemos la barra lateral. Desde ahi seleccionamos el mailbox, iniciamos o pausamos la atencion, cambiamos de vista y filtramos por categorias.

En la parte superior tenemos la barra de busqueda y filtros. Desde aca podemos buscar correos, filtrar por prioridad, categoria, operador asignado, fechas, adjuntos, etiquetas o correos sin respuesta.

Y en el centro tenemos el listado de correos. Cuando seleccionamos uno, se abre el detalle con el historial de la conversacion y el panel de gestion.

Esta pantalla esta pensada para que el operador pueda hacer todo desde un solo lugar: revisar la bandeja, tomar un correo, responderlo, clasificarlo y cerrarlo.

---

## Segmento 8 - Email Management: iniciar atencion y entender la sesion

Duracion estimada:
2 minutos.

Pantalla sugerida:
Mostrar el panel de sesion en la barra lateral. Hacer clic en Iniciar atencion. Luego mostrar Pausar, Reanudar y Finalizar.

Guion:

Cuando un operador comienza a trabajar, lo primero recomendable es iniciar la atencion.

Al presionar Iniciar atencion, el sistema registra que este usuario esta activo en esta casilla.

A partir de ese momento se muestran las metricas de la sesion: cuanto tiempo lleva trabajando, cuantos correos se le asignaron, cuantas respuestas envio, cuantos casos cerro y cuantos tiene actualmente en curso.

Tambien se ve la capacidad actual. Por ejemplo, si la casilla permite tener hasta cierta cantidad de correos asignados por usuario, aca se muestra cuantos casos tiene el operador frente a ese limite.

Si el operador necesita hacer una pausa, puede presionar Pausar. En ese estado, la sesion queda abierta, pero se indica que no esta atendiendo activamente.

Cuando vuelve a trabajar, presiona Reanudar.

Y al terminar la jornada o el bloque de trabajo, puede presionar Finalizar.

Si todavia tiene casos asignados, esos casos siguen quedando a su nombre, pero el operador deja de figurar como disponible para nuevas asignaciones automaticas.

---

## Segmento 9 - Email Management: vistas de trabajo

Duracion estimada:
2 minutos.

Pantalla sugerida:
Ir cambiando entre Pendientes, Asignados a mi, Asignados en atencion, Asignados, Cerrados, Enviados y Destacados.

Guion:

En la barra lateral encontramos las vistas principales de trabajo.

Pendientes muestra los correos que todavia no fueron asignados. Esta es la cola inicial de trabajo.

Asignados a mi muestra los casos que tiene asignados el usuario actual.

Asignados en atencion muestra los correos asignados dentro de la sesion activa.

Asignados muestra correos que ya fueron tomados por algun operador.

Cerrados muestra las gestiones finalizadas.

Enviados permite consultar los correos enviados desde la plataforma.

Y Destacados muestra los correos que el usuario marco con la estrella para encontrarlos mas rapido despues.

Estas vistas ayudan a separar lo pendiente, lo propio, lo que esta trabajando el equipo y el historial.

---

## Segmento 10 - Email Management: busqueda y filtros

Duracion estimada:
2 a 3 minutos.

Pantalla sugerida:
Aplicar una busqueda de texto, elegir categoria, prioridad, asignado, fecha, adjuntos, etiquetas y sin respuesta. Mostrar los chips de filtros activos y luego limpiar.

Guion:

Cuando una casilla tiene mucho volumen, los filtros son fundamentales.

En la parte superior podemos buscar por texto para encontrar correos por asunto, remitente o contenido relacionado.

Tambien podemos filtrar por categoria, por prioridad o por operador asignado.

Si necesitamos revisar correos con documentacion, podemos marcar el filtro de adjuntos.

Tambien podemos acotar por fecha de recepcion, usando desde y hasta.

Las etiquetas permiten agrupar temas especificos, y el filtro Sin respuesta ayuda a detectar correos que todavia no tuvieron contestacion.

Cada filtro activo aparece como una etiqueta visual. Esto nos permite ver rapidamente que estamos aplicando y quitar filtros puntuales sin perder el resto.

Tambien tenemos el boton para limpiar todos los filtros, el boton de actualizar, la paginacion, la cantidad de correos por pagina y la densidad de visualizacion.

La vista comoda muestra mas aire entre los correos. La vista compacta sirve cuando queremos ver mas informacion en pantalla.

---

## Segmento 11 - Email Management: abrir un correo y leer el detalle

Duracion estimada:
2 minutos.

Pantalla sugerida:
Abrir un correo del listado. Mostrar encabezado, remitente, destinatarios, estado, asignacion, categoria, prioridad, sentimiento e hilo.

Guion:

Al seleccionar un correo, se abre el detalle.

En la parte superior vemos el asunto, el remitente, los destinatarios y la fecha de recepcion.

Tambien vemos informacion de gestion, como el estado del correo, a quien esta asignado y la categoria.

Si el correo fue analizado por IA, pueden aparecer indicadores como prioridad y sentimiento.

En el cuerpo principal vemos el hilo de conversacion. Esto incluye el correo original y las respuestas asociadas, para que el operador tenga todo el contexto antes de actuar.

Cuando abrimos un correo, la plataforma lo marca como leido para el usuario actual.

La idea es que el operador pueda entender rapidamente de que se trata el caso, quien lo esta gestionando y cual fue la conversacion hasta el momento.

---

## Segmento 12 - Email Management: tomar, reasignar y evitar trabajo duplicado

Duracion estimada:
2 a 3 minutos.

Pantalla sugerida:
Abrir un correo pendiente. Mostrar boton Tomar correo. Si hay un caso asignado a otro usuario, mostrar el mensaje de confirmacion. Mostrar asignacion a usuario desde el panel si el perfil lo permite.

Guion:

Para responder o cerrar un correo, primero tiene que estar asignado al operador.

Si el correo esta pendiente, el usuario puede tomarlo. Al tomarlo, el caso queda asignado a esa persona.

Esto es importante porque evita que dos operadores trabajen al mismo tiempo sobre el mismo correo sin saberlo.

Si el correo ya esta asignado a otro usuario, la plataforma lo informa. En ese caso, si el perfil tiene permisos, se puede tomar el correo asignado a otra persona, pero el sistema pide confirmacion.

Tambien existen perfiles que pueden reasignar un caso a otro operador. Esto sirve para supervisores o responsables que necesitan distribuir trabajo segun disponibilidad, especialidad o carga.

En resumen, la asignacion permite saber quien esta atendiendo cada correo y reduce el riesgo de respuestas duplicadas o gestiones perdidas.

---

## Segmento 13 - Email Management: responder un correo

Duracion estimada:
3 minutos.

Pantalla sugerida:
Tomar un correo y mostrar el editor de respuesta. Completar destinatario, asunto, mensaje, formato, adjuntos y opcion de cerrar luego de enviar.

Guion:

Una vez que el correo esta asignado al operador, aparece el editor de respuesta.

La plataforma completa automaticamente el destinatario principal tomando el email de respuesta o el remitente original.

El asunto se prepara como una respuesta al asunto original, aunque se puede ajustar si hace falta.

El operador puede escribir el mensaje directamente desde la plataforma, aplicar formato basico y agregar destinatarios en copia o copia oculta.

Tambien puede adjuntar archivos.

Cuando el mensaje esta listo, se envia desde la casilla corporativa configurada en el mailbox. Esto permite mantener la comunicacion institucional sin tener que salir del sistema.

En algunos casos, el operador puede marcar que la gestion se cierre despues de enviar la respuesta.

Si el mailbox requiere motivo de cierre, la plataforma pedira seleccionar ese motivo antes de cerrar.

Una vez enviado, la respuesta queda registrada en el hilo del correo, junto con el resto de la conversacion.

---

## Segmento 14 - Email Management: redactar un correo nuevo

Duracion estimada:
1 a 2 minutos.

Pantalla sugerida:
Presionar Redactar, mostrar el formulario de nuevo correo y luego la vista Enviados.

Guion:

Ademas de responder correos entrantes, la plataforma permite redactar correos nuevos.

Para eso usamos el boton Redactar.

El nuevo correo se envia desde el mailbox seleccionado, es decir, desde la casilla corporativa.

Podemos indicar destinatarios, copia, copia oculta, asunto, mensaje y adjuntos.

Esta funcion sirve para comunicaciones que nacen desde la empresa y que no necesariamente son una respuesta a un correo recibido.

Despues de enviar, el correo puede consultarse desde la vista Enviados.

---

## Segmento 15 - Email Management: clasificar y cerrar una gestion

Duracion estimada:
3 minutos.

Pantalla sugerida:
Mostrar el panel derecho de gestion. Cambiar prioridad, sentimiento, categoria y motivo de cierre. Luego cerrar la gestion.

Guion:

En el panel de gestion encontramos la informacion administrativa del correo.

Aca vemos el estado, la asignacion actual y los campos de clasificacion.

Podemos revisar o ajustar la prioridad, el sentimiento, la categoria y el motivo de cierre.

Muchas veces estos datos pueden venir sugeridos por IA, pero el operador siempre puede corregirlos segun el caso real.

Los cambios se guardan automaticamente.

Para finalizar el caso usamos Cerrar gestion.

Segun la configuracion del mailbox, puede haber reglas obligatorias. Por ejemplo, que exista al menos una respuesta enviada o que se haya seleccionado un motivo de cierre.

Si falta alguno de esos datos, la pantalla lo indica y no permite cerrar hasta completar la informacion requerida.

Cerrar correctamente las gestiones es importante porque mejora el seguimiento, permite medir el trabajo realizado y mantiene la bandeja ordenada.

---

## Segmento 16 - Email Management: entidades, etiquetas y accesos relacionados

Duracion estimada:
2 minutos.

Pantalla sugerida:
Mostrar un correo con etiquetas o entidades extraidas. Si hay categoria con URL de gestion, mostrar el boton de acceso relacionado.

Guion:

Cuando el analisis IA esta habilitado, la plataforma puede mostrar informacion adicional extraida del correo.

Por ejemplo, puede detectar datos del cliente, numeros de documento, telefonos u otros datos relevantes para el area.

Tambien puede mostrar etiquetas que ayudan a agrupar temas.

Esto no reemplaza la revision del operador, pero ayuda a leer mas rapido y a encontrar patrones entre muchos correos.

Ademas, algunas categorias pueden tener un acceso directo a otra pantalla de gestion.

Por ejemplo, si el correo corresponde a una categoria que se resuelve en otro modulo, la plataforma puede mostrar un boton para abrir esa pantalla manteniendo el contexto del correo.

De esta forma, el operador puede pasar del mail a la gestion relacionada sin perder informacion.

---

## Segmento 17 - Email Supervision: objetivo de la pantalla

Duracion estimada:
1 a 2 minutos.

Pantalla sugerida:
Abrir Email Supervision.

Guion:

Ahora vamos a ver Email Supervision.

Esta pantalla esta pensada para supervisores o responsables de equipo.

Mientras Email Management es la pantalla de trabajo del operador, Email Supervision muestra como esta funcionando la operacion en tiempo real.

Desde aca podemos ver el estado actual de una casilla, cuantos correos quedan pendientes, cuantos estan asignados, cuantos se cerraron hoy y que operadores estan activos o pausados.

El objetivo es tener visibilidad de la carga de trabajo y poder tomar decisiones: redistribuir casos, detectar acumulacion, revisar actividad o acompañar a operadores con muchos casos en curso.

---

## Segmento 18 - Email Supervision: indicadores generales

Duracion estimada:
2 minutos.

Pantalla sugerida:
Seleccionar un mailbox y mostrar las tarjetas superiores.

Guion:

En la parte superior de Email Supervision vemos los indicadores generales del mailbox seleccionado.

Operadores activos indica cuantas personas estan atendiendo en este momento.

Pausados muestra operadores que tienen una sesion iniciada pero no estan trabajando activamente.

Correos pendientes muestra la cantidad de casos que todavia no fueron asignados.

Correos asignados muestra la carga que ya esta distribuida entre operadores.

Y Cerrados hoy permite ver rapidamente el volumen de gestiones finalizadas durante la jornada.

Estos datos ayudan a entender si la casilla esta bajo control o si necesita atencion.

Por ejemplo, si hay muchos pendientes y pocos operadores activos, probablemente sea necesario sumar capacidad o reasignar prioridades.

---

## Segmento 19 - Email Supervision: filtros y tabla de operadores

Duracion estimada:
2 a 3 minutos.

Pantalla sugerida:
Filtrar por estado, buscar operador, activar Mostrar operadores sin sesion y ordenar o recorrer la tabla.

Guion:

Debajo de los indicadores encontramos los filtros de supervision.

Podemos filtrar por estado: todos, activos, pausados o fuera de sesion.

Tambien podemos buscar un operador por nombre o email.

Y podemos activar la opcion Mostrar operadores sin sesion para ver tambien quienes estan configurados en el mailbox pero no estan atendiendo en este momento.

La tabla muestra una fila por operador.

Aca podemos comparar el estado de cada persona, cuanto tiempo lleva en sesion, cuantos casos tiene en curso, cuantos correos se le asignaron, cuantos respondio, cuantos cerro y cuando fue su ultima actividad.

Si un operador esta activo pero no registra actividad reciente, la pantalla lo marca para que el supervisor pueda revisarlo.

Esta vista permite tomar decisiones rapidas sobre la operacion sin entrar caso por caso.

---

## Segmento 20 - Email Supervision: detalle de un operador

Duracion estimada:
2 minutos.

Pantalla sugerida:
Hacer clic en un operador y mostrar el panel lateral con capacidad, metricas y casos actuales.

Guion:

Al seleccionar un operador se abre un panel lateral con mas detalle.

Aca vemos su estado actual, cuando inicio la sesion, cuanto tiempo lleva trabajando y cuando fue su ultima actividad.

Tambien vemos la capacidad utilizada: cuantos casos tiene actualmente asignados en relacion al maximo permitido.

Debajo aparecen metricas de la sesion, como asignados, respondidos y cerrados.

Y finalmente vemos los casos actuales que tiene asignados ese operador.

Desde esta lista podemos abrir un correo para revisar el detalle.

Este panel es util cuando el supervisor necesita entender la situacion de una persona puntual: si tiene demasiada carga, si esta avanzando, si tiene casos urgentes o si necesita redistribucion.

---

## Segmento 21 - Cierre del video y resumen de beneficios

Duracion estimada:
1 a 2 minutos.

Pantalla sugerida:
Volver a Email Management o mostrar Email Supervision con indicadores visibles.

Guion:

Para cerrar, repasemos la idea principal del modulo.

El modulo de mails permite que una casilla corporativa compartida se gestione como una cola de trabajo ordenada.

Los operadores pueden iniciar su atencion, tomar correos, responderlos, clasificarlos y cerrarlos desde una sola pantalla.

La empresa gana trazabilidad, porque queda claro quien tomo cada correo, quien respondio, que estado tiene y por que se cerro.

Tambien mejora la coordinacion del equipo, porque se reducen los casos duplicados y los correos sin seguimiento.

Y desde la supervision se obtiene una vista en tiempo real de la carga, la actividad y el avance de la operacion.

En resumen, el modulo ayuda a atender mejor las casillas con alto volumen, distribuir el trabajo entre operadores y generar informacion util para seguimiento y reporteria.

---

## Orden sugerido de grabacion

1. Introduccion y conceptos generales.
2. Configuracion del mailbox.
3. Recorrido general de Email Management.
4. Sesion de atencion y vistas.
5. Busqueda, filtros y listado.
6. Detalle, toma de correo y respuesta.
7. Clasificacion, cierre y reapertura.
8. Supervision en tiempo real.
9. Cierre y beneficios.

## Notas para la grabacion

- Usar ejemplos simples y cercanos al area, como cobranzas, reclamos o consultas administrativas.
- Evitar detenerse demasiado en IMAP, POP o SMTP; explicarlos como lectura y envio de correos.
- Cuando se muestren permisos o acciones que no todos los usuarios tienen, aclarar que dependen del perfil asignado.
- Si se muestran datos reales, usar una casilla de prueba o informacion anonimizada.
- Mantener cada segmento corto para poder repetirlo o editarlo con facilidad.
