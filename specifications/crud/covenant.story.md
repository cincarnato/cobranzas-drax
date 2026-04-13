Historia de usuario
Como: Administrador
Quiero: gestionar Covenant
Para: administrar los convenios respetando la estructura de datos legacy

| Field | Type | Required | Index | Validations | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| date | date | yes | no | | Fecha del convenio |
| link | string | no | no | | Enlace al documento o comprobante |
| since | string | yes | no | | Fecha de inicio (almacenado como texto) |
| until | string | yes | no | | Fecha de fin (almacenado como texto) |
| month | string | yes | no | | Mes correspondiente |
| fullname | string | yes | no | | Nombre completo del afiliado/convenio |
| dni | string | yes | no | | Documento Nacional de Identidad |
| locality | string | yes | no | | Localidad |
| address | string | yes | no | | Dirección |
| amount | number | yes | no | | Monto del convenio |
| comment | string | no | no | | Comentario general |
| group | ref:Group | yes | yes | | Referencia al Grupo |
| createdBy | ref:User | yes | no | | Usuario que creó el registro |
| updatedBy | ref:User | yes | no | | Usuario que actualizó el registro |
| status | string | no | no | | Estado del convenio |
| refuseComment | string | no | no | | Comentario de rechazo |
| refuseBy | ref:User | no | no | | Usuario que rechazó el convenio |

Criterios de aceptación  

Escenario 1: Crear Covenant exitosamente  
Dado: que el Administrador se encuentra en la pantalla de gestión de Covenant  
Cuando: completa los campos obligatorios con información válida y confirma la operación  
Entonces: el sistema registra el nuevo Covenant y muestra un mensaje de confirmación  

Escenario 2: Validación de campos obligatorios  
Dado: que el Administrador intenta crear o actualizar un Covenant  
Cuando: omite uno o más campos obligatorios o ingresa datos inválidos  
Entonces: el sistema muestra mensajes de validación claros y no permite continuar  

Escenario 3: Visualizar listado de Covenant  
Dado: que existen uno o más Covenant registrados  
Cuando: el Administrador accede a la sección correspondiente  
Entonces: el sistema muestra el listado actualizado con información relevante  

Escenario 4: Editar Covenant  
Dado: que el Administrador selecciona un Covenant existente  
Cuando: modifica los datos permitidos y confirma la operación  
Entonces: el sistema actualiza la información y muestra confirmación  

Escenario 5: Eliminar Covenant  
Dado: que el Administrador selecciona un Covenant existente  
Cuando: confirma la eliminación  
Entonces: el sistema realiza un borrado lógico (soft_delete) y lo remueve del listado  
