# BAJAS / BONIFICACIONES

## 34. Crear módulo de bajas y bonificaciones

### Asunto
Crear módulo de gestión de bonificaciones por bajas

### Historia de usuario

**Como:** operador del área de Bajas  
**Quiero:** registrar y gestionar bonificaciones asociadas a procesos de baja  
**Para:** centralizar la información y reemplazar registros manuales dispersos

### Criterios de aceptación

#### Escenario 1: Alta de bonificación

**Dado:** que tengo permisos sobre el módulo  
**Cuando:** registro una nueva bonificación  
**Entonces:** debe quedar disponible para su posterior seguimiento

#### Escenario 2: Consulta y gestión

**Dado:** que existen bonificaciones registradas  
**Cuando:** ingreso al módulo  
**Entonces:** debo poder consultar y gestionar los registros según mis permisos

### Observaciones

El módulo debe disponer de navegación y permisos propios.


---

## 35. Definir campos operativos de bonificación

### Asunto
Incorporar datos operativos requeridos en bonificaciones de bajas

### Historia de usuario

**Como:** operador de Bajas  
**Quiero:** registrar todos los datos necesarios de una bonificación  
**Para:** que el área responsable pueda aplicarla y controlarla correctamente

### Criterios de aceptación

#### Escenario 1: Carga de datos

**Dado:** que estoy creando o editando una bonificación  
**Cuando:** completo el formulario  
**Entonces:** debo disponer de campos para DNI, nombre, plan, aplicación, forma de pago, bonificación, período, valor, estado y observación

#### Escenario 2: Consulta

**Dado:** que la bonificación fue guardada  
**Cuando:** vuelvo a consultar el registro  
**Entonces:** la información cargada debe mostrarse correctamente

### Observaciones

Los campos obligatorios deben validarse antes de guardar.


---

## 36. Agregar período a bonificaciones

### Asunto
Agregar período a las bonificaciones de bajas

### Historia de usuario

**Como:** usuario del módulo de Bajas  
**Quiero:** informar el período correspondiente a cada bonificación  
**Para:** poder segmentar y reportar correctamente las gestiones

### Criterios de aceptación

#### Escenario 1: Registro

**Dado:** que estoy cargando una bonificación  
**Cuando:** informo su período  
**Entonces:** el sistema debe guardar el valor asociado al registro

#### Escenario 2: Uso del período

**Dado:** que existen bonificaciones de diferentes períodos  
**Cuando:** las consulto, filtro o exporto  
**Entonces:** el período debe estar disponible como dato operativo

### Observaciones

El campo debe integrarse también a dashboards cuando corresponda.


---

## 37. Incorporar selectores en el formulario de bajas

### Asunto
Utilizar selectores para campos controlados del formulario de bonificaciones

### Historia de usuario

**Como:** operador de Bajas  
**Quiero:** seleccionar valores predefinidos en los campos que poseen opciones conocidas  
**Para:** reducir errores de tipeo y mantener datos consistentes

### Criterios de aceptación

#### Escenario 1: Campo parametrizado

**Dado:** que un campo dispone de un conjunto conocido de valores  
**Cuando:** lo completo  
**Entonces:** debo seleccionar una opción válida mediante un control de selección

#### Escenario 2: Persistencia

**Dado:** que seleccioné una opción válida  
**Cuando:** guardo el registro  
**Entonces:** el valor debe persistirse correctamente

### Observaciones

Los campos de texto libre deben reservarse para información que efectivamente lo requiera.


---

## 38. Forzar estado inicial pendiente

### Asunto
Crear nuevas bonificaciones con estado Pendiente

### Historia de usuario

**Como:** responsable del proceso de Bajas  
**Quiero:** que toda nueva bonificación comience en estado Pendiente  
**Para:** asegurar un ciclo de gestión consistente antes de su resolución

### Criterios de aceptación

#### Escenario 1: Nueva bonificación

**Dado:** que un operador crea un nuevo registro  
**Cuando:** confirma el alta  
**Entonces:** la bonificación debe generarse con estado Pendiente

#### Escenario 2: Intento de definir otro estado al crear

**Dado:** que el estado inicial está definido por regla de negocio  
**Cuando:** se realiza el alta  
**Entonces:** no debe permitirse omitir dicha regla mediante la carga inicial

### Observaciones

Los estados posteriores se modificarán según permisos y reglas del proceso.


---

## 39. Validar observación para estado No aplicado

### Asunto
Exigir observación al marcar una bonificación como No aplicada

### Historia de usuario

**Como:** supervisor de Bajas  
**Quiero:** que se justifiquen las bonificaciones que no pudieron aplicarse  
**Para:** mantener trazabilidad de los casos rechazados o no ejecutados

### Criterios de aceptación

#### Escenario 1: Cambio a No aplicado sin observación

**Dado:** que una bonificación no tiene una observación válida  
**Cuando:** intento cambiar su estado a No aplicado  
**Entonces:** el sistema debe impedir la operación

#### Escenario 2: Cambio con observación

**Dado:** que informé una justificación  
**Cuando:** confirmo el estado No aplicado  
**Entonces:** el cambio debe guardarse junto con la observación

### Observaciones

La justificación debe quedar disponible para auditoría y exportación.


---

## 40. Restringir edición por permisos, creador y fecha

### Asunto
Aplicar restricciones de edición a bonificaciones de bajas

### Historia de usuario

**Como:** responsable del área de Bajas  
**Quiero:** limitar qué registros puede modificar cada usuario  
**Para:** evitar alteraciones no autorizadas sobre información histórica

### Criterios de aceptación

#### Escenario 1: Operador estándar

**Dado:** que el usuario no posee permisos de gestión ampliada  
**Cuando:** intenta editar una bonificación  
**Entonces:** solo debe poder modificar registros propios dentro del período permitido por la regla de negocio

#### Escenario 2: Usuario autorizado

**Dado:** que el usuario posee permiso de gestión  
**Cuando:** accede a registros fuera de las restricciones del operador  
**Entonces:** debe poder realizar las modificaciones habilitadas por su perfil

### Observaciones

La regla actual contempla especialmente creador y fecha de creación.


---

## 41. Crear dashboard de bonificaciones

### Asunto
Crear dashboard de bonificaciones de bajas

### Historia de usuario

**Como:** supervisor de Bajas  
**Quiero:** visualizar métricas agregadas de las bonificaciones  
**Para:** controlar volumen, estados y valor económico de la gestión

### Criterios de aceptación

#### Escenario 1: Visualización de métricas

**Dado:** que existen registros de bonificaciones  
**Cuando:** accedo al dashboard  
**Entonces:** debo visualizar agrupaciones relevantes de cantidad y montos

#### Escenario 2: Dimensiones de análisis

**Dado:** que necesito analizar la operación desde distintas perspectivas  
**Cuando:** consulto el tablero  
**Entonces:** debo disponer de agrupaciones como mes, plan, operador, período y estado

### Observaciones

Los indicadores económicos deben considerar los campos monetarios definidos en el módulo.


---

## 42. Agregar filtros al dashboard de bonificaciones

### Asunto
Agregar filtros de fecha y operador al dashboard de bonificaciones

### Historia de usuario

**Como:** supervisor de Bajas  
**Quiero:** filtrar las métricas por período y operador  
**Para:** analizar subconjuntos específicos de la gestión

### Criterios de aceptación

#### Escenario 1: Filtro de fechas

**Dado:** que existen datos de diferentes jornadas  
**Cuando:** selecciono un rango de fechas  
**Entonces:** los indicadores deben considerar únicamente registros del período elegido

#### Escenario 2: Filtro de operador

**Dado:** que existen registros de múltiples usuarios  
**Cuando:** selecciono un operador  
**Entonces:** las métricas deben actualizarse utilizando solo sus gestiones

### Observaciones

Los filtros deben poder combinarse.


---

## 43. Mejorar colores y layout de estados en bonificaciones

### Asunto
Mejorar visualización de estados y datos de bonificaciones

### Historia de usuario

**Como:** operador del módulo de Bajas  
**Quiero:** distinguir visualmente los diferentes estados y datos de los registros  
**Para:** interpretar la información más rápidamente

### Criterios de aceptación

#### Escenario 1: Estados

**Dado:** que existen bonificaciones en distintos estados  
**Cuando:** se muestran en listados o detalle  
**Entonces:** deben presentarse con una representación visual consistente y diferenciable

#### Escenario 2: Layout

**Dado:** que la pantalla contiene múltiples campos y columnas  
**Cuando:** accedo al módulo  
**Entonces:** la distribución debe permitir consultar la información sin pérdida de legibilidad

### Observaciones

Los cambios visuales no deben modificar las reglas funcionales existentes.


---

## 44. Exportar bonificaciones a Excel por rango y operador

### Asunto
Exportar bonificaciones de bajas a Excel con filtros

### Historia de usuario

**Como:** supervisor de Bajas  
**Quiero:** exportar las bonificaciones filtradas por período y operador  
**Para:** realizar liquidaciones, controles y reportes externos

### Criterios de aceptación

#### Escenario 1: Exportación por fechas

**Dado:** que seleccioné un rango de fechas  
**Cuando:** ejecuto la exportación  
**Entonces:** el archivo debe incluir únicamente los registros correspondientes

#### Escenario 2: Exportación por operador

**Dado:** que además seleccioné un operador  
**Cuando:** se genera el archivo  
**Entonces:** la planilla debe respetar ambos filtros e incluir los datos operativos necesarios

### Observaciones

El archivo generado debe ser compatible con Excel.


---

## 45. Agregar importación de bonificaciones

### Asunto
Permitir importación masiva de bonificaciones desde archivo

### Historia de usuario

**Como:** usuario autorizado del módulo de Bajas  
**Quiero:** cargar múltiples bonificaciones desde una planilla  
**Para:** evitar el alta manual individual cuando la información proviene de archivos externos

### Criterios de aceptación

#### Escenario 1: Archivo válido

**Dado:** que selecciono un archivo con el formato esperado  
**Cuando:** ejecuto la importación  
**Entonces:** el sistema debe procesar y crear los registros válidos

#### Escenario 2: Datos inválidos

**Dado:** que una fila no cumple las reglas requeridas  
**Cuando:** se procesa el archivo  
**Entonces:** el sistema debe informar el inconveniente de forma que pueda ser corregido

### Observaciones

La importación debe respetar las mismas reglas principales de validación del alta manual.


---

## 46. Configurar roles de OperadorBaja y SupervisorBaja

### Asunto
Configurar permisos para roles OperadorBaja y SupervisorBaja

### Historia de usuario

**Como:** administrador del sistema  
**Quiero:** disponer de roles específicos para operadores y supervisores de Bajas  
**Para:** asignar a cada perfil únicamente las funcionalidades que necesita

### Criterios de aceptación

#### Escenario 1: Operador de Bajas

**Dado:** que un usuario posee el rol OperadorBaja  
**Cuando:** ingresa al sistema  
**Entonces:** debe acceder a las funciones operativas habilitadas para dicho perfil

#### Escenario 2: Supervisor de Bajas

**Dado:** que un usuario posee el rol SupervisorBaja  
**Cuando:** ingresa al módulo  
**Entonces:** debe disponer de las capacidades adicionales de gestión, supervisión y exportación configuradas

### Observaciones

Los permisos deben contemplar también el acceso a archivos cuando sea necesario.
