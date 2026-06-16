# AGENTS.md

## Project Overview
Monorepo with three main packages:
- **front/** - Vue 3 + Vuetify frontend application
- **back/** - Fastify (Node.js) backend API with MongoDB
- **arch/** - Architecture package using @drax/arch


## Local Skills

Project-specific Codex skills are available in `.agent/skills`. When a task matches one of those skills, inspect the corresponding `SKILL.md` before implementing changes.

### Entity Architecture Rules

- Every entity must include Model, Schema, Interface, Service, Repository, and ServiceFactory.
- Database operations must be performed exclusively from the entity Repository.
- Communication between entities must go through their Services.
- When an entity needs to access another entity, import that entity ServiceFactory to obtain its Service instance.

### Frontend Rules

- Prioritize using Vuetify components for the UI
- Prioritize using v-row and v-col for responsive layouts
- Prioritize using classes provided by Vuetify over custom classes
- Generate composable components to encapsulate reusable component logic
- Generate vue subcomponents when a vue component is very large and has sections that can be modularized
- Use i18n for labels and text

### Error Handling

- Use built-in error classes from `@drax/common-back` (e.g., `NotFoundError`)
- Validate input using Zod schemas

## Directory Structure

```
/
├── front/               # Vue 3 frontend (Vuetify)
│   ├── src/
│   │   ├── modules/    # Feature modules (agents, base, google, etc.)
│   │   ├── components/ # Shared components
│   │   ├── layouts/   # Vue layouts
│   │   ├── stores/    # Pinia stores
│   │   └── plugins/   # Vue plugins
│   └── eslint.config.js
├── back/               # Fastify backend API
│   ├── src/
│   │   ├── modules/   # Feature modules with MVC structure
│   │   │   └── {module}/
│   │   │       ├── controllers/
│   │   │       ├── services/
│   │   │       ├── routes/
│   │   │       ├── models/
│   │   │       ├── schemas/
│   │   │       ├── interfaces/
│   │   │       ├── permissions/
│   │   │       ├── repository/
│   │   │       └── factory/
│   │   ├── setup/     # App initialization
│   │   ├── databases/ # DB connections
│   │   └── servers/   # Server configuration
│   ├── test/
│   │   ├── setup/     # Test utilities (TestSetup, MongoInMemory)
│   │   └── modules/   # Tests mirroring src structure
│   └── tsconfig.json
└── arch/              # Architecture package
```
