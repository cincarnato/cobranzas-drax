Historia de usuario  
Como: Administrador  
Quiero: gestionar GroupZone  
Para: organizar y asignar zonas y agrupaciones a los usuarios, manteniendo retrocompatibilidad en la base de datos  

| Field | Type | Required | Index | Validations | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| name | string | yes | yes | min:3, max:100 | The name of the group zone |
| users | [ref:User] | no | no |  | List of assigned users to this group zone |

Criterios de aceptación  

Escenario 1: Crear GroupZone exitosamente  
Dado: que el Administrador se encuentra en la pantalla de gestión de GroupZone  
Cuando: completa los campos obligatorios con información válida y confirma la operación  
Entonces: el sistema registra el nuevo GroupZone (en la colección 'group') y muestra un mensaje de confirmación  

Escenario 2: Validación de campos obligatorios  
Dado: que el Administrador intenta crear o actualizar un GroupZone  
Cuando: omite uno o más campos obligatorios o ingresa datos inválidos  
Entonces: el sistema muestra mensajes de validación claros y no permite continuar  

Escenario 3: Visualizar listado de GroupZone  
Dado: que existen uno o más GroupZone registrados  
Cuando: el Administrador accede a la sección correspondiente  
Entonces: el sistema muestra el listado actualizado con información relevante  

Escenario 4: Editar GroupZone  
Dado: que el Administrador selecciona un GroupZone existente  
Cuando: modifica los datos permitidos y confirma la operación  
Entonces: el sistema actualiza la información y muestra confirmación  

Escenario 5: Eliminar GroupZone  
Dado: que el Administrador selecciona un GroupZone existente  
Cuando: confirma la eliminación  
Entonces: el sistema elimina el registro y lo remueve del listado  
