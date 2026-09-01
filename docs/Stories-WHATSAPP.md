# WHATSAPP



---

## 11. Enviar WhatsApp por plantilla desde llamadas

### Asunto
Permitir envío de WhatsApp por plantilla desde la gestión de llamados

### Historia de usuario

**Como:** agente de llamados  
**Quiero:** enviar un mensaje de WhatsApp predefinido al afiliado desde la misma gestión  
**Para:** utilizar un canal alternativo de contacto sin abandonar la pantalla operativa

### Criterios de aceptación

#### Escenario 1: Envío válido

**Dado:** que el contacto posee un teléfono válido y existe una plantilla disponible  
**Cuando:** selecciono la plantilla y confirmo el envío  
**Entonces:** el sistema debe solicitar el envío mediante la integración configurada

#### Escenario 2: Resultado

**Dado:** que el proveedor responde a la solicitud  
**Cuando:** finaliza la operación  
**Entonces:** el usuario debe recibir una indicación clara de éxito o error

### Observaciones

El envío se realiza mediante la integración con Multichannel/Sondeos.


---

## 12. Registrar mensajes de WhatsApp enviados

### Asunto
Registrar trazabilidad de mensajes de WhatsApp enviados

### Historia de usuario

**Como:** supervisor de llamados  
**Quiero:** consultar qué mensajes de WhatsApp fueron enviados desde la plataforma  
**Para:** mantener trazabilidad de las comunicaciones realizadas

### Criterios de aceptación

#### Escenario 1: Mensaje enviado

**Dado:** que se realiza un envío de WhatsApp  
**Cuando:** la operación queda registrada  
**Entonces:** debe crearse un registro con la información necesaria para identificar el mensaje

#### Escenario 2: Consulta posterior

**Dado:** que existen mensajes registrados  
**Cuando:** un usuario autorizado consulta la información  
**Entonces:** debe poder revisar la trazabilidad de los envíos

### Observaciones

El registro debe permitir relacionar la comunicación con la gestión correspondiente cuando aplique.


---

## 13. Manejar errores de integración WhatsApp

### Asunto
Mejorar validación y manejo de errores en envíos de WhatsApp

### Historia de usuario

**Como:** agente de llamados  
**Quiero:** recibir información clara cuando un envío de WhatsApp no puede realizarse  
**Para:** conocer la causa y decidir cómo continuar la gestión

### Criterios de aceptación

#### Escenario 1: Normalización del teléfono

**Dado:** que el teléfono puede venir en diferentes formatos  
**Cuando:** intento realizar un envío  
**Entonces:** el sistema debe normalizarlo según las reglas definidas antes de invocar al proveedor

#### Escenario 2: Error del proveedor

**Dado:** que el proveedor devuelve un error  
**Cuando:** se recibe la respuesta  
**Entonces:** la plataforma debe manejarla de forma controlada e informar al operador sin dejar la gestión en un estado inconsistente

### Observaciones

Debe contemplarse el tratamiento de las principales respuestas de error de la integración.
