# COBRANZAS / CONVENIOS

## 19. Crear módulo de cobranzas a domicilio / convenios

### Asunto
Crear módulo de gestión de convenios de cobranzas

### Historia de usuario

**Como:** cobrador o responsable de cobranzas  
**Quiero:** registrar convenios asociados a afiliados, importes, períodos y zonas  
**Para:** centralizar la gestión de cobranzas a domicilio

### Criterios de aceptación

#### Escenario 1: Registro de convenio

**Dado:** que tengo permisos sobre el módulo  
**Cuando:** creo un convenio  
**Entonces:** debe quedar asociado a la información operativa correspondiente

#### Escenario 2: Consulta por grupo

**Dado:** que existen convenios de diferentes grupos o zonas  
**Cuando:** accedo a la gestión  
**Entonces:** debo visualizar únicamente la información permitida según filtros y permisos

### Observaciones

El módulo incluye la administración de grupos o zonas utilizadas por cobranzas.


---

## 20. Cargar múltiples convenios desde formulario especializado

### Asunto
Permitir carga múltiple de convenios de cobranza

### Historia de usuario

**Como:** usuario de cobranzas  
**Quiero:** registrar varios convenios en una única operación  
**Para:** reducir tareas repetitivas de alta individual

### Criterios de aceptación

#### Escenario 1: Carga de múltiples filas

**Dado:** que necesito registrar varios convenios  
**Cuando:** utilizo el formulario de carga múltiple  
**Entonces:** debo poder completar más de un registro antes de confirmar

#### Escenario 2: Confirmación

**Dado:** que los datos ingresados son válidos  
**Cuando:** confirmo la operación  
**Entonces:** deben generarse los convenios correspondientes

### Observaciones

Los registros creados deben cumplir las mismas validaciones principales que el alta individual.


---

## 21. Exportar convenios filtrados

### Asunto
Exportar convenios de cobranzas con filtros

### Historia de usuario

**Como:** responsable de cobranzas  
**Quiero:** exportar los convenios correspondientes a una fecha y/o grupo  
**Para:** generar reportes y distribuir información operativa

### Criterios de aceptación

#### Escenario 1: Exportación por período

**Dado:** que seleccioné un criterio temporal  
**Cuando:** ejecuto la exportación  
**Entonces:** el archivo debe contener únicamente los convenios alcanzados

#### Escenario 2: Exportación por grupo

**Dado:** que seleccioné además un grupo  
**Cuando:** se genera el Excel  
**Entonces:** deben incluirse únicamente los registros de dicho grupo

### Observaciones

Los filtros utilizados deben coincidir con los disponibles en la operación.


---

## 22. Crear dashboard de convenios

### Asunto
Crear dashboard de cobranzas y convenios

### Historia de usuario

**Como:** supervisor de cobranzas  
**Quiero:** visualizar indicadores de convenios en un tablero  
**Para:** conocer estados, importes y distribución de la gestión

### Criterios de aceptación

#### Escenario 1: Visualización de métricas

**Dado:** que existen convenios registrados  
**Cuando:** accedo al dashboard  
**Entonces:** debo visualizar métricas y agrupaciones relevantes

#### Escenario 2: Segmentación

**Dado:** que necesito analizar un grupo específico  
**Cuando:** aplico los filtros correspondientes  
**Entonces:** el tablero debe recalcular los indicadores con dicho subconjunto

### Observaciones

Las métricas deben estar orientadas al seguimiento operativo y económico.


---

## 23. Ajustar filtros de grupo en dashboard/exportación

### Asunto
Corregir aplicación de filtros de grupo en cobranzas

### Historia de usuario

**Como:** usuario de cobranzas  
**Quiero:** que los filtros por grupo se respeten de manera consistente  
**Para:** evitar visualizar o exportar información que no corresponde al segmento seleccionado

### Criterios de aceptación

#### Escenario 1: Dashboard

**Dado:** que selecciono un grupo determinado  
**Cuando:** consulto el dashboard  
**Entonces:** las métricas deben calcularse exclusivamente con los registros de dicho grupo

#### Escenario 2: Exportación

**Dado:** que mantengo el mismo criterio de grupo  
**Cuando:** exporto información  
**Entonces:** el archivo debe respetar la misma segmentación

### Observaciones

La lógica debe ser consistente entre las diferentes pantallas del módulo.


---

## 24. Configurar roles, menús y permisos de cobranzas

### Asunto
Configurar roles y permisos del módulo de cobranzas

### Historia de usuario

**Como:** administrador del sistema  
**Quiero:** definir qué funcionalidades de cobranzas puede utilizar cada perfil  
**Para:** garantizar que cada usuario acceda únicamente a las operaciones que le corresponden

### Criterios de aceptación

#### Escenario 1: Usuario autorizado

**Dado:** que un usuario posee permisos sobre una función de cobranzas  
**Cuando:** inicia sesión  
**Entonces:** debe visualizar el acceso correspondiente y poder utilizarlo

#### Escenario 2: Usuario no autorizado

**Dado:** que el usuario carece del permiso necesario  
**Cuando:** intenta ingresar a la funcionalidad  
**Entonces:** el sistema debe impedir el acceso

### Observaciones

La configuración debe contemplar convenios, grupos, dashboards, exportaciones y demás capacidades relacionadas.
