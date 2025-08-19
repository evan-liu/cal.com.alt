# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `cal.com.alt`, an alternative implementation of cal.com using modern tech stack and DDD-lite architecture. It's a TypeScript monorepo using pnpm workspaces and Nx for tooling.

## Essential Commands

### Development

- `pnpm dev:api` - Start API server in development mode
- `pnpm build:api` - Build the API application

### Testing

- `pnpm test` - Run unit tests (vitest --project unit)
- `pnpm test:watch` - Run unit tests in watch mode
- `pnpm test:coverage` - Run unit tests with coverage
- `pnpm test:e2e` - Run end-to-end tests (vitest --project e2e)

### Database

- `pnpm db:schema` - Generate database schema types

### Package Management

- `pnpm update --latest -r` - Update all packages in workspace to latest versions

## Architecture

### Workspace Structure

The codebase follows a DDD-lite approach with clear separation of concerns. Backend packages are organized with `be-` prefixed directories:

```
📂 apps
 ├ 📂 api                   # Fastify API server
📂 packages
 ├ 📂 be-contexts           # Backend bounded contexts (domain areas)
 │  ├ 📂 scheduling-app     # Use cases, orchestration
 │  ├ 📂 scheduling-core    # Core domain without layers
 │  └ 📂 scheduling-infra   # Infrastructure wiring
 └ 📂 be-shared             # Backend cross-context utilities
    ├ 📂 ddd-lite           # DDD base constructs
    ├ 📂 infra-core         # Shared infrastructure
    ├ 📂 infra-db           # Database adapters, schema
    └ 📂 runtime-core       # Runtime interfaces
```

The directory structure uses `be-` prefixes for backend packages to prepare for future frontend packages with `fe-` prefixes. Package names remain clean (e.g., `@calcom-alt/ddd-lite`) while the directory organization provides clear separation.

### Dependency Rules

- Source code dependencies flow downward only
- Domain layer must remain pure (only depends on ddd-lite framework)
- No higher layers depending on lower ones

### Service Locator Pattern

Uses TypeScript interfaces for IoC instead of DI frameworks:

- No framework coupling or decorators
- Pure TypeScript interfaces
- Type-safe service location
- Simple runtime configuration

## Tech Stack Specifics

- **Package Manager**: pnpm (with workspaces)
- **Monorepo**: Nx
- **Web Framework**: Fastify (not NestJS)
- **ORM**: Drizzle (not Prisma)
- **Testing**: Vitest with workspace configuration
- **Commit Style**: Gitmoji (not conventional commits)

## Testing Strategy

| Level       | Location                       | What it covers |
| ----------- | ------------------------------ | -------------- |
| Unit        | `be-shared/*`                  | Pure logic     |
| Integration | `be-contexts/*-app`, `*-infra` | DB, ports      |
| E2E         | `apps/*`                       | Full user flow |

Test files use `.test.ts` extension and Vitest runs unit tests by default, e2e tests with `test:e2e` command.

### Testing Guidelines

- **Be Precise, yet Concise** - Apply the same principle to tests as code
- **Focus on behavior** - Test names should describe what the code does
- **Merge related tests** - Group error cases or similar scenarios when logical
- **Use meaningful types** - Object types for singleton tests, primitives when appropriate
- **One assertion per concept** - Keep tests focused but allow multiple related assertions

## Code Style Notes

- Uses `let` over `const` (except for true constants)
- Prefers `==` over `===` in TypeScript (with proper type narrowing)
- Kebab-case for file and folder names
- Named exports preferred over default exports (unless required by framework)
