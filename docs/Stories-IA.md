### Asunto
Permitir seleccionar proveedor y modelo de IA mediante configuración

### Historia de usuario

**Como:** administrador técnico  
**Quiero:** configurar qué proveedor o modelo de IA utiliza la plataforma  
**Para:** modificar la infraestructura de IA sin reescribir los flujos funcionales

### Criterios de aceptación

#### Escenario 1: Proveedor configurado

**Dado:** que existe una configuración válida de proveedor y modelo  
**Cuando:** un módulo solicita una operación de IA  
**Entonces:** debe utilizarse la opción seleccionada

#### Escenario 2: Cambio de proveedor

**Dado:** que modifico la configuración  
**Cuando:** se ejecutan nuevos procesos de IA  
**Entonces:** deben utilizar la nueva opción sin requerir cambios funcionales en Mail o Transferencias

### Observaciones

La selección debe abstraer a los módulos consumidores de la implementación concreta del proveedor.
