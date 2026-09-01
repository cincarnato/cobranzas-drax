PREMEDIC / AFILIADOS

## 17. Crear administración de afiliados y tipos de afiliado

### Asunto
Crear administración de afiliados y tipos de afiliado

### Historia de usuario

**Como:** administrador de datos de Premedic  
**Quiero:** gestionar afiliados y sus tipos dentro de la plataforma  
**Para:** disponer de información maestra reutilizable por los diferentes módulos

### Criterios de aceptación

#### Escenario 1: Gestión de afiliados

**Dado:** que tengo permisos administrativos  
**Cuando:** ingreso al mantenimiento de afiliados  
**Entonces:** debo poder crear, consultar y modificar registros según las reglas definidas

#### Escenario 2: Tipos de afiliado

**Dado:** que los afiliados pueden pertenecer a diferentes tipos  
**Cuando:** administro dicha información  
**Entonces:** debo poder mantener el catálogo correspondiente

### Observaciones

Ambas entidades deben contar con permisos y pantallas adecuadas.


---

## 18. Integrar afiliados como dato reusable para otros módulos

### Asunto
Crear selectores reutilizables de afiliados y tipos de afiliado

### Historia de usuario

**Como:** usuario de módulos que requieren información de afiliados  
**Quiero:** seleccionar datos existentes mediante controles reutilizables  
**Para:** evitar duplicación de información y mantener referencias consistentes

### Criterios de aceptación

#### Escenario 1: Selector de afiliado

**Dado:** que una pantalla requiere relacionar un afiliado  
**Cuando:** utilizo el combobox correspondiente  
**Entonces:** debo poder buscar y seleccionar un registro existente

#### Escenario 2: Selector de tipo

**Dado:** que una pantalla requiere un tipo de afiliado  
**Cuando:** utilizo su selector  
**Entonces:** deben mostrarse los valores disponibles en el catálogo

### Observaciones

Los componentes deben poder integrarse en distintos formularios de la plataforma.
