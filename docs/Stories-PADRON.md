# AFILMED / PADRÓN

## 14. Crear módulo de padrón Afilmed/Premedic

### Asunto
Crear módulo de administración de padrón Afilmed/Premedic

### Historia de usuario

**Como:** usuario de cobranzas  
**Quiero:** consultar y administrar el padrón de afiliados  
**Para:** disponer de una fuente centralizada de información de deuda y contacto

### Criterios de aceptación

#### Escenario 1: Administración

**Dado:** que tengo permisos sobre el padrón  
**Cuando:** ingreso al módulo  
**Entonces:** debo poder consultar y gestionar los registros disponibles

#### Escenario 2: Información de afiliado

**Dado:** que selecciono un registro  
**Cuando:** consulto su detalle  
**Entonces:** debo visualizar los datos de afiliación, deuda y contacto definidos para el padrón

### Observaciones

El módulo debe contar con permisos y menú propios.


---

## 15. Importar padrón desde archivo

### Asunto
Permitir importación masiva del padrón Afilmed/Premedic

### Historia de usuario

**Como:** administrador del padrón  
**Quiero:** cargar la información de afiliados desde un archivo  
**Para:** actualizar grandes volúmenes de datos sin registrarlos manualmente

### Criterios de aceptación

#### Escenario 1: Archivo válido

**Dado:** que selecciono un archivo en el formato soportado  
**Cuando:** ejecuto la importación  
**Entonces:** el sistema debe procesarlo y generar los registros correspondientes

#### Escenario 2: Errores de importación

**Dado:** que existen filas inválidas  
**Cuando:** se procesa el archivo  
**Entonces:** el usuario debe recibir información suficiente para identificar los inconvenientes

### Observaciones

La importación debe contemplar la estructura de padrón utilizada por la operación.


---

## 16. Exponer búsqueda, exportación y combobox de padrón

### Asunto
Habilitar búsqueda, exportación y selección reutilizable del padrón

### Historia de usuario

**Como:** usuario de distintos módulos de cobranzas  
**Quiero:** buscar y seleccionar afiliados del padrón desde otras pantallas  
**Para:** reutilizar la información existente y evitar cargas duplicadas

### Criterios de aceptación

#### Escenario 1: Búsqueda y selección

**Dado:** que una pantalla requiere seleccionar un afiliado  
**Cuando:** utilizo el selector de padrón  
**Entonces:** debo poder buscar y elegir un registro existente

#### Escenario 2: Exportación

**Dado:** que necesito trabajar externamente con el padrón  
**Cuando:** ejecuto su exportación  
**Entonces:** debe generarse un archivo con los registros correspondientes

### Observaciones

El selector debe ser reutilizable por otros módulos de la aplicación.
