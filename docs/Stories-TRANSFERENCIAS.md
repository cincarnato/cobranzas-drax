# TRANSFERENCIAS

## 1. Crear módulo de transferencias desde correos

### Asunto
Crear módulo de gestión de transferencias recibidas por correo

### Historia de usuario

**Como:** operador del área de transferencias  
**Quiero:** gestionar dentro del sistema los comprobantes y transferencias recibidos por email  
**Para:** centralizar el proceso y reemplazar el análisis manual de correos dispersos

### Criterios de aceptación

#### Escenario 1: Registro de transferencia

**Dado:** que existe un correo asociado a un pago  
**Cuando:** el mismo es procesado como transferencia  
**Entonces:** debe crearse un registro gestionable dentro del módulo

#### Escenario 2: Gestión de información relacionada

**Dado:** que la transferencia requiere datos de pagador o movimientos asociados  
**Cuando:** se consulta el caso  
**Entonces:** el sistema debe mantener la información relacionada necesaria para su procesamiento

### Observaciones

El módulo debe integrarse con el módulo de Mail para preservar el origen del caso.


---

## 2. Procesar lotes de mails entrantes como transferencias

### Asunto
Procesar en lote correos pendientes como transferencias

### Historia de usuario

**Como:** responsable del procesamiento de transferencias  
**Quiero:** analizar automáticamente múltiples correos ya recibidos  
**Para:** convertir en transferencias los casos correspondientes sin procesarlos manualmente uno por uno

### Criterios de aceptación

#### Escenario 1: Procesamiento de lote

**Dado:** que existen correos pendientes elegibles  
**Cuando:** ejecuto el procesamiento masivo  
**Entonces:** el sistema debe analizar los emails y generar los registros correspondientes

#### Escenario 2: Resultado de procesamiento

**Dado:** que algunos correos pueden procesarse y otros no  
**Cuando:** finaliza la ejecución  
**Entonces:** cada caso debe conservar un resultado que permita identificar su situación

### Observaciones

El proceso debe evitar reprocesar casos previamente tratados.


---

## 3. Procesar individualmente un mail como transferencia

### Asunto
Permitir procesamiento individual de un correo como transferencia

### Historia de usuario

**Como:** operador de transferencias  
**Quiero:** forzar el procesamiento de un email específico  
**Para:** atender casos puntuales sin ejecutar un lote completo

### Criterios de aceptación

#### Escenario 1: Procesamiento manual

**Dado:** que seleccioné un correo elegible  
**Cuando:** ejecuto la acción de procesarlo como transferencia  
**Entonces:** el sistema debe analizarlo y generar o actualizar el registro correspondiente

#### Escenario 2: Resultado visible

**Dado:** que finalizó el procesamiento  
**Cuando:** consulto nuevamente el caso  
**Entonces:** debo poder identificar si fue procesado correctamente o si ocurrió algún inconveniente

### Observaciones

La acción debe respetar las mismas reglas principales utilizadas por el procesamiento automático.


---

## 4. Marcar mail entrante con estado de procesamiento de transferencia

### Asunto
Registrar estado de procesamiento de transferencia en el correo origen

### Historia de usuario

**Como:** operador de transferencias  
**Quiero:** saber si un correo ya fue procesado por el flujo de transferencias  
**Para:** evitar reprocesos y comprender el estado actual de cada caso

### Criterios de aceptación

#### Escenario 1: Procesamiento satisfactorio

**Dado:** que un correo fue procesado correctamente  
**Cuando:** consulto su información  
**Entonces:** debe encontrarse marcado como procesado para transferencias

#### Escenario 2: Caso omitido, pendiente o con error

**Dado:** que el procesamiento no generó una transferencia válida  
**Cuando:** consulto el correo  
**Entonces:** debe existir una marca que identifique correctamente su estado

### Observaciones

Las marcas deben permitir distinguir al menos pendientes, procesados, omitidos y errores.


---

## 5. Evitar duplicados de transferencias por mail

### Asunto
Evitar creación duplicada de transferencias desde un mismo correo

### Historia de usuario

**Como:** operador de transferencias  
**Quiero:** que un mismo email no genere varias veces la misma transferencia  
**Para:** evitar duplicar pagos y trabajo de auditoría

### Criterios de aceptación

#### Escenario 1: Correo ya procesado

**Dado:** que ya existe una transferencia vinculada al correo  
**Cuando:** se intenta procesar nuevamente el mismo mensaje  
**Entonces:** el sistema debe detectar la relación existente y evitar crear un duplicado

#### Escenario 2: Correo nuevo

**Dado:** que no existe una transferencia asociada  
**Cuando:** el correo cumple las condiciones del procesamiento  
**Entonces:** debe permitirse crear el registro correspondiente

### Observaciones

La validación debe utilizar la relación con el correo y sus identificadores originales.


---

## 6. Extraer datos de transferencia con IA

### Asunto
Extraer automáticamente datos de transferencias mediante IA

### Historia de usuario

**Como:** operador de transferencias  
**Quiero:** que la información relevante del comprobante sea extraída automáticamente  
**Para:** reducir la carga manual y acelerar la revisión del pago

### Criterios de aceptación

#### Escenario 1: Información disponible

**Dado:** que un correo contiene datos suficientes en el cuerpo o sus adjuntos  
**Cuando:** se ejecuta el análisis de IA  
**Entonces:** el sistema debe intentar obtener importe, moneda, fecha, operación, cuentas, bancos, pagador y afiliado

#### Escenario 2: Información parcial

**Dado:** que algunos datos no pueden determinarse con suficiente certeza  
**Cuando:** finaliza la extracción  
**Entonces:** los valores identificados deben conservarse y el caso debe quedar disponible para revisión humana

### Observaciones

El análisis puede utilizar asunto, cuerpo del email, metadatos y contenido obtenido mediante OCR.


---

## 7. Detectar transferencias con consulta adicional

### Asunto
Detectar consultas adicionales en correos que contienen transferencias

### Historia de usuario

**Como:** operador de transferencias  
**Quiero:** saber si un correo incluye además del comprobante una consulta del remitente  
**Para:** evitar cerrar el caso sin responder una solicitud adicional

### Criterios de aceptación

#### Escenario 1: Transferencia sin consulta adicional

**Dado:** que el correo únicamente informa el pago  
**Cuando:** es analizado  
**Entonces:** debe quedar identificado como un caso sin consulta adicional

#### Escenario 2: Transferencia con consulta adicional

**Dado:** que el remitente realiza además una pregunta o solicitud  
**Cuando:** se analiza el mensaje  
**Entonces:** el sistema debe marcar el caso para que el operador conozca que requiere atención adicional

### Observaciones

La marca debe estar disponible durante la auditoría de la transferencia.


---

## 8. Agregar fallback de extracción sin IA

### Asunto
Crear procesamiento alternativo de transferencias cuando la IA no está disponible

### Historia de usuario

**Como:** operador de transferencias  
**Quiero:** que los correos no se pierdan si el análisis de IA falla o no está disponible  
**Para:** poder revisarlos manualmente y mantener continuidad operativa

### Criterios de aceptación

#### Escenario 1: Falla del análisis IA

**Dado:** que el proveedor de IA no puede procesar el correo  
**Cuando:** se ejecuta el flujo de transferencia  
**Entonces:** el sistema debe generar un registro mínimo utilizando el mecanismo alternativo

#### Escenario 2: Revisión posterior

**Dado:** que una transferencia fue creada sin IA  
**Cuando:** el operador accede a ella  
**Entonces:** debe quedar claramente identificada como pendiente de revisión o procesada sin IA

### Observaciones

El fallback prioriza no perder casos aunque la información obtenida sea incompleta.


---

## 9. Gestionar estados IA y estados humanos de auditoría

### Asunto
Separar estados de procesamiento IA y auditoría humana de transferencias

### Historia de usuario

**Como:** supervisor de transferencias  
**Quiero:** distinguir el resultado del procesamiento automático del resultado de la revisión humana  
**Para:** conocer con precisión en qué etapa se encuentra cada caso

### Criterios de aceptación

#### Escenario 1: Resultado automático

**Dado:** que una transferencia fue analizada por IA  
**Cuando:** finaliza el procesamiento  
**Entonces:** debe registrarse un estado que represente la calidad o resultado del análisis automático

#### Escenario 2: Intervención humana

**Dado:** que un auditor revisa posteriormente el caso  
**Cuando:** valida, modifica o descarta la información  
**Entonces:** debe registrarse un estado humano independiente del estado original de IA

### Observaciones

La separación debe permitir distinguir casos confiables, dudosos, incompletos, con error, validados, corregidos y descartados.


---

## 10. Soportar múltiples transferencias o múltiples afiliados

### Asunto
Soportar múltiples transferencias o afiliados en un mismo correo

### Historia de usuario

**Como:** operador de transferencias  
**Quiero:** registrar correctamente emails que informan pagos para más de un afiliado o concepto  
**Para:** representar fielmente la distribución del importe informado

### Criterios de aceptación

#### Escenario 1: Múltiples afiliados

**Dado:** que un pago corresponde a más de un afiliado  
**Cuando:** se registra la transferencia  
**Entonces:** debe ser posible asociar el importe correspondiente a cada uno

#### Escenario 2: Múltiples transferencias

**Dado:** que un mismo correo contiene más de una operación diferenciable  
**Cuando:** se procesa  
**Entonces:** el sistema debe poder representar las operaciones sin perder la relación con el email de origen

### Observaciones

La suma y distribución de importes debe ser visible durante la auditoría.


---

## 11. Cambiar mes por concepto y ampliar detalle financiero

### Asunto
Ampliar detalle financiero de transferencias y utilizar concepto

### Historia de usuario

**Como:** operador de transferencias  
**Quiero:** registrar el concepto del pago y sus componentes financieros  
**Para:** reflejar con mayor precisión qué se está abonando

### Criterios de aceptación

#### Escenario 1: Registro de concepto

**Dado:** que estoy revisando una transferencia  
**Cuando:** informo el detalle del pago  
**Entonces:** debo poder utilizar un campo de concepto en lugar de limitar la información a un mes

#### Escenario 2: Componentes adicionales

**Dado:** que el pago incluye componentes adicionales  
**Cuando:** completo la información  
**Entonces:** debo poder registrar copago, financiación y punitorios cuando corresponda

### Observaciones

Los campos deben encontrarse disponibles en la gestión de la transferencia.


---

## 12. Agregar titular de cuenta a transferencia y exportación

### Asunto
Registrar titular de cuenta en transferencias

### Historia de usuario

**Como:** auditor de transferencias  
**Quiero:** conocer el titular de la cuenta bancaria de origen  
**Para:** facilitar la identificación del pagador y la conciliación con el afiliado

### Criterios de aceptación

#### Escenario 1: Registro del titular

**Dado:** que se conoce el titular de la cuenta  
**Cuando:** se procesa o edita una transferencia  
**Entonces:** el dato debe poder almacenarse y visualizarse

#### Escenario 2: Exportación

**Dado:** que exporto transferencias a Excel  
**Cuando:** el registro posee titular informado  
**Entonces:** dicho dato debe incluirse en el archivo generado

### Observaciones

El titular puede diferir del afiliado y constituye información relevante para la auditoría.


---

## 13. Agregar pagadores y estrategias de identificación

### Asunto
Crear padrón de pagadores y estrategias de identificación de afiliados

### Historia de usuario

**Como:** operador de transferencias  
**Quiero:** relacionar datos recurrentes del pagador con el afiliado correspondiente  
**Para:** mejorar la identificación automática de futuras transferencias

### Criterios de aceptación

#### Escenario 1: Pagador conocido

**Dado:** que existe una regla de pagador coincidente con los datos del correo o transferencia  
**Cuando:** se procesa el caso  
**Entonces:** el sistema debe utilizarla para identificar al afiliado relacionado

#### Escenario 2: Diferentes estrategias

**Dado:** que un pagador puede identificarse por distintos datos  
**Cuando:** se realiza la búsqueda  
**Entonces:** deben contemplarse estrategias como email, DNI/CUIL, CBU/CVU o número de cuenta

### Observaciones

El objetivo es resolver relaciones recurrentes entre pagadores y afiliados.


---

## 14. Crear pagadores desde el flujo de transferencia

### Asunto
Permitir creación de pagadores durante la auditoría de transferencias

### Historia de usuario

**Como:** auditor de transferencias  
**Quiero:** registrar un nuevo pagador sin abandonar el caso que estoy revisando  
**Para:** resolver una relación nueva y reutilizarla en futuros procesos

### Criterios de aceptación

#### Escenario 1: Relación inexistente

**Dado:** que identifico un pagador que no se encuentra registrado  
**Cuando:** ejecuto la acción de creación desde la transferencia  
**Entonces:** debo poder registrar sus datos y asociarlo al afiliado correspondiente

#### Escenario 2: Continuidad de gestión

**Dado:** que el pagador fue creado correctamente  
**Cuando:** regreso al caso  
**Entonces:** debo poder continuar la auditoría utilizando la nueva relación

### Observaciones

La creación debe minimizar cambios de pantalla durante el flujo operativo.


---

## 15. Reprocesar transferencias con reglas actuales de pagador

### Asunto
Reprocesar identificación de transferencias utilizando reglas de pagadores

### Historia de usuario

**Como:** auditor de transferencias  
**Quiero:** volver a evaluar la identificación de un caso utilizando las reglas actuales de pagadores  
**Para:** aprovechar nuevos mapeos sin consumir nuevamente un análisis de IA

### Criterios de aceptación

#### Escenario 1: Nuevo pagador configurado

**Dado:** que una transferencia no pudo asociarse correctamente y posteriormente se creó una regla de pagador  
**Cuando:** ejecuto el reprocesamiento  
**Entonces:** el sistema debe reevaluar la identificación utilizando las reglas disponibles

#### Escenario 2: Sin nueva invocación IA

**Dado:** que el reprocesamiento se basa exclusivamente en reglas actuales  
**Cuando:** se ejecuta  
**Entonces:** no debe requerirse una nueva consulta al proveedor de IA

### Observaciones

La funcionalidad permite corregir múltiples casos a partir del enriquecimiento progresivo de pagadores.


---

## 16. Re-evaluar transferencias enviadas a revisión humana

### Asunto
Permitir reevaluación de transferencias con dudas o datos incompletos

### Historia de usuario

**Como:** auditor de transferencias  
**Quiero:** volver a evaluar casos derivados a revisión humana  
**Para:** recuperar transferencias que inicialmente quedaron incompletas o con dudas

### Criterios de aceptación

#### Escenario 1: Caso reevaluable

**Dado:** que una transferencia se encuentra en un estado de duda o incompleto  
**Cuando:** ejecuto la acción de reevaluación  
**Entonces:** el sistema debe volver a aplicar las reglas correspondientes y actualizar los datos obtenidos

#### Escenario 2: Resultado posterior

**Dado:** que finalizó la reevaluación  
**Cuando:** consulto el registro  
**Entonces:** el estado debe reflejar el nuevo resultado sin perder la trazabilidad anterior

### Observaciones

La reevaluación debe permitir recuperar casos conforme se dispone de mejores datos o reglas.


---

## 17. Implementar auditoría humana de transferencias

### Asunto
Implementar auditoría humana de transferencias procesadas

### Historia de usuario

**Como:** auditor de transferencias  
**Quiero:** validar, corregir o descartar los datos obtenidos automáticamente  
**Para:** asegurar que únicamente se utilicen transferencias correctamente verificadas

### Criterios de aceptación

#### Escenario 1: Validación

**Dado:** que estoy revisando una transferencia procesada  
**Cuando:** confirmo que la información es correcta  
**Entonces:** debe quedar registrada como validada junto con mi usuario y fecha de auditoría

#### Escenario 2: Corrección o descarte

**Dado:** que detecto información incorrecta o un caso que no corresponde  
**Cuando:** corrijo los datos o descarto la transferencia  
**Entonces:** debe registrarse el resultado de la auditoría y conservarse trazabilidad de la intervención

### Observaciones

La auditoría constituye el control humano posterior al procesamiento automático.


---

## 18. Crear sesiones de auditoría de transferencias

### Asunto
Implementar sesiones de trabajo para auditoría de transferencias

### Historia de usuario

**Como:** auditor de transferencias  
**Quiero:** trabajar sobre un lote de casos asignados a mi sesión  
**Para:** organizar la auditoría y evitar que otros operadores revisen simultáneamente los mismos registros

### Criterios de aceptación

#### Escenario 1: Inicio de sesión

**Dado:** que existen transferencias disponibles para auditar  
**Cuando:** inicio una sesión  
**Entonces:** el sistema debe asignarme un conjunto de casos según las reglas establecidas

#### Escenario 2: Pausa, reanudación o finalización

**Dado:** que tengo una sesión activa  
**Cuando:** modifico su estado  
**Entonces:** las asignaciones y disponibilidad de casos deben actualizarse correctamente

### Observaciones

La sesión debe mantener actividad mediante heartbeat y contemplar vencimiento.


---

## 19. Asignar lotes de transferencia con lease temporal

### Asunto
Implementar asignación temporal de transferencias a sesiones de auditoría

### Historia de usuario

**Como:** responsable de auditoría  
**Quiero:** que las asignaciones de casos tengan una vigencia temporal renovable  
**Para:** evitar transferencias bloqueadas indefinidamente cuando una sesión deja de estar activa

### Criterios de aceptación

#### Escenario 1: Renovación de asignación

**Dado:** que una sesión continúa activa  
**Cuando:** envía su heartbeat  
**Entonces:** las asignaciones pendientes deben renovar su vigencia

#### Escenario 2: Vencimiento o liberación

**Dado:** que la sesión finaliza, se pausa o deja de renovar su actividad  
**Cuando:** vence la asignación  
**Entonces:** los casos pendientes deben volver a quedar disponibles para otros auditores

### Observaciones

El mecanismo debe minimizar conflictos de concurrencia entre operadores.


---

## 20. Cerrar mail vinculado desde auditoría de transferencia

### Asunto
Permitir cerrar el correo origen desde la auditoría de transferencia

### Historia de usuario

**Como:** auditor de transferencias  
**Quiero:** finalizar también el correo asociado cuando termino la auditoría  
**Para:** evitar realizar una segunda gestión manual en la bandeja de mail

### Criterios de aceptación

#### Escenario 1: Cierre solicitado

**Dado:** que la transferencia tiene un correo de origen vinculado  
**Cuando:** finalizo la auditoría indicando que deseo cerrar el correo  
**Entonces:** el InboundEmail correspondiente debe quedar cerrado

#### Escenario 2: Cierre no solicitado

**Dado:** que deseo mantener abierto el correo  
**Cuando:** finalizo la auditoría sin seleccionar dicha opción  
**Entonces:** el estado del email no debe modificarse automáticamente

### Observaciones

Deben respetarse las reglas de cierre configuradas para la casilla.


---

## 21. Mejorar vínculo visual entre transferencia y correo

### Asunto
Integrar información del correo origen en la gestión de transferencias

### Historia de usuario

**Como:** auditor de transferencias  
**Quiero:** consultar el correo y su documentación dentro del mismo flujo de auditoría  
**Para:** reducir cambios de contexto durante la revisión

### Criterios de aceptación

#### Escenario 1: Transferencia vinculada

**Dado:** que la transferencia proviene de un correo  
**Cuando:** abro su gestión  
**Entonces:** debo poder consultar la información relevante del email de origen

#### Escenario 2: Documentación disponible

**Dado:** que el correo contiene un comprobante u otros adjuntos  
**Cuando:** reviso el caso  
**Entonces:** debo poder acceder al material necesario para validar los datos extraídos

### Observaciones

La gestión debe integrar datos de transferencia y correo de forma coherente.


---

## 22. Incorporar tabs de comprobante, OCR y email

### Asunto
Organizar revisión de transferencias en pestañas de comprobante, OCR y email

### Historia de usuario

**Como:** auditor de transferencias  
**Quiero:** consultar por separado el comprobante, el texto extraído y el correo original  
**Para:** comparar fácilmente las diferentes fuentes de información del caso

### Criterios de aceptación

#### Escenario 1: Navegación entre fuentes

**Dado:** que una transferencia posee distintas fuentes de información  
**Cuando:** selecciono cada pestaña  
**Entonces:** debo visualizar el contenido correspondiente sin abandonar la auditoría

#### Escenario 2: Visualización del correo

**Dado:** que existe contenido HTML del email  
**Cuando:** ingreso a la pestaña correspondiente  
**Entonces:** debe mostrarse en un formato legible para el auditor

### Observaciones

La organización debe favorecer la revisión documental rápida del caso.


---

## 23. Agregar ayuda funcional del proceso de transferencias

### Asunto
Incorporar ayuda funcional del módulo de transferencias

### Historia de usuario

**Como:** usuario del módulo de transferencias  
**Quiero:** disponer de una explicación accesible del proceso  
**Para:** comprender cómo se generan, revisan y clasifican los casos

### Criterios de aceptación

#### Escenario 1: Consulta de ayuda

**Dado:** que estoy utilizando el módulo  
**Cuando:** accedo a la ayuda funcional  
**Entonces:** debo encontrar una explicación del flujo general de procesamiento

#### Escenario 2: Conceptos principales

**Dado:** que necesito interpretar la información del caso  
**Cuando:** consulto la ayuda  
**Entonces:** deben explicarse los estados, la extracción IA, los pagadores y la auditoría humana

### Observaciones

El material debe estar orientado al usuario operativo.


---

## 24. Exportar transferencias a Excel

### Asunto
Exportar transferencias y datos de auditoría a Excel

### Historia de usuario

**Como:** responsable de transferencias  
**Quiero:** exportar los registros del módulo a una planilla  
**Para:** realizar controles, conciliaciones y reportes fuera del sistema

### Criterios de aceptación

#### Escenario 1: Generación de archivo

**Dado:** que existen transferencias dentro del criterio seleccionado  
**Cuando:** ejecuto la exportación  
**Entonces:** el sistema debe generar un archivo Excel con los registros correspondientes

#### Escenario 2: Contenido

**Dado:** que los registros poseen información de mail, transferencia, pagador y auditoría  
**Cuando:** se genera el archivo  
**Entonces:** deben incluirse las columnas necesarias para su análisis externo

### Observaciones

La exportación debe respetar los filtros funcionales definidos por la pantalla.


---

## 25. Exportar múltiples afiliados con fila total y detalle

### Asunto
Representar transferencias de múltiples afiliados en la exportación Excel

### Historia de usuario

**Como:** usuario que analiza exportaciones de transferencias  
**Quiero:** distinguir el total del pago y el detalle correspondiente a cada afiliado  
**Para:** interpretar correctamente operaciones agrupadas

### Criterios de aceptación

#### Escenario 1: Transferencia simple

**Dado:** que el registro corresponde a un solo afiliado  
**Cuando:** se exporta  
**Entonces:** debe mantener el formato habitual de una transferencia individual

#### Escenario 2: Múltiples afiliados

**Dado:** que una transferencia se distribuye entre varios afiliados  
**Cuando:** se genera el Excel  
**Entonces:** debe incluirse una fila identificable de total y filas de detalle por afiliado

### Observaciones

El formato visual debe facilitar la identificación de filas totales y de detalle.


---

## 26. Agregar dashboard de transferencias

### Asunto
Crear dashboard de seguimiento de transferencias

### Historia de usuario

**Como:** supervisor de transferencias  
**Quiero:** visualizar métricas y estados del proceso en un tablero  
**Para:** conocer el volumen, situación y evolución de los casos

### Criterios de aceptación

#### Escenario 1: Indicadores

**Dado:** que existen transferencias procesadas  
**Cuando:** accedo al dashboard  
**Entonces:** debo visualizar métricas agrupadas por los principales estados del flujo

#### Escenario 2: Filtros y orden temporal

**Dado:** que necesito analizar un período o subconjunto  
**Cuando:** aplico filtros  
**Entonces:** los indicadores deben actualizarse y mantener un orden temporal consistente

### Observaciones

El tablero está orientado al seguimiento operacional y gerencial.


---

## 27. Mejorar vista y CRUD de transferencias

### Asunto
Optimizar visualización y edición de transferencias

### Historia de usuario

**Como:** auditor de transferencias  
**Quiero:** disponer de una interfaz clara para consultar y modificar los datos del caso  
**Para:** reducir errores y agilizar la revisión de información compleja

### Criterios de aceptación

#### Escenario 1: Visualización

**Dado:** que ingreso al detalle de una transferencia  
**Cuando:** reviso sus datos  
**Entonces:** los estados, importes y campos relevantes deben presentarse de forma clara

#### Escenario 2: Edición

**Dado:** que tengo permisos para modificar la transferencia  
**Cuando:** actualizo la información  
**Entonces:** los cambios válidos deben persistirse y reflejarse correctamente

### Observaciones

La mejora contempla layout, colores de estados y organización del formulario.


---

## 28. Aceptar más de una categoría de mail para transferencias

### Asunto
Permitir múltiples categorías de correo como origen de transferencias

### Historia de usuario

**Como:** administrador del proceso de transferencias  
**Quiero:** configurar más de una categoría de correo elegible  
**Para:** procesar correctamente distintas clasificaciones que representan pagos

### Criterios de aceptación

#### Escenario 1: Categoría permitida

**Dado:** que un correo pertenece a cualquiera de las categorías configuradas  
**Cuando:** se ejecuta el procesamiento  
**Entonces:** debe considerarse elegible para el flujo de transferencias

#### Escenario 2: Categoría no configurada

**Dado:** que el correo pertenece a una categoría ajena al proceso  
**Cuando:** se evalúa automáticamente  
**Entonces:** no debe procesarse como transferencia por este criterio

### Observaciones

Ejemplos de categorías posibles son Transferencia y Depósito.


---

## 29. Configurar procesamiento automático de transferencias

### Asunto
Configurar activación y categorías del procesamiento automático de transferencias

### Historia de usuario

**Como:** administrador del sistema  
**Quiero:** habilitar o deshabilitar el procesamiento automático y definir sus categorías de origen  
**Para:** controlar cuándo los correos deben convertirse automáticamente en transferencias

### Criterios de aceptación

#### Escenario 1: Procesamiento habilitado

**Dado:** que la funcionalidad automática se encuentra activa  
**Cuando:** existen correos de una categoría configurada  
**Entonces:** el proceso automático debe evaluarlos

#### Escenario 2: Procesamiento deshabilitado

**Dado:** que la automatización está desactivada  
**Cuando:** ingresan nuevos correos  
**Entonces:** no deben generarse transferencias automáticamente

### Observaciones

La configuración debe poder modificarse sin cambiar el código del procesamiento.


---

## 30. Registrar fecha del mail y fecha de procesamiento

### Asunto
Registrar fechas de recepción y procesamiento de transferencias

### Historia de usuario

**Como:** supervisor de transferencias  
**Quiero:** conocer cuándo llegó el correo y cuándo fue procesado  
**Para:** medir tiempos operativos y auditar demoras del circuito

### Criterios de aceptación

#### Escenario 1: Fecha del correo

**Dado:** que una transferencia se origina en un email  
**Cuando:** se crea el registro  
**Entonces:** debe conservarse la fecha correspondiente al mensaje original

#### Escenario 2: Fecha de procesamiento

**Dado:** que el correo es convertido en transferencia  
**Cuando:** finaliza el procesamiento  
**Entonces:** debe registrarse la fecha en la que ocurrió dicha operación

### Observaciones

Ambas fechas deben encontrarse disponibles para reportes y auditoría.


---

## 31. Ajustar prompt de localización y extracción

### Asunto
Mejorar reglas de IA para extracción de datos locales de transferencias

### Historia de usuario

**Como:** operador de transferencias  
**Quiero:** que el análisis automático interprete correctamente formatos y datos utilizados en la operación local  
**Para:** reducir errores de extracción en comprobantes reales

### Criterios de aceptación

#### Escenario 1: Datos con formatos locales

**Dado:** que el correo contiene fechas, importes, documentos o datos bancarios en formatos utilizados localmente  
**Cuando:** se ejecuta el análisis  
**Entonces:** la IA debe interpretarlos según las reglas establecidas

#### Escenario 2: Calidad del resultado

**Dado:** que la información puede ser ambigua  
**Cuando:** no existe evidencia suficiente  
**Entonces:** el análisis no debe inventar valores y el caso debe poder derivarse a revisión

### Observaciones

La mejora está orientada a aumentar precisión y reducir clasificaciones incorrectas.


---

## 32. Aumentar límite de interacciones del proveedor IA

### Asunto
Ampliar capacidad de interacción del proveedor IA en procesamiento de transferencias

### Historia de usuario

**Como:** usuario del procesamiento automático  
**Quiero:** que los análisis complejos dispongan de suficientes interacciones con las herramientas de IA  
**Para:** evitar fallas prematuras durante la extracción de información

### Criterios de aceptación

#### Escenario 1: Procesamiento complejo

**Dado:** que una transferencia requiere múltiples pasos de análisis  
**Cuando:** el proveedor utiliza sus herramientas  
**Entonces:** debe disponer de un límite suficiente para completar el flujo previsto

#### Escenario 2: Control de ejecución

**Dado:** que se alcanza el máximo permitido  
**Cuando:** no es posible completar el análisis  
**Entonces:** el proceso debe finalizar de manera controlada y dejar el caso disponible para revisión

### Observaciones

El incremento no debe eliminar los límites de seguridad del proveedor.


---

## 33. Registrar título operativo de procesamiento

### Asunto
Registrar título operativo en ejecuciones de procesamiento de transferencias

### Historia de usuario

**Como:** responsable técnico u operativo  
**Quiero:** identificar claramente cada ejecución de procesamiento  
**Para:** facilitar la trazabilidad y lectura de las operaciones realizadas

### Criterios de aceptación

#### Escenario 1: Inicio de procesamiento

**Dado:** que se ejecuta un proceso asociado a transferencias  
**Cuando:** se registra su operación  
**Entonces:** debe incorporarse un título descriptivo que permita reconocerla

#### Escenario 2: Consulta posterior

**Dado:** que necesito analizar una ejecución  
**Cuando:** reviso la información registrada  
**Entonces:** el título debe permitir distinguirla de otros tipos de procesos

### Observaciones

El dato está orientado principalmente a trazabilidad técnica y operacional.





