# LLAMADOS

## 1. Crear módulo de listados de llamadas

### Asunto
Crear módulo de gestión de listados de llamadas

### Historia de usuario

**Como:** responsable de una operación de llamados  
**Quiero:** administrar listados de contactos y sus tipificaciones  
**Para:** organizar campañas y registrar de manera centralizada la gestión telefónica

### Criterios de aceptación

#### Escenario 1: Administración de listados

**Dado:** que tengo permisos sobre el módulo  
**Cuando:** creo o consulto un listado  
**Entonces:** debo poder gestionar los contactos correspondientes a dicha campaña

#### Escenario 2: Tipificaciones

**Dado:** que los llamados pueden finalizar con diferentes resultados  
**Cuando:** se configura o registra la gestión  
**Entonces:** deben poder utilizarse tipos de éxito y fallo definidos para la operación

### Observaciones

El módulo debe contar con permisos y navegación propios.


---

## 2. Crear pantalla de agente de llamadas

### Asunto
Crear pantalla operativa para agentes de llamadas

### Historia de usuario

**Como:** agente de llamados  
**Quiero:** visualizar los datos del contacto y registrar la gestión desde una única pantalla  
**Para:** trabajar de forma rápida y consistente sobre los casos asignados

### Criterios de aceptación

#### Escenario 1: Consulta del contacto

**Dado:** que tengo un registro disponible para gestionar  
**Cuando:** ingreso a la pantalla de agente  
**Entonces:** debo visualizar la información necesaria del contacto y su historial

#### Escenario 2: Registro de gestión

**Dado:** que realicé un intento de contacto  
**Cuando:** completo el resultado  
**Entonces:** la información debe quedar registrada dentro del historial correspondiente

### Observaciones

La pantalla está orientada al trabajo diario del llamador.


---

## 3. Registrar intentos de llamada

### Asunto
Registrar intentos realizados sobre cada contacto

### Historia de usuario

**Como:** agente de llamados  
**Quiero:** registrar cada intento de comunicación  
**Para:** conocer cuántas veces se intentó contactar al afiliado y cuál fue el resultado de cada intento

### Criterios de aceptación

#### Escenario 1: Nuevo intento

**Dado:** que estoy gestionando un contacto  
**Cuando:** registro una nueva llamada  
**Entonces:** debe incrementarse y conservarse el historial de intentos

#### Escenario 2: Consulta

**Dado:** que existen varios intentos previos  
**Cuando:** consulto el caso  
**Entonces:** debo poder identificar la cantidad y resultados registrados

### Observaciones

Los intentos permiten controlar las distintas vueltas de contacto.


---

## 4. Ajustar vueltas del llamador

### Asunto
Corregir cálculo de vueltas e intentos de llamadas

### Historia de usuario

**Como:** supervisor de llamados  
**Quiero:** que la cantidad de vueltas refleje correctamente los intentos realizados  
**Para:** medir con precisión el seguimiento de cada contacto

### Criterios de aceptación

#### Escenario 1: Registro sucesivo

**Dado:** que se realizan varios intentos sobre un mismo contacto  
**Cuando:** se registra cada llamada  
**Entonces:** el número de vuelta debe evolucionar correctamente

#### Escenario 2: Consulta de historial

**Dado:** que existen intentos anteriores  
**Cuando:** se visualiza el caso  
**Entonces:** las vueltas deben coincidir con las gestiones efectivamente registradas

### Observaciones

El ajuste no debe alterar el historial existente de resultados.


---

## 5. Registrar resultado exitoso o fallido de una llamada

### Asunto
Registrar tipificación y resultado de cada llamada

### Historia de usuario

**Como:** agente de llamados  
**Quiero:** indicar el resultado de la comunicación realizada  
**Para:** mantener un historial completo de la gestión y medir sus resultados

### Criterios de aceptación

#### Escenario 1: Gestión exitosa

**Dado:** que logré contactar al afiliado  
**Cuando:** registro el resultado  
**Entonces:** debo poder seleccionar la tipificación correspondiente e informar notas y datos asociados cuando aplique

#### Escenario 2: Gestión fallida

**Dado:** que el contacto no pudo completarse  
**Cuando:** registro el intento  
**Entonces:** debo poder indicar el motivo de fallo y dejar trazabilidad de la gestión

### Observaciones

Cuando corresponda, el resultado debe contemplar promesa de pago y usuario responsable.


---

## 6. Buscar llamadas por datos internos del registro

### Asunto
Permitir búsqueda de llamados por datos dinámicos importados

### Historia de usuario

**Como:** operador o supervisor de llamados  
**Quiero:** buscar contactos utilizando los datos provenientes del listado original  
**Para:** localizar casos aunque el criterio no corresponda a un campo fijo del sistema

### Criterios de aceptación

#### Escenario 1: Campo dinámico existente

**Dado:** que los registros contienen datos importados adicionales  
**Cuando:** realizo una búsqueda por uno de esos valores  
**Entonces:** el sistema debe devolver los contactos coincidentes

#### Escenario 2: Resultado paginado

**Dado:** que la búsqueda devuelve múltiples coincidencias  
**Cuando:** consulto los resultados  
**Entonces:** deben presentarse paginados de forma utilizable

### Observaciones

La búsqueda debe contemplar los campos variables incorporados desde los archivos de origen.


---

## 7. Exportar llamadas a Excel

### Asunto
Exportar gestión de llamadas a Excel

### Historia de usuario

**Como:** supervisor de llamados  
**Quiero:** descargar una planilla con los registros gestionados  
**Para:** realizar análisis, controles y conciliaciones fuera del sistema

### Criterios de aceptación

#### Escenario 1: Generación de archivo

**Dado:** que existen registros de llamadas  
**Cuando:** ejecuto la exportación  
**Entonces:** debe generarse un archivo Excel con la información correspondiente

#### Escenario 2: Campos dinámicos

**Dado:** que los listados contienen columnas adicionales  
**Cuando:** se exportan los registros  
**Entonces:** el archivo debe conservar los datos dinámicos relevantes

### Observaciones

La exportación debe incluir también los resultados de gestión disponibles.


---

## 8. Crear dashboard de llamadas

### Asunto
Crear dashboard de gestión de llamados

### Historia de usuario

**Como:** supervisor de llamados  
**Quiero:** visualizar resultados e intentos de las campañas  
**Para:** analizar el rendimiento y avance de la operación

### Criterios de aceptación

#### Escenario 1: Métricas por listado

**Dado:** que un listado posee gestiones realizadas  
**Cuando:** accedo a su dashboard  
**Entonces:** debo visualizar indicadores de resultados, intentos y estados

#### Escenario 2: Segmentación

**Dado:** que los registros pertenecen a distintos grupos  
**Cuando:** aplico los filtros disponibles  
**Entonces:** las métricas deben actualizarse según la segmentación seleccionada

### Observaciones

El dashboard debe facilitar el seguimiento del desempeño de llamados.


---

## 9. Agregar botón de refresco en dashboard

### Asunto
Agregar actualización manual de métricas en dashboard de llamados

### Historia de usuario

**Como:** supervisor de llamados  
**Quiero:** actualizar las métricas del tablero sin recargar toda la aplicación  
**Para:** consultar rápidamente el avance actual de la operación

### Criterios de aceptación

#### Escenario 1: Actualización

**Dado:** que estoy visualizando el dashboard  
**Cuando:** selecciono la acción de refrescar  
**Entonces:** el sistema debe volver a consultar y mostrar los indicadores actuales

#### Escenario 2: Conservación del contexto

**Dado:** que tengo filtros seleccionados  
**Cuando:** actualizo los datos  
**Entonces:** el tablero debe mantener el contexto de consulta cuando corresponda

### Observaciones

La acción debe ser claramente visible en el dashboard.


---

## 10. Filtrar listados por grupo/zona

### Asunto
Aplicar filtros de grupo o zona en listados de llamados

### Historia de usuario

**Como:** usuario de la operación de llamados  
**Quiero:** consultar únicamente los registros correspondientes a mi grupo o zona  
**Para:** trabajar con la información que me corresponde

### Criterios de aceptación

#### Escenario 1: Grupo seleccionado

**Dado:** que existen registros de distintos grupos  
**Cuando:** aplico un filtro  
**Entonces:** el sistema debe mostrar únicamente los casos correspondientes

#### Escenario 2: Uso en distintas vistas

**Dado:** que el filtro de grupo se utiliza en listados o reportes  
**Cuando:** navego entre las pantallas alcanzadas  
**Entonces:** la segmentación debe aplicarse de forma consistente

### Observaciones

La funcionalidad puede utilizarse también como mecanismo de separación operativa entre equipos.
