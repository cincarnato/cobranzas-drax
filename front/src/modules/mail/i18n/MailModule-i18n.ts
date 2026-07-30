const messages = {
  en: {
    mail: {
      module: {
        menu: "Mail module",
        eyebrow: "Mail module",
        title: "Shared inbox management",
        intro: "Centralizes corporate inboxes so each email can be assigned, answered, classified and closed from one place.",
        problem: "It helps teams handle high-volume area inboxes with several operators, reducing duplicated work and improving visibility over pending, assigned and closed cases.",
        benefitsTitle: "What it helps solve",
        benefits: {
          sharedInbox: "Organized work over shared corporate inboxes.",
          traceability: "Clear tracking of who took, answered and closed each email.",
          metrics: "Operational metrics for workload, activity and reporting.",
          ai: "AI support for summaries, priorities, sentiment, tags and extracted data.",
        },
        sectionsTitle: "Module sections",
        sectionsSubtitle: "Access the available mail tools according to your profile permissions.",
        openSection: "Open tool",
        featured: "Main",
        noSections: "There are no mail sections available for your user.",
        cards: {
          management: {
            title: "Email management",
            description: "Daily work inbox for operators: review pending emails, take cases, reply, classify and close each management.",
          },
          supervision: {
            title: "Live supervision",
            description: "Real-time monitoring for supervisors: active operators, paused sessions, pending emails, assigned workload and current cases.",
          },
          mailboxes: {
            title: "Mailbox configuration",
            description: "Administration of corporate inboxes, server connection, operators, categories, closing rules, processing and AI settings.",
          },
          inbound: {
            title: "Inbound emails",
            description: "Administrative list of received emails with their technical, processing, assignment and classification information.",
          },
          outbound: {
            title: "Outbound emails",
            description: "Administrative list of emails sent from the platform, useful for auditing responses and outgoing communications.",
          },
          dashboard: {
            title: "Inbound email dashboard",
            description: "Metrics and reports to analyze volume, statuses, classifications and operational behavior of received emails.",
          },
          sync: {
            title: "Sync emails",
            description: "Manual processing tool to read enabled mailboxes and bring new inbound emails into the platform.",
          },
          guide: {
            title: "User guide",
            description: "Friendly usage guide with the main concepts, recommended workflow and practical instructions for the mail module.",
          },
        },
      },
      moduleGuide: {
        eyebrow: "User guide",
        title: "How to use the mail module",
        intro: "This guide summarizes how the platform organizes shared inboxes, how operators should work, and what supervisors can monitor.",
        indexTitle: "Contents",
        sections: {
          concepts: {
            title: "Main concepts",
            description: "Basic ideas to understand before using the module.",
            items: {
              mailbox: {
                title: "Mailbox",
                text: "A mailbox is the corporate inbox managed by the platform, such as collections, administration or customer service.",
              },
              inbound: {
                title: "Inbound email",
                text: "Each received email becomes a manageable case that can be assigned, answered, classified and closed.",
              },
              operator: {
                title: "Operator",
                text: "The operator is the user who handles emails. Each operator must be enabled in the mailbox configuration.",
              },
              session: {
                title: "Attention session",
                text: "The session indicates that the operator is working on a mailbox and allows the platform to measure activity and workload.",
              },
            },
          },
          configuration: {
            title: "Mailbox configuration",
            description: "Defines how the inbox connects, how it is managed and how AI analysis behaves.",
            items: {
              general: {
                title: "General data",
                text: "Name, email, user, password and active status identify the inbox and allow the platform to access it.",
              },
              connection: {
                title: "Mail server connection",
                text: "IMAP or POP are used to read incoming emails. SMTP is used to send replies and new emails from the platform.",
              },
              management: {
                title: "Management rules",
                text: "Categories, closing reasons, operators and assignment limits define how daily work is organized.",
              },
              processing: {
                title: "Processing",
                text: "Automatic processing checks the inbox periodically. Attachments, OCR and retention days control what is stored and for how long.",
              },
              ai: {
                title: "AI analysis",
                text: "AI can suggest summaries, categories, priorities, sentiment, tags and extracted data to speed up review.",
              },
            },
          },
          dailyWork: {
            title: "Daily operator work",
            description: "Recommended use of Email Management during the workday.",
            items: {
              selectMailbox: {
                title: "Select the mailbox",
                text: "Choose the inbox you are going to work on. Each mailbox can have its own rules, operators and categories.",
              },
              startSession: {
                title: "Start attention",
                text: "Start the session when you begin working. You can pause, resume or finish it depending on your availability.",
              },
              views: {
                title: "Use the work views",
                text: "Pending, assigned to me, assigned, closed, sent and starred views help separate current work from history.",
              },
              filters: {
                title: "Search and filter",
                text: "Use text search, category, priority, assigned user, dates, attachments, tags and unanswered filters to find cases quickly.",
              },
            },
          },
          caseManagement: {
            title: "Handling an email",
            description: "Basic flow to resolve a case from the detail screen.",
            items: {
              detail: {
                title: "Read the detail",
                text: "Open the email to see sender, recipients, date, status, assignment, category, indicators and the full thread.",
              },
              assign: {
                title: "Take or assign",
                text: "A case must be assigned before replying or closing. This avoids two operators working on the same email at the same time.",
              },
              reply: {
                title: "Reply",
                text: "Use the editor to answer from the corporate inbox, add copy recipients, format the text and attach files.",
              },
              classify: {
                title: "Classify",
                text: "Review or adjust priority, sentiment, category and closing reason. These changes help reporting and follow-up.",
              },
              close: {
                title: "Close the case",
                text: "Close when the management is complete. The mailbox may require a reply or a closing reason before allowing it.",
              },
            },
          },
          supervision: {
            title: "Live supervision",
            description: "How supervisors monitor the current operation.",
            items: {
              summary: {
                title: "Summary indicators",
                text: "Review active operators, paused operators, pending emails, assigned emails and cases closed today.",
              },
              operators: {
                title: "Operator table",
                text: "Compare status, session duration, workload, assigned cases, replies, closures and last activity.",
              },
              detail: {
                title: "Operator detail",
                text: "Open an operator to see capacity, session metrics and current assigned cases.",
              },
            },
          },
          recommendedFlow: {
            title: "Recommended workflow",
            description: "A simple order to operate the module consistently.",
            items: {
              configure: {
                title: "Configure",
                text: "Set up the mailbox with connection data, operators, categories, priorities and closing rules.",
              },
              process: {
                title: "Process incoming emails",
                text: "Let automatic processing bring emails into the platform, or run a manual sync when needed.",
              },
              operate: {
                title: "Work the queue",
                text: "Operators start attention, take cases, reply, classify and close each management.",
              },
              monitor: {
                title: "Monitor",
                text: "Supervisors review workload and activity to detect bottlenecks and redistribute cases.",
              },
            },
          },
          bestPractices: {
            title: "Good practices",
            description: "Practical recommendations for a clear and measurable operation.",
            items: {
              startSession: {
                title: "Start and finish sessions",
                text: "Keep session status updated so supervision reflects who is actually available.",
              },
              assign: {
                title: "Work assigned cases",
                text: "Take the email before replying and avoid working outside the assignment flow.",
              },
              close: {
                title: "Close with criteria",
                text: "Use categories, priorities and closing reasons consistently so reports remain useful.",
              },
              supervise: {
                title: "Review workload",
                text: "Use supervision to detect pending accumulation, inactive sessions or uneven distribution.",
              },
            },
          },
        },
      },
    },
  },
  es: {
    mail: {
      module: {
        menu: "Presentacion del modulo",
        eyebrow: "GESTIÓN DE CORREOS",
        title: "Gestión de casillas compartidas",
        intro: "Centraliza las casillas corporativas y gestiona cada correo desde un solo lugar: asígnalo, respóndelo, clasifícalo y ciérralo con total trazabilidad.",
        problem: "Organiza el trabajo de equipos que administran cuentas con alto volumen de correos, evita respuestas duplicadas y ofrece visibilidad sobre los casos pendientes, asignados y finalizados.",
        benefitsTitle: "¿Qué problemas ayuda a resolver?",
        benefits: {
          sharedInbox: "Trabajo ordenado en casillas corporativas compartidas.",
          traceability: "Trazabilidad de quién tomó, respondió y cerró cada correo.",
          metrics: "Métricas sobre carga de trabajo, actividad y resultados.",
          ai: "Asistencia de inteligencia artificial para resumir, priorizar, clasificar y detectar datos relevantes.",
        },
        sectionsTitle: "Herramientas disponibles",
        sectionsSubtitle: "Accede a las herramientas habilitadas según los permisos de tu perfil.",
        openSection: "Abrir herramienta",
        featured: "Principal",
        noSections: "No hay herramientas de correo disponibles para tu usuario.",
        cards: {
          management: {
            title: "Gestión de correos",
            description: "Bandeja de trabajo para revisar pendientes, tomar casos, responder, clasificar y cerrar gestiones.",
          },
          supervision: {
            title: "Supervisión en vivo",
            description: "Monitorea en tiempo real la actividad de los operadores, la carga de trabajo y los casos pendientes o en curso.",
          },
          mailboxes: {
            title: "Configuración de casillas",
            description: "Administra las casillas corporativas, su conexión al servidor, los operadores, las categorías, las reglas de cierre y el análisis con inteligencia artificial.",
          },
          inbound: {
            title: "Correos entrantes",
            description: "Consulta los correos recibidos junto con su información técnica, estado de procesamiento, asignación y clasificación.",
          },
          outbound: {
            title: "Correos enviados",
            description: "Consulta y audita los correos enviados desde la plataforma, incluidas las respuestas y las comunicaciones salientes.",
          },
          dashboard: {
            title: "Panel de correos entrantes",
            description: "Analiza el volumen de correos, sus estados, clasificaciones y principales métricas operativas.",
          },
          sync: {
            title: "Sincronizar correos",
            description: "Procesa manualmente las casillas habilitadas e incorpora nuevos correos entrantes a la plataforma.",
          },
          guide: {
            title: "Guía de uso",
            description: "Consulta los conceptos principales, el flujo recomendado y las buenas prácticas para utilizar la gestión de correos.",
          },
        },
      },
      moduleGuide: {
        eyebrow: "Guia de uso",
        title: "Como usar el modulo de mails",
        intro: "Esta guia resume como la plataforma ordena casillas compartidas, como deben trabajar los operadores y que pueden monitorear los supervisores.",
        indexTitle: "Indice",
        sections: {
          concepts: {
            title: "Conceptos principales",
            description: "Ideas basicas para entender el modulo antes de empezar a usarlo.",
            items: {
              mailbox: {
                title: "Mailbox",
                text: "Es la casilla corporativa gestionada por la plataforma, por ejemplo cobranzas, administracion o atencion al cliente.",
              },
              inbound: {
                title: "Correo entrante",
                text: "Cada mail recibido se convierte en un caso gestionable que puede asignarse, responderse, clasificarse y cerrarse.",
              },
              operator: {
                title: "Operador",
                text: "Es el usuario que atiende correos. Para trabajar una casilla debe estar habilitado en la configuracion del mailbox.",
              },
              session: {
                title: "Sesion de atencion",
                text: "Indica que el operador esta trabajando sobre una casilla y permite medir actividad, respuestas, cierres y carga en curso.",
              },
            },
          },
          configuration: {
            title: "Configuracion del mailbox",
            description: "Define como se conecta la casilla, como se gestiona y como se aplica el analisis IA.",
            items: {
              general: {
                title: "Datos generales",
                text: "Nombre, email, usuario, clave y estado activo identifican la casilla y permiten que la plataforma pueda acceder a ella.",
              },
              connection: {
                title: "Conexion al servidor",
                text: "IMAP o POP permiten leer correos entrantes. SMTP permite enviar respuestas y nuevos mails desde la plataforma.",
              },
              management: {
                title: "Reglas de gestion",
                text: "Categorias, motivos de cierre, operadores y limite de asignacion definen como se organiza el trabajo diario.",
              },
              processing: {
                title: "Procesamiento",
                text: "El procesamiento automatico revisa la casilla periodicamente. Adjuntos, OCR y retencion definen que se guarda y por cuanto tiempo.",
              },
              ai: {
                title: "Analisis IA",
                text: "La IA puede sugerir resumen, categoria, prioridad, sentimiento, etiquetas y datos detectados para acelerar la revision.",
              },
            },
          },
          dailyWork: {
            title: "Trabajo diario del operador",
            description: "Uso recomendado de Email Management durante la jornada.",
            items: {
              selectMailbox: {
                title: "Seleccionar mailbox",
                text: "Elegir la casilla sobre la que se va a trabajar. Cada mailbox puede tener reglas, operadores y categorias propias.",
              },
              startSession: {
                title: "Iniciar atencion",
                text: "Iniciar la sesion al comenzar a trabajar. Se puede pausar, reanudar o finalizar segun la disponibilidad del operador.",
              },
              views: {
                title: "Usar las vistas",
                text: "Pendientes, asignados a mi, asignados, cerrados, enviados y destacados separan el trabajo actual del historial.",
              },
              filters: {
                title: "Buscar y filtrar",
                text: "Usar busqueda, categoria, prioridad, asignado, fechas, adjuntos, etiquetas y sin respuesta para encontrar casos rapido.",
              },
            },
          },
          caseManagement: {
            title: "Gestion de un correo",
            description: "Flujo basico para resolver un caso desde el detalle del correo.",
            items: {
              detail: {
                title: "Leer el detalle",
                text: "Abrir el correo para ver remitente, destinatarios, fecha, estado, asignacion, categoria, indicadores e hilo completo.",
              },
              assign: {
                title: "Tomar o asignar",
                text: "El caso debe estar asignado antes de responder o cerrar. Esto evita que dos operadores trabajen el mismo mail a la vez.",
              },
              reply: {
                title: "Responder",
                text: "Usar el editor para contestar desde la casilla corporativa, agregar copias, dar formato al texto y adjuntar archivos.",
              },
              classify: {
                title: "Clasificar",
                text: "Revisar o ajustar prioridad, sentimiento, categoria y motivo de cierre. Estos datos ayudan al seguimiento y reporteria.",
              },
              close: {
                title: "Cerrar gestion",
                text: "Cerrar cuando el caso esta resuelto. El mailbox puede exigir una respuesta enviada o un motivo de cierre.",
              },
            },
          },
          supervision: {
            title: "Supervision en vivo",
            description: "Como los supervisores monitorean la operacion actual.",
            items: {
              summary: {
                title: "Indicadores generales",
                text: "Revisar operadores activos, pausados, correos pendientes, correos asignados y casos cerrados hoy.",
              },
              operators: {
                title: "Tabla de operadores",
                text: "Comparar estado, duracion de sesion, carga, asignados, respondidos, cerrados y ultima actividad.",
              },
              detail: {
                title: "Detalle del operador",
                text: "Abrir un operador para ver capacidad, metricas de sesion y casos actualmente asignados.",
              },
            },
          },
          recommendedFlow: {
            title: "Flujo recomendado",
            description: "Un orden simple para operar el modulo de manera consistente.",
            items: {
              configure: {
                title: "Configurar",
                text: "Definir conexion del mailbox, operadores, categorias, prioridades y reglas de cierre.",
              },
              process: {
                title: "Procesar correos",
                text: "Permitir que el procesamiento automatico incorpore mails, o ejecutar sincronizacion manual si hace falta.",
              },
              operate: {
                title: "Trabajar la cola",
                text: "Los operadores inician atencion, toman casos, responden, clasifican y cierran cada gestion.",
              },
              monitor: {
                title: "Monitorear",
                text: "Los supervisores revisan carga y actividad para detectar acumulacion o redistribuir casos.",
              },
            },
          },
          bestPractices: {
            title: "Buenas practicas",
            description: "Recomendaciones para sostener una operacion clara y medible.",
            items: {
              startSession: {
                title: "Iniciar y finalizar sesiones",
                text: "Mantener actualizado el estado de sesion para que supervision refleje quien esta disponible.",
              },
              assign: {
                title: "Trabajar casos asignados",
                text: "Tomar el correo antes de responder y evitar gestiones por fuera del circuito de asignacion.",
              },
              close: {
                title: "Cerrar con criterio",
                text: "Usar categorias, prioridades y motivos de cierre de forma consistente para que los reportes sean utiles.",
              },
              supervise: {
                title: "Revisar carga",
                text: "Usar supervision para detectar acumulacion, sesiones sin actividad o distribucion desigual.",
              },
            },
          },
        },
      },
    },
  },
};

export default messages;
