# MAIL / GESTIÓN DE CASILLAS COMPARTIDAS

## 1. Implementar modelo integral de casillas de mail gestionables

### Asunto
Implementar gestión integral de casillas de correo compartidas

### Historia de usuario

**Como:** responsable de una operación que utiliza casillas corporativas compartidas  
**Quiero:** administrar las casillas, correos entrantes, correos salientes y gestiones de los operadores desde la plataforma  
**Para:** centralizar la atención, mantener trazabilidad de las acciones y evitar la gestión directa y descontrolada desde el webmail

### Criterios de aceptación

#### Escenario 1: Gestión de una casilla compartida

**Dado:** que existe una casilla configurada en el sistema  
**Cuando:** los operadores acceden al módulo de gestión de correo  
**Entonces:** deben poder consultar y gestionar los correos asociados a dicha casilla desde la plataforma

#### Escenario 2: Trazabilidad de la operación

**Dado:** que un correo es gestionado por uno o más usuarios  
**Cuando:** se realizan acciones sobre el mismo  
**Entonces:** el sistema debe mantener la relación entre la casilla, el correo recibido, las respuestas enviadas y la gestión realizada

### Observaciones

El modelo debe servir como base para las funcionalidades de asignación, respuesta, supervisión y reportería de casillas compartidas.


---

## 2. Configurar conexión IMAP/POP/SMTP por mailbox

### Asunto
Configurar conexión de correo entrante y saliente por casilla

### Historia de usuario

**Como:** administrador del sistema  
**Quiero:** configurar los parámetros de conexión de cada casilla de correo  
**Para:** poder integrar diferentes cuentas corporativas sin requerir modificaciones en el código

### Criterios de aceptación

#### Escenario 1: Configuración de correo entrante

**Dado:** que estoy administrando una casilla  
**Cuando:** configuro servidor, puerto, protocolo, credenciales y parámetros de seguridad  
**Entonces:** el sistema debe guardar la configuración necesaria para conectarse mediante IMAP o POP

#### Escenario 2: Configuración de correo saliente

**Dado:** que la casilla debe permitir enviar correos  
**Cuando:** configuro los parámetros SMTP correspondientes  
**Entonces:** el sistema debe utilizar dicha configuración para los envíos realizados desde la plataforma

### Observaciones

La configuración debe contemplar TLS y los parámetros particulares de cada proveedor de correo.


---

## 3. Sincronizar correos entrantes desde casillas configuradas

### Asunto
Sincronizar correos entrantes de las casillas configuradas

### Historia de usuario

**Como:** operador de correo  
**Quiero:** que los emails recibidos en las casillas configuradas sean incorporados automáticamente a la plataforma  
**Para:** poder gestionarlos como casos dentro del sistema

### Criterios de aceptación

#### Escenario 1: Sincronización automática

**Dado:** que una casilla se encuentra correctamente configurada  
**Cuando:** se ejecuta el proceso automático de sincronización  
**Entonces:** los nuevos correos recibidos deben incorporarse a la bandeja correspondiente

#### Escenario 2: Sincronización manual

**Dado:** que necesito actualizar una casilla bajo demanda  
**Cuando:** ejecuto manualmente la sincronización  
**Entonces:** el sistema debe procesar los nuevos mensajes disponibles e informar el resultado

### Observaciones

La sincronización debe preservar los metadatos necesarios para identificar posteriormente el correo original.


---

## 4. Evitar duplicados en sincronización de mails

### Asunto
Evitar duplicación de correos durante la sincronización

### Historia de usuario

**Como:** operador de correo  
**Quiero:** que un mismo email no sea incorporado más de una vez  
**Para:** evitar gestiones duplicadas y mantener una bandeja confiable

### Criterios de aceptación

#### Escenario 1: Correo ya sincronizado

**Dado:** que un correo ya fue incorporado previamente  
**Cuando:** el proceso vuelve a encontrar el mismo mensaje  
**Entonces:** debe identificarlo como existente y omitir su creación

#### Escenario 2: Auditoría de duplicados

**Dado:** que un mensaje fue omitido por duplicado  
**Cuando:** se consulta el resultado de la sincronización  
**Entonces:** debe ser posible identificar que el correo fue descartado por encontrarse previamente registrado

### Observaciones

La detección deberá utilizar identificadores confiables del mensaje, como Message-ID y/o UID.


---

## 5. Ordenar procesamiento de correos por antigüedad

### Asunto
Procesar correos entrantes desde los más antiguos

### Historia de usuario

**Como:** operador de correo  
**Quiero:** que los correos pendientes sean procesados respetando su antigüedad  
**Para:** priorizar los contactos que llevan mayor tiempo esperando atención

### Criterios de aceptación

#### Escenario 1: Casilla con múltiples mensajes pendientes

**Dado:** que existen varios correos aún no procesados  
**Cuando:** se ejecuta la sincronización o procesamiento  
**Entonces:** los mensajes deben ser procesados comenzando por el más antiguo

#### Escenario 2: Nuevos mensajes durante el procesamiento

**Dado:** que ingresan nuevos correos mientras existen mensajes anteriores pendientes  
**Cuando:** continúa el procesamiento  
**Entonces:** los correos anteriores deben conservar prioridad sobre los más recientes

### Observaciones

El criterio temporal debe utilizar la fecha del correo y mantener un orden operativo consistente.


---

## 6. Almacenar adjuntos de correos entrantes

### Asunto
Almacenar y consultar adjuntos de correos entrantes

### Historia de usuario

**Como:** operador de correo  
**Quiero:** acceder a los archivos adjuntos recibidos en los emails  
**Para:** revisar comprobantes y documentación sin salir de la plataforma

### Criterios de aceptación

#### Escenario 1: Recepción de correo con adjuntos

**Dado:** que un email recibido contiene uno o más archivos  
**Cuando:** el correo es sincronizado  
**Entonces:** los archivos deben quedar almacenados y relacionados con el correo correspondiente

#### Escenario 2: Consulta del adjunto

**Dado:** que estoy visualizando un correo con archivos adjuntos  
**Cuando:** consulto la sección de adjuntos  
**Entonces:** debo poder identificar y abrir o descargar los archivos disponibles

### Observaciones

Debe mantenerse la relación inequívoca entre cada archivo y el correo que lo originó.


---

## 7. Corregir resolución de paths de adjuntos

### Asunto
Normalizar almacenamiento y recuperación de adjuntos de correo

### Historia de usuario

**Como:** operador de correo  
**Quiero:** que los archivos adjuntos puedan recuperarse correctamente independientemente de dónde fueron almacenados  
**Para:** evitar errores al consultar, descargar o reenviar documentación

### Criterios de aceptación

#### Escenario 1: Consulta de archivo almacenado

**Dado:** que un correo posee un adjunto registrado  
**Cuando:** intento acceder al archivo  
**Entonces:** el sistema debe resolver correctamente su ubicación y entregar el contenido correspondiente

#### Escenario 2: Reutilización del adjunto

**Dado:** que necesito reenviar un archivo recibido previamente  
**Cuando:** lo incorporo a un correo saliente  
**Entonces:** el sistema debe localizarlo correctamente y adjuntarlo al nuevo mensaje

### Observaciones

La resolución no debe depender de rutas inconsistentes o específicas del entorno.


---

## 8. Extraer texto de adjuntos mediante PDF/OCR

### Asunto
Extraer texto de documentos e imágenes adjuntas mediante PDF/OCR

### Historia de usuario

**Como:** operador que gestiona correos con documentación adjunta  
**Quiero:** que el sistema pueda obtener texto de archivos PDF e imágenes  
**Para:** utilizar esa información tanto en el análisis automático como durante la revisión de los casos

### Criterios de aceptación

#### Escenario 1: PDF con texto disponible

**Dado:** que un correo contiene un PDF procesable  
**Cuando:** se analiza el archivo  
**Entonces:** el sistema debe extraer el texto disponible y asociarlo al correo

#### Escenario 2: Imagen o documento que requiere OCR

**Dado:** que el adjunto no contiene texto directamente extraíble  
**Cuando:** se procesa mediante OCR  
**Entonces:** el sistema debe intentar reconocer el contenido textual y dejarlo disponible para su análisis

### Observaciones

Esta funcionalidad está orientada principalmente al procesamiento de comprobantes y documentación recibida por correo.


---

## 9. Activar o desactivar análisis IA por mailbox

### Asunto
Configurar análisis de IA por casilla de correo

### Historia de usuario

**Como:** administrador de casillas  
**Quiero:** decidir qué casillas utilizan análisis automático mediante IA  
**Para:** aplicar el procesamiento solamente en aquellas operaciones donde genere valor

### Criterios de aceptación

#### Escenario 1: IA habilitada

**Dado:** que una casilla tiene habilitado el análisis IA  
**Cuando:** ingresa un nuevo correo  
**Entonces:** el sistema debe ejecutar el procesamiento automático configurado

#### Escenario 2: IA deshabilitada

**Dado:** que una casilla tiene deshabilitado el análisis IA  
**Cuando:** ingresa un nuevo correo  
**Entonces:** el correo debe poder gestionarse normalmente sin invocar el procesamiento de IA

### Observaciones

La configuración debe ser independiente para cada mailbox.


---

## 10. Clasificar mails con IA por categoría, sentimiento, prioridad, tags y entidades

### Asunto
Analizar y clasificar correos mediante Inteligencia Artificial

### Historia de usuario

**Como:** operador de correo  
**Quiero:** recibir una clasificación automática del contenido de los emails  
**Para:** comprender rápidamente cada contacto, priorizarlo y reducir el trabajo de lectura y categorización manual

### Criterios de aceptación

#### Escenario 1: Análisis satisfactorio

**Dado:** que una casilla tiene habilitada la clasificación IA  
**Cuando:** se procesa un nuevo correo  
**Entonces:** el sistema debe generar, según corresponda, categoría, resumen, sentimiento, prioridad, etiquetas y entidades detectadas

#### Escenario 2: Uso de la clasificación

**Dado:** que el correo posee información generada por IA  
**Cuando:** el operador accede a su gestión  
**Entonces:** dicha información debe estar asociada al correo y disponible para apoyar su decisión

### Observaciones

Las entidades pueden incluir datos relevantes del cliente o de la gestión detectados en asunto, cuerpo y adjuntos.


---

## 11. Mostrar resumen IA y entidades extraídas en la gestión

### Asunto
Mostrar resumen y datos extraídos por IA en el detalle del correo

### Historia de usuario

**Como:** operador de correo  
**Quiero:** visualizar directamente el resumen y los datos relevantes detectados por IA  
**Para:** comprender el motivo del contacto sin tener que leer inicialmente todo el contenido

### Criterios de aceptación

#### Escenario 1: Correo analizado

**Dado:** que un correo fue procesado correctamente mediante IA  
**Cuando:** abro su detalle  
**Entonces:** debo poder visualizar el resumen generado y las entidades relevantes detectadas

#### Escenario 2: Correo sin análisis disponible

**Dado:** que el correo no posee información generada por IA  
**Cuando:** abro su detalle  
**Entonces:** la pantalla debe continuar siendo utilizable sin mostrar información incorrecta o ficticia

### Observaciones

La información de IA debe presentarse como apoyo al operador y conservarse vinculada al correo original.


---

## 12. Configurar sentimientos y prioridades por mailbox

### Asunto
Configurar sentimientos y prioridades personalizados por casilla

### Historia de usuario

**Como:** administrador de una operación de correo  
**Quiero:** definir las opciones de sentimiento y prioridad utilizadas por cada casilla  
**Para:** adaptar la clasificación automática y visual al contexto específico de cada operación

### Criterios de aceptación

#### Escenario 1: Configuración de opciones

**Dado:** que estoy administrando una casilla  
**Cuando:** defino las opciones disponibles de sentimiento o prioridad  
**Entonces:** debo poder configurar nombre, descripción y atributos visuales asociados

#### Escenario 2: Uso durante el análisis

**Dado:** que una casilla posee opciones personalizadas  
**Cuando:** se analiza y muestra un correo  
**Entonces:** el sistema debe utilizar las opciones configuradas para dicha casilla

### Observaciones

Las opciones pueden contemplar iconos y colores para facilitar su interpretación visual.


---

## 13. Crear pantalla operativa de gestión de mails

### Asunto
Crear pantalla operativa para gestión diaria de correos

### Historia de usuario

**Como:** operador de correo  
**Quiero:** disponer de una pantalla especializada para gestionar la bandeja  
**Para:** realizar mi trabajo diario de búsqueda, lectura, asignación y resolución desde una única interfaz

### Criterios de aceptación

#### Escenario 1: Acceso a gestión

**Dado:** que tengo permisos sobre una casilla  
**Cuando:** ingreso a la gestión de emails  
**Entonces:** debo visualizar la casilla, las vistas disponibles, el listado de correos y el detalle del caso seleccionado

#### Escenario 2: Operación desde la misma pantalla

**Dado:** que tengo un correo seleccionado  
**Cuando:** realizo acciones de gestión  
**Entonces:** debo poder operar el caso sin depender del CRUD administrativo de correos

### Observaciones

La pantalla constituye la interfaz principal de trabajo para los operadores.


---

## 14. Agregar vistas operativas por estado de mail

### Asunto
Incorporar bandejas operativas de correo por estado y asignación

### Historia de usuario

**Como:** operador de correo  
**Quiero:** consultar vistas diferenciadas de los emails según su estado  
**Para:** identificar rápidamente los casos que requieren mi atención

### Criterios de aceptación

#### Escenario 1: Navegación entre vistas

**Dado:** que existen correos con distintos estados y asignaciones  
**Cuando:** selecciono una vista de la bandeja  
**Entonces:** el listado debe mostrar únicamente los correos correspondientes al criterio seleccionado

#### Escenario 2: Conteos por vista

**Dado:** que cambia la situación de los correos  
**Cuando:** se actualizan los datos de gestión  
**Entonces:** las vistas y sus conteos deben reflejar el estado actual de la operación

### Observaciones

Las vistas pueden contemplar pendientes, asignados a mí, en atención, asignados, cerrados, enviados y destacados.


---

## 15. Implementar toma y reasignación de mails

### Asunto
Permitir tomar y reasignar correos entre operadores

### Historia de usuario

**Como:** operador de correo  
**Quiero:** poder tomar un caso pendiente o reasignarlo cuando corresponda  
**Para:** establecer claramente quién es responsable de su atención

### Criterios de aceptación

#### Escenario 1: Tomar correo pendiente

**Dado:** que un email se encuentra disponible para atención  
**Cuando:** selecciono la acción de tomar el correo  
**Entonces:** debe quedar asignado a mi usuario

#### Escenario 2: Reasignación

**Dado:** que un correo ya posee un responsable  
**Cuando:** un usuario autorizado modifica su asignación  
**Entonces:** el nuevo responsable debe quedar registrado y reflejado en la gestión

### Observaciones

La asignación debe ayudar a evitar que dos operadores trabajen simultáneamente sobre el mismo caso.


---

## 16. Reabrir mails cerrados y asignarlos al operador

### Asunto
Permitir reapertura y toma de correos cerrados

### Historia de usuario

**Como:** operador de correo  
**Quiero:** reabrir un caso cerrado cuando requiere una nueva intervención  
**Para:** continuar la gestión sin crear un caso duplicado

### Criterios de aceptación

#### Escenario 1: Reapertura

**Dado:** que un correo se encuentra cerrado  
**Cuando:** selecciono la acción de reabrir y tomar  
**Entonces:** el caso debe volver a un estado gestionable y quedar asignado a mi usuario

#### Escenario 2: Conservación de información

**Dado:** que el caso poseía gestiones previas  
**Cuando:** es reabierto  
**Entonces:** debe conservarse todo el historial existente

### Observaciones

La funcionalidad contempla casos cerrados por error o contactos que requieren una nueva intervención.


---

## 17. Cerrar gestiones con motivo configurable

### Asunto
Configurar y registrar motivos de cierre de correos

### Historia de usuario

**Como:** responsable de la operación  
**Quiero:** que los operadores indiquen el motivo por el cual cierran un correo  
**Para:** disponer de trazabilidad y métricas sobre las causas de cierre

### Criterios de aceptación

#### Escenario 1: Cierre con motivo obligatorio

**Dado:** que la casilla exige seleccionar un motivo de cierre  
**Cuando:** el operador intenta cerrar un caso  
**Entonces:** el sistema no debe permitir finalizar la gestión hasta que indique un motivo válido

#### Escenario 2: Registro del motivo

**Dado:** que el operador seleccionó un motivo válido  
**Cuando:** confirma el cierre  
**Entonces:** el motivo debe quedar registrado junto con la gestión

### Observaciones

La obligatoriedad y las opciones disponibles deben poder configurarse por casilla.


---

## 18. Exigir respuesta antes de cerrar mails

### Asunto
Impedir cierre de correos sin respuesta cuando sea obligatorio

### Historia de usuario

**Como:** responsable de una casilla  
**Quiero:** poder exigir que exista una respuesta enviada antes de cerrar determinados casos  
**Para:** evitar que contactos que deben ser respondidos queden finalizados sin comunicación al cliente

### Criterios de aceptación

#### Escenario 1: Cierre sin respuesta

**Dado:** que la casilla tiene habilitada la regla de respuesta obligatoria y el correo no posee respuestas enviadas  
**Cuando:** el operador intenta cerrarlo  
**Entonces:** el sistema debe impedir el cierre e informar el motivo

#### Escenario 2: Cierre posterior a respuesta

**Dado:** que el correo ya posee al menos una respuesta válida  
**Cuando:** el operador completa los restantes requisitos de cierre  
**Entonces:** el sistema debe permitir finalizar la gestión

### Observaciones

La regla debe poder configurarse de manera independiente para cada mailbox.


---

## 19. Responder mails desde la plataforma

### Asunto
Permitir responder correos desde la plataforma

### Historia de usuario

**Como:** operador de correo  
**Quiero:** responder los emails recibidos sin salir del sistema  
**Para:** resolver la gestión manteniendo trazabilidad completa de las comunicaciones

### Criterios de aceptación

#### Escenario 1: Envío de respuesta

**Dado:** que tengo un correo en gestión  
**Cuando:** redacto una respuesta y confirmo el envío  
**Entonces:** el mensaje debe enviarse utilizando la configuración SMTP de la casilla correspondiente

#### Escenario 2: Registro del mensaje saliente

**Dado:** que el envío fue realizado  
**Cuando:** consulto nuevamente el caso  
**Entonces:** la respuesta debe aparecer registrada como correo saliente vinculada al email original

### Observaciones

El envío debe contemplar destinatarios, CC, BCC, asunto y contenido HTML/texto.


---

## 20. Enviar correos nuevos desde una casilla

### Asunto
Permitir envío de correos nuevos desde casillas gestionadas

### Historia de usuario

**Como:** operador autorizado  
**Quiero:** redactar un nuevo email desde una casilla corporativa  
**Para:** realizar comunicaciones proactivas sin que sea necesario partir de un correo entrante

### Criterios de aceptación

#### Escenario 1: Nuevo correo

**Dado:** que tengo permisos para enviar desde una casilla  
**Cuando:** ingreso destinatario, asunto y contenido y confirmo el envío  
**Entonces:** el correo debe enviarse utilizando dicha casilla como origen

#### Escenario 2: Trazabilidad

**Dado:** que el email fue enviado desde la plataforma  
**Cuando:** se consulta la actividad de correos salientes  
**Entonces:** el mensaje debe quedar registrado para su posterior auditoría

### Observaciones

El correo nuevo no requiere estar asociado previamente a un InboundEmail.


---

## 21. Reenviar mails entrantes

### Asunto
Permitir reenvío de correos entrantes desde la plataforma

### Historia de usuario

**Como:** operador de correo  
**Quiero:** reenviar un email recibido a otro destinatario  
**Para:** derivar información a otras personas o áreas conservando el contexto original

### Criterios de aceptación

#### Escenario 1: Reenvío

**Dado:** que estoy gestionando un correo recibido  
**Cuando:** selecciono reenviar, indico los destinatarios y confirmo  
**Entonces:** debe enviarse un nuevo correo incluyendo el contenido necesario del mensaje original

#### Escenario 2: Registro del reenvío

**Dado:** que el reenvío fue enviado  
**Cuando:** consulto la trazabilidad del caso  
**Entonces:** el sistema debe mostrar el correo saliente generado

### Observaciones

Cuando corresponda, los adjuntos originales deben poder incluirse en el reenvío.


---

## 22. Incluir historial de conversación en respuestas

### Asunto
Incluir historial del hilo en las respuestas de correo

### Historia de usuario

**Como:** operador de correo  
**Quiero:** que las respuestas incluyan el historial relevante de la conversación  
**Para:** que los destinatarios mantengan el contexto completo del intercambio

### Criterios de aceptación

#### Escenario 1: Respuesta a correo con historial

**Dado:** que existen mensajes previos en el hilo  
**Cuando:** envío una nueva respuesta  
**Entonces:** el correo debe incluir el contenido histórico correspondiente después de la nueva respuesta

#### Escenario 2: Formato del historial

**Dado:** que el mensaje puede enviarse en HTML o texto  
**Cuando:** se construye el correo  
**Entonces:** el historial debe presentarse correctamente en el formato utilizado

### Observaciones

El historial debe mantener una separación clara entre la nueva respuesta y las comunicaciones anteriores.


---

## 23. Mostrar cadena de correos entrantes y salientes

### Asunto
Visualizar hilo completo de correos entrantes y salientes

### Historia de usuario

**Como:** operador de correo  
**Quiero:** visualizar toda la conversación relacionada con un caso  
**Para:** comprender el contexto sin buscar manualmente mensajes anteriores en el webmail

### Criterios de aceptación

#### Escenario 1: Hilo con múltiples mensajes

**Dado:** que existen emails entrantes y respuestas relacionadas  
**Cuando:** accedo al detalle del caso  
**Entonces:** debo poder consultar todos los mensajes pertenecientes al hilo

#### Escenario 2: Diferenciación de mensajes

**Dado:** que el hilo contiene mensajes entrantes y salientes  
**Cuando:** se muestran en pantalla  
**Entonces:** debe ser posible distinguir claramente el origen y la información de cada mensaje

### Observaciones

El hilo debe conservar la relación cronológica entre las distintas comunicaciones.


---

## 24. Optimizar visualización del hilo de mails

### Asunto
Optimizar orden y expansión del hilo de correos

### Historia de usuario

**Como:** operador de correo  
**Quiero:** visualizar el hilo de forma compacta y priorizando el correo actual  
**Para:** reducir el desplazamiento y encontrar rápidamente la información relevante

### Criterios de aceptación

#### Escenario 1: Apertura del hilo

**Dado:** que un caso posee múltiples mensajes  
**Cuando:** ingreso al detalle  
**Entonces:** el correo actualmente gestionado debe aparecer expandido y el resto del hilo en una presentación compacta

#### Escenario 2: Consulta de mensajes anteriores

**Dado:** que necesito revisar otro mensaje del hilo  
**Cuando:** selecciono dicho mensaje  
**Entonces:** debo poder expandirlo y consultar su contenido

### Observaciones

La disposición debe priorizar la información más reciente o relevante para la gestión actual.


---

## 25. Agregar editor enriquecido de mail

### Asunto
Incorporar editor de texto enriquecido para emails

### Historia de usuario

**Como:** operador de correo  
**Quiero:** redactar mensajes utilizando formato enriquecido  
**Para:** generar comunicaciones profesionales y fáciles de leer

### Criterios de aceptación

#### Escenario 1: Redacción con formato

**Dado:** que estoy redactando un correo  
**Cuando:** aplico opciones de formato disponibles  
**Entonces:** el editor debe representar correctamente el contenido enriquecido

#### Escenario 2: Envío del formato

**Dado:** que redacté contenido enriquecido  
**Cuando:** envío el correo  
**Entonces:** el destinatario debe recibir el formato HTML generado correctamente

### Observaciones

El editor debe integrarse a respuestas, reenvíos y demás composiciones donde corresponda.


---

## 26. Permitir insertar tablas en el editor de mails

### Asunto
Permitir tablas en la redacción de correos

### Historia de usuario

**Como:** operador de correo  
**Quiero:** insertar información en formato tabular dentro de un email  
**Para:** comunicar de manera ordenada datos como importes, períodos o saldos

### Criterios de aceptación

#### Escenario 1: Inserción de tabla

**Dado:** que estoy redactando un correo  
**Cuando:** utilizo la opción para incorporar una tabla  
**Entonces:** debo poder agregar y editar su contenido dentro del mensaje

#### Escenario 2: Recepción del correo

**Dado:** que el mensaje contiene una tabla  
**Cuando:** es enviado  
**Entonces:** la estructura debe conservarse en el correo recibido por el destinatario

### Observaciones

La funcionalidad forma parte del editor enriquecido.


---

## 27. Enviar y reenviar mails con adjuntos

### Asunto
Permitir adjuntar archivos en respuestas, reenvíos y correos nuevos

### Historia de usuario

**Como:** operador de correo  
**Quiero:** incorporar archivos a los mensajes que envío desde la plataforma  
**Para:** adjuntar documentación o comprobantes necesarios para completar la comunicación

### Criterios de aceptación

#### Escenario 1: Adjuntar archivos

**Dado:** que estoy redactando un correo  
**Cuando:** selecciono uno o más archivos permitidos  
**Entonces:** deben quedar asociados al mensaje antes de enviarlo

#### Escenario 2: Envío

**Dado:** que el correo posee archivos adjuntos  
**Cuando:** confirmo el envío  
**Entonces:** el destinatario debe recibir los archivos junto con el mensaje

### Observaciones

Debe funcionar en respuestas, reenvíos y nuevos correos según corresponda.


---

## 28. Configurar firmas por usuario y mailbox

### Asunto
Configurar firma de correo por usuario y casilla

### Historia de usuario

**Como:** operador de correo  
**Quiero:** configurar una firma personalizada para cada casilla que utilizo  
**Para:** evitar cargarla manualmente y mantener una comunicación institucional consistente

### Criterios de aceptación

#### Escenario 1: Configuración

**Dado:** que utilizo una determinada casilla  
**Cuando:** guardo una firma para esa combinación de usuario y mailbox  
**Entonces:** la configuración debe quedar almacenada para usos posteriores

#### Escenario 2: Redacción de correo

**Dado:** que tengo una firma configurada  
**Cuando:** redacto un mensaje desde la casilla correspondiente  
**Entonces:** la firma debe estar disponible o incorporarse automáticamente según el comportamiento definido

### Observaciones

La configuración debe poder variar entre diferentes usuarios y casillas.


---

## 29. Configurar comportamiento de siguiente mail al cerrar

### Asunto
Configurar navegación automática al siguiente correo después del cierre

### Historia de usuario

**Como:** operador de correo  
**Quiero:** definir qué debe ocurrir después de cerrar una gestión  
**Para:** agilizar el trabajo secuencial en bandejas de alto volumen

### Criterios de aceptación

#### Escenario 1: Preferencia configurada para avanzar

**Dado:** que tengo configurado avanzar al siguiente correo  
**Cuando:** cierro correctamente una gestión  
**Entonces:** el sistema debe seleccionar automáticamente el siguiente caso disponible

#### Escenario 2: Preferencia sin avance

**Dado:** que no tengo habilitado el avance automático  
**Cuando:** cierro una gestión  
**Entonces:** la plataforma debe respetar dicha preferencia sin forzar la selección de otro correo

### Observaciones

La preferencia debe mantenerse por usuario y mailbox.


---

## 30. Guardar estado de usuario por mail

### Asunto
Mantener estado individual del usuario sobre cada correo

### Historia de usuario

**Como:** operador de correo  
**Quiero:** mantener marcas personales sobre los emails  
**Para:** organizar mi trabajo sin modificar el estado global que visualizan los demás operadores

### Criterios de aceptación

#### Escenario 1: Marcar correo

**Dado:** que estoy visualizando un email  
**Cuando:** modifico un estado personal como leído o destacado  
**Entonces:** dicha marca debe quedar asociada a mi usuario

#### Escenario 2: Otro usuario consulta el mismo correo

**Dado:** que otro operador visualiza el mismo email  
**Cuando:** consulta sus estados personales  
**Entonces:** las marcas realizadas por mi usuario no deben reemplazar las suyas

### Observaciones

Estos estados sirven como soporte para vistas personalizadas como destacados.


---

## 31. Implementar sesiones de atención de operadores

### Asunto
Implementar sesiones operativas de atención de correo

### Historia de usuario

**Como:** operador de correo  
**Quiero:** iniciar, pausar, reanudar y finalizar mi sesión de atención  
**Para:** informar cuándo estoy disponible para recibir trabajo y medir correctamente mi actividad

### Criterios de aceptación

#### Escenario 1: Inicio de sesión operativa

**Dado:** que estoy habilitado para atender una casilla  
**Cuando:** inicio una sesión  
**Entonces:** el sistema debe registrarme como disponible para operar dicha mailbox

#### Escenario 2: Pausa o finalización

**Dado:** que tengo una sesión activa  
**Cuando:** la pauso o finalizo  
**Entonces:** el sistema debe actualizar mi disponibilidad y registrar el cambio de estado

### Observaciones

Las sesiones son independientes del inicio de sesión general de la aplicación.


---

## 32. Asignar automáticamente mails según capacidad

### Asunto
Asignar automáticamente correos según capacidad del operador

### Historia de usuario

**Como:** responsable de una operación de correo  
**Quiero:** distribuir automáticamente los casos pendientes entre operadores disponibles  
**Para:** equilibrar la carga y reducir la necesidad de asignación manual

### Criterios de aceptación

#### Escenario 1: Operador con capacidad disponible

**Dado:** que existe una sesión activa con capacidad para recibir más casos  
**Cuando:** hay correos pendientes disponibles  
**Entonces:** el sistema debe asignarle automáticamente correos hasta alcanzar el límite configurado

#### Escenario 2: Operador sin capacidad

**Dado:** que un operador alcanzó su máximo de asignaciones automáticas  
**Cuando:** quedan nuevos casos pendientes  
**Entonces:** no debe recibir automáticamente más correos hasta liberar capacidad

### Observaciones

La asignación debe contemplar únicamente sesiones activas y elegibles.


---

## 33. Permitir asignación manual sin límite de capacidad

### Asunto
Permitir reasignación manual independientemente de la capacidad automática

### Historia de usuario

**Como:** supervisor u operador autorizado  
**Quiero:** poder asignar manualmente un correo aunque el destinatario haya alcanzado su capacidad automática  
**Para:** resolver excepciones operativas sin quedar bloqueado por la regla de distribución automática

### Criterios de aceptación

#### Escenario 1: Asignación automática

**Dado:** que un operador alcanzó su capacidad configurada  
**Cuando:** se ejecuta el reparto automático  
**Entonces:** no debe recibir nuevos casos automáticamente

#### Escenario 2: Asignación manual

**Dado:** que el mismo operador alcanzó su capacidad  
**Cuando:** un usuario autorizado le asigna manualmente un caso  
**Entonces:** el sistema debe permitir la operación

### Observaciones

El límite de capacidad aplica únicamente a la asignación automática.


---

## 34. Supervisar actividad live, diaria y mensual de mailboxes

### Asunto
Crear supervisión en vivo, diaria y mensual de casillas

### Historia de usuario

**Como:** supervisor de correo  
**Quiero:** consultar la actividad actual e histórica de las casillas y operadores  
**Para:** conocer carga de trabajo, disponibilidad y productividad de la operación

### Criterios de aceptación

#### Escenario 1: Supervisión en vivo

**Dado:** que existen sesiones y casos activos  
**Cuando:** accedo a la vista de supervisión en vivo  
**Entonces:** debo visualizar operadores, sesiones y carga actual relevante

#### Escenario 2: Consulta histórica

**Dado:** que existen datos de jornadas anteriores  
**Cuando:** consulto las vistas diaria o mensual  
**Entonces:** debo obtener métricas agregadas del período seleccionado

### Observaciones

El panel debe permitir diferenciar la situación instantánea de los indicadores históricos.


---

## 35. Cerrar sesiones de operador desde supervisión

### Asunto
Permitir al supervisor finalizar sesiones de correo de otros operadores

### Historia de usuario

**Como:** supervisor de correo  
**Quiero:** cerrar una sesión operativa que haya quedado activa  
**Para:** liberar asignaciones y resolver bloqueos cuando el operador no puede finalizarla

### Criterios de aceptación

#### Escenario 1: Sesión activa

**Dado:** que un operador tiene una sesión activa  
**Cuando:** el supervisor ejecuta la acción de cierre  
**Entonces:** la sesión debe finalizar y dejar de considerarse disponible

#### Escenario 2: Actualización de supervisión

**Dado:** que la sesión fue finalizada por el supervisor  
**Cuando:** se actualiza la información operativa  
**Entonces:** el panel debe reflejar el nuevo estado

### Observaciones

La acción debe estar disponible únicamente para perfiles autorizados.


---

## 36. Agregar métricas de correos respondidos y cerrados por día

### Asunto
Incorporar métricas diarias de correos respondidos y cerrados

### Historia de usuario

**Como:** supervisor de correo  
**Quiero:** conocer cuántos correos se responden y cierran diariamente  
**Para:** medir con mayor precisión el volumen y productividad de la operación

### Criterios de aceptación

#### Escenario 1: Correos respondidos

**Dado:** que se enviaron respuestas durante una jornada  
**Cuando:** consulto las métricas del día  
**Entonces:** debo visualizar la cantidad correspondiente de correos respondidos

#### Escenario 2: Correos cerrados

**Dado:** que se finalizaron gestiones durante una jornada  
**Cuando:** consulto las métricas del día  
**Entonces:** debo visualizar la cantidad de casos cerrados

### Observaciones

Las métricas deben utilizar el día operativo correspondiente según la zona horaria configurada.


---

## 37. Agregar dashboard de mail

### Asunto
Crear dashboard operativo de correo

### Historia de usuario

**Como:** responsable de la gestión de mail  
**Quiero:** disponer de un tablero con indicadores y filtros  
**Para:** analizar de forma agregada el estado de las bandejas y la actividad realizada

### Criterios de aceptación

#### Escenario 1: Consulta del dashboard

**Dado:** que existen correos gestionados  
**Cuando:** accedo al tablero  
**Entonces:** debo visualizar indicadores relevantes agrupados según los criterios definidos

#### Escenario 2: Aplicación de filtros

**Dado:** que necesito analizar un subconjunto de información  
**Cuando:** aplico los filtros disponibles  
**Entonces:** las métricas deben recalcularse utilizando únicamente los registros correspondientes

### Observaciones

El dashboard complementa la supervisión operativa con una vista agregada de la información.


---

## 38. Configurar retención y purga de correos

### Asunto
Configurar retención y eliminación automática de correos

### Historia de usuario

**Como:** administrador del sistema  
**Quiero:** definir cuánto tiempo deben conservarse los correos de cada casilla  
**Para:** controlar el crecimiento de la base de datos y mantener un volumen operativo manejable

### Criterios de aceptación

#### Escenario 1: Configuración de retención

**Dado:** que estoy administrando una mailbox  
**Cuando:** defino una cantidad de días de retención  
**Entonces:** el valor debe quedar asociado a dicha casilla

#### Escenario 2: Purga automática

**Dado:** que existen correos que superan el período de retención configurado  
**Cuando:** se ejecuta el proceso de purga  
**Entonces:** el sistema debe eliminar los registros alcanzados según las reglas definidas

### Observaciones

La eliminación debe considerar correctamente las relaciones y archivos asociados para evitar inconsistencias.


---

## 39. Abrir gestión de mail por query param

### Asunto
Permitir acceso directo a un correo específico mediante URL

### Historia de usuario

**Como:** usuario que llega desde otro módulo o una notificación  
**Quiero:** abrir directamente la gestión de un correo determinado mediante un enlace  
**Para:** acceder al caso sin tener que localizarlo manualmente en la bandeja

### Criterios de aceptación

#### Escenario 1: URL con correo válido

**Dado:** que recibo un enlace con un identificador de email válido  
**Cuando:** ingreso a la URL  
**Entonces:** la pantalla de gestión debe abrir el correo indicado

#### Escenario 2: Correo inexistente o inaccesible

**Dado:** que el identificador no corresponde a un correo disponible para mi usuario  
**Cuando:** intento acceder  
**Entonces:** el sistema debe informar la situación sin dejar la pantalla en un estado inválido

### Observaciones

Esta capacidad permite integrar la bandeja de correo con otros módulos del sistema.


---

## 40. Vincular categorías de mailbox con URLs de gestión externas

### Asunto
Configurar acciones de gestión externa por categoría de correo

### Historia de usuario

**Como:** operador de correo  
**Quiero:** acceder desde un email al módulo especializado correspondiente a su categoría  
**Para:** resolver la gestión específica sin tener que buscar manualmente la pantalla adecuada

### Criterios de aceptación

#### Escenario 1: Categoría con gestión configurada

**Dado:** que el correo tiene una categoría con una URL de gestión asociada  
**Cuando:** consulto las acciones disponibles  
**Entonces:** debo visualizar una opción para acceder a dicha gestión

#### Escenario 2: Categoría sin integración

**Dado:** que la categoría no posee URL asociada  
**Cuando:** consulto el detalle  
**Entonces:** no debe mostrarse una acción inválida de gestión externa

### Observaciones

La URL o acción debe configurarse por categoría de mailbox.


---

## 41. Abrir módulos externos en modal fullscreen desde mail

### Asunto
Abrir gestiones especializadas en modal fullscreen desde correo

### Historia de usuario

**Como:** operador de correo  
**Quiero:** gestionar el módulo relacionado con un email sin abandonar la bandeja  
**Para:** mantener el contexto y volver rápidamente al flujo de atención

### Criterios de aceptación

#### Escenario 1: Apertura de gestión

**Dado:** que el correo tiene una acción de gestión externa configurada  
**Cuando:** la selecciono  
**Entonces:** la pantalla correspondiente debe abrirse dentro de un modal de pantalla completa

#### Escenario 2: Regreso al correo

**Dado:** que finalicé o cancelé la gestión externa  
**Cuando:** cierro el modal  
**Entonces:** debo regresar al mismo correo que estaba gestionando

### Observaciones

La navegación embebida no debe provocar la pérdida de contexto de la bandeja.


---

## 42. Agregar atajos de teclado en gestión de mail

### Asunto
Incorporar atajos de teclado para acciones frecuentes de correo

### Historia de usuario

**Como:** operador que gestiona un alto volumen de emails  
**Quiero:** ejecutar las acciones más frecuentes mediante teclado  
**Para:** reducir tiempos de operación y dependencia del mouse

### Criterios de aceptación

#### Escenario 1: Uso de un atajo habilitado

**Dado:** que estoy en la pantalla de gestión  
**Cuando:** utilizo una combinación configurada para una acción disponible  
**Entonces:** debe ejecutarse la misma acción que desde la interfaz gráfica

#### Escenario 2: Consulta de ayuda

**Dado:** que necesito conocer los atajos disponibles  
**Cuando:** abro la ayuda de teclado  
**Entonces:** debo visualizar las combinaciones y acciones asociadas

### Observaciones

Los atajos deben evitar conflictos con funciones críticas del navegador en la medida de lo posible.


---

## 43. Navegar mails con flechas

### Asunto
Permitir navegación al correo anterior y siguiente

### Historia de usuario

**Como:** operador de correo  
**Quiero:** avanzar o retroceder entre los emails del listado actual  
**Para:** revisar casos consecutivamente de manera más ágil

### Criterios de aceptación

#### Escenario 1: Ir al siguiente correo

**Dado:** que existe un correo posterior dentro del listado actual  
**Cuando:** ejecuto la acción de siguiente  
**Entonces:** dicho correo debe seleccionarse y mostrarse en el detalle

#### Escenario 2: Ir al correo anterior

**Dado:** que existe un correo anterior  
**Cuando:** ejecuto la acción correspondiente  
**Entonces:** el sistema debe mostrarlo sin perder los filtros o la vista actual

### Observaciones

La navegación debe respetar el conjunto de resultados actualmente visible para el usuario.


---

## 44. Mostrar indicador y posición del mail seleccionado

### Asunto
Mostrar posición del correo actual dentro del listado

### Historia de usuario

**Como:** operador de correo  
**Quiero:** saber qué correo estoy viendo y qué posición ocupa dentro de la bandeja actual  
**Para:** orientarme durante una revisión secuencial de casos

### Criterios de aceptación

#### Escenario 1: Selección de correo

**Dado:** que existe un listado de múltiples resultados  
**Cuando:** selecciono uno de los emails  
**Entonces:** debe mostrarse un indicador claro del correo seleccionado

#### Escenario 2: Posición dentro del listado

**Dado:** que estoy navegando secuencialmente  
**Cuando:** cambio de correo  
**Entonces:** la posición mostrada debe actualizarse de acuerdo con el listado actual

### Observaciones

La posición debe contemplar los filtros y vistas actualmente aplicados.


---

## 45. Optimizar queries y payloads de gestión de mail

### Asunto
Optimizar rendimiento de listados y conteos de gestión de correo

### Historia de usuario

**Como:** operador de correo  
**Quiero:** que las bandejas y conteos respondan con rapidez aun cuando exista un alto volumen de emails  
**Para:** poder trabajar sin demoras innecesarias

### Criterios de aceptación

#### Escenario 1: Carga de bandeja

**Dado:** que existe un volumen significativo de correos  
**Cuando:** ingreso a una vista o aplico filtros  
**Entonces:** el sistema debe recuperar únicamente la información necesaria para presentar los resultados

#### Escenario 2: Actualización de conteos

**Dado:** que cambia el estado de los correos  
**Cuando:** se actualizan los contadores de las vistas  
**Entonces:** deben recalcularse sin requerir transferir información innecesaria de los emails completos

### Observaciones

La optimización debe conservar el comportamiento funcional existente.


---

## 46. Otorgar permisos de mail saliente a cobradores

### Asunto
Habilitar envío de correos y adjuntos para el rol Cobrador

### Historia de usuario

**Como:** usuario con rol Cobrador  
**Quiero:** utilizar las funciones de correo saliente necesarias para mi gestión  
**Para:** completar los procesos de cobranzas sin depender de perfiles administrativos

### Criterios de aceptación

#### Escenario 1: Cobrador autorizado

**Dado:** que ingreso con un usuario que posee los permisos definidos para Cobrador  
**Cuando:** realizo una gestión que requiere responder o enviar documentación  
**Entonces:** debo poder acceder a las acciones habilitadas de correo saliente y adjuntos

#### Escenario 2: Usuario sin permiso

**Dado:** que un perfil no posee dichas autorizaciones  
**Cuando:** intenta utilizar las funciones protegidas  
**Entonces:** el sistema debe impedir la operación

### Observaciones

Los permisos deben limitarse a las capacidades necesarias para el proceso de cobranzas.


---

## 47. Documentar y preparar capacitación del módulo mail

### Asunto
Generar documentación y material de capacitación del módulo de correo

### Historia de usuario

**Como:** usuario o responsable de capacitación  
**Quiero:** disponer de documentación funcional del módulo de correo  
**Para:** comprender su configuración, operación, supervisión y buenas prácticas

### Criterios de aceptación

#### Escenario 1: Documentación funcional

**Dado:** que un usuario necesita conocer el funcionamiento del módulo  
**Cuando:** consulta la documentación  
**Entonces:** debe encontrar explicados los principales flujos y funcionalidades disponibles

#### Escenario 2: Capacitación

**Dado:** que debe realizarse una capacitación a usuarios finales  
**Cuando:** se utiliza el material preparado  
**Entonces:** debe existir un recorrido ordenado que permita demostrar configuración, atención y supervisión

### Observaciones

El contenido debe mantenerse alineado con el comportamiento real de la aplicación.