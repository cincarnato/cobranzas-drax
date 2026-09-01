# TRASPASOS INTERNOS

## 47. Crear módulo de traspasos internos

### Asunto
Crear módulo de bonificaciones por traspasos internos

### Historia de usuario

**Como:** operador responsable de traspasos internos  
**Quiero:** gestionar las bonificaciones originadas por este circuito en un módulo específico  
**Para:** diferenciarlas de las bonificaciones generales de Bajas

### Criterios de aceptación

#### Escenario 1: Alta y consulta

**Dado:** que tengo permisos sobre Traspasos Internos  
**Cuando:** registro una nueva bonificación  
**Entonces:** debe almacenarse dentro del módulo correspondiente

#### Escenario 2: Separación funcional

**Dado:** que existen bonificaciones de Bajas y de Traspasos Internos  
**Cuando:** consulto cada módulo  
**Entonces:** los registros deben permanecer diferenciados según su proceso

### Observaciones

El módulo comparte algunas reglas con Bajas pero representa un circuito independiente.


---

## 48. Registrar bonificaciones de traspaso con datos específicos

### Asunto
Incorporar datos específicos para bonificaciones de traspasos internos

### Historia de usuario

**Como:** operador de Traspasos Internos  
**Quiero:** registrar la información necesaria para cada bonificación  
**Para:** completar correctamente su posterior aplicación y control

### Criterios de aceptación

#### Escenario 1: Formulario

**Dado:** que estoy creando o editando un traspaso  
**Cuando:** completo sus datos  
**Entonces:** debo poder informar DNI, nombre, mes, valor bonificado, tipo, estado y observación

#### Escenario 2: Registro del creador

**Dado:** que un usuario crea el registro  
**Cuando:** se guarda  
**Entonces:** debe conservarse la identificación del usuario responsable

### Observaciones

Los campos deben responder a las necesidades específicas del circuito de traspasos.


---

## 49. Validar adjunto bancario para transferencias bancarias

### Asunto
Exigir datos bancarios adjuntos en bonificaciones por transferencia bancaria

### Historia de usuario

**Como:** responsable de Traspasos Internos  
**Quiero:** impedir la carga incompleta de bonificaciones que deben pagarse por transferencia bancaria  
**Para:** asegurar que el área ejecutora disponga de los datos necesarios

### Criterios de aceptación

#### Escenario 1: Transferencia bancaria sin adjunto

**Dado:** que el tipo de bonificación es Transferencia Bancaria  
**Cuando:** intento guardar el registro sin la documentación bancaria requerida  
**Entonces:** el sistema debe impedir la operación

#### Escenario 2: Transferencia bancaria con adjunto

**Dado:** que adjunté los datos bancarios requeridos  
**Cuando:** confirmo el registro  
**Entonces:** debe permitirse guardar la bonificación

### Observaciones

La validación debe aplicarse específicamente al tipo de bonificación que requiere transferencia bancaria.


---

## 50. Aplicar reglas de edición por permisos, creador y fecha

### Asunto
Restringir edición de traspasos internos según permisos, creador y fecha

### Historia de usuario

**Como:** responsable del proceso  
**Quiero:** limitar las modificaciones que pueden realizar los operadores  
**Para:** proteger registros históricos y evitar cambios indebidos

### Criterios de aceptación

#### Escenario 1: Operador estándar

**Dado:** que el usuario no posee permisos ampliados  
**Cuando:** intenta editar un registro  
**Entonces:** solo debe poder hacerlo si cumple las condiciones de creador y fecha establecidas

#### Escenario 2: Usuario autorizado

**Dado:** que el usuario posee permisos de gestión  
**Cuando:** necesita modificar un registro fuera de las restricciones comunes  
**Entonces:** el sistema debe permitirlo conforme a su autorización

### Observaciones

La regla debe ser consistente con el esquema de control aplicado al módulo de Bajas.


---

## 51. Validar observación para traspasos no aplicados

### Asunto
Exigir observación en traspasos internos No aplicados

### Historia de usuario

**Como:** supervisor de Traspasos Internos  
**Quiero:** conocer el motivo de los casos que no pudieron aplicarse  
**Para:** mantener trazabilidad sobre el resultado de cada gestión

### Criterios de aceptación

#### Escenario 1: Sin observación

**Dado:** que un registro no posee justificación  
**Cuando:** intento cambiarlo a No aplicado  
**Entonces:** el sistema debe impedir guardar el estado

#### Escenario 2: Con observación

**Dado:** que informé la causa correspondiente  
**Cuando:** confirmo el cambio  
**Entonces:** debe guardarse el estado junto con la observación

### Observaciones

La observación debe encontrarse disponible posteriormente para auditoría.


---

## 52. Crear dashboard de traspasos internos

### Asunto
Crear dashboard de traspasos internos

### Historia de usuario

**Como:** supervisor de Traspasos Internos  
**Quiero:** visualizar métricas del circuito en un tablero  
**Para:** conocer cantidades, estados y montos gestionados

### Criterios de aceptación

#### Escenario 1: Visualización

**Dado:** que existen registros de traspasos  
**Cuando:** accedo al dashboard  
**Entonces:** debo visualizar indicadores agregados relevantes

#### Escenario 2: Actualización

**Dado:** que cambia la información de los registros  
**Cuando:** actualizo o vuelvo a consultar el tablero  
**Entonces:** las métricas deben reflejar los valores actuales

### Observaciones

Las agrupaciones deben responder a las necesidades operativas del módulo.


---

## 53. Exportar traspasos internos a Excel

### Asunto
Exportar bonificaciones de traspasos internos a Excel

### Historia de usuario

**Como:** responsable de Traspasos Internos  
**Quiero:** exportar los registros según período y operador  
**Para:** realizar liquidaciones y enviar información a las áreas administrativas

### Criterios de aceptación

#### Escenario 1: Exportación filtrada

**Dado:** que seleccioné los filtros disponibles  
**Cuando:** ejecuto la exportación  
**Entonces:** debe generarse un archivo Excel con los registros correspondientes

#### Escenario 2: Información bancaria

**Dado:** que algunos registros corresponden a pagos por transferencia  
**Cuando:** se genera el archivo  
**Entonces:** debe incluirse la información bancaria necesaria definida para la exportación

### Observaciones

El archivo debe contemplar también estado y datos operativos relevantes.


---

## 54. Habilitar importación de traspasos internos

### Asunto
Permitir importación masiva de traspasos internos

### Historia de usuario

**Como:** usuario autorizado de Traspasos Internos  
**Quiero:** importar registros desde un archivo  
**Para:** reducir la carga manual cuando la información se recibe en forma de planilla

### Criterios de aceptación

#### Escenario 1: Archivo válido

**Dado:** que seleccioné un archivo con la estructura esperada  
**Cuando:** inicio la importación  
**Entonces:** deben generarse los registros válidos correspondientes

#### Escenario 2: Información inválida

**Dado:** que existen filas que incumplen las validaciones  
**Cuando:** son procesadas  
**Entonces:** el sistema debe informar los errores para permitir su corrección

### Observaciones

La carga masiva debe respetar las reglas funcionales del módulo.
