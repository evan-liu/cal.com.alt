# cal.com.alt

An alternative implementation of [cal.com](https://github.com/calcom/cal.com)

Alternative tech stack.  
Alternative architecture.

🚧 Work in progress

## Why this project

1. **Tech comparison** – Explore and compare modern tooling in a real-world app.
2. **Idea sandbox** – Explore architecture and design patterns in a complex business domain.

## Tech Stack

| cal.com                                                      | .alt                                 | Description                  |
| ------------------------------------------------------------ | ------------------------------------ | ---------------------------- |
| [yarn](https://yarnpkg.com/)                                 | [pnpm](https://pnpm.io/)             | Package manager (workspaces) |
| [Turborepo](https://turborepo.com/)                          | [nx](https://nx.dev/)                | Monorepo tooling             |
| [Conventional Commits](https://www.conventionalcommits.org/) | [Gitmoji](https://gitmoji.dev/)      | Commit formatting            |
| [NestJs](https://nestjs.com/)                                | [Fastify](https://fastify.dev/)      | Web framework (API)          |
| [Prisma](https://www.prisma.io/)                             | [Drizzle](https://orm.drizzle.team/) | Type-safe ORM                |
| Dependency Injection                                         | Service Locator                      | IoC pattern                  |

## Architecture

`cal.com.alt` reimagines cal.com's design using a pragmatic form of Domain-Driven Design and Clean Architecture in TypeScript—_DDD-lite_.

Structured but flexible. Minimal overhead.

## Workspace Structure

```txt
cal.com.alt/
├─ apps/
│  ├─ web/
│  └─ api/
└─ packages/
   ├─ contexts/              # Bounded contexts
   │  ├─ <context>-ui/       # Context-specific UI
   │  ├─ <context>-app/      # Use cases, orchestration
   │  ├─ <context>-infra/    # Infra wiring: DBs, APIs
   │  └─ <context>-domain/   # Domain logic (pure)
   └─ shared/                # Cross-context utilities
      ├─ infra-core/         # Shared infrastructure implementations used across app/infra layers
      ├─ ddd-lite/           # DDD-lite base constructs: events, decorators, service locator
      └─ runtime-core/       # Core runtime interfaces and service locator
```

_(Dependency rule:
source code dependencies must point downward —
lower layers must never depend on higher ones.)_

## Testing

Follows Clean Architecture principles:

- **Unit** – pure logic (`*-domain`)
- **Integration** – orchestration, infra wiring (`*-app`, `*-infra`)
- **E2E** – user flows (`apps/*`)

```txt
apps/*                    → E2E tests
contexts/<context>-domain → Unit tests
contexts/<context>-app    → Integration tests
contexts/<context>-infra  → Integration tests
shared/*                  → Unit tests (pure logic, utils)
```

**Coverage:**

[![codecov](https://codecov.io/gh/evan-liu/cal.com.alt/graph/badge.svg?token=8V71PNA50B)](https://codecov.io/gh/evan-liu/cal.com.alt)

- [`shared/ddd-lite`](https://app.codecov.io/gh/evan-liu/cal.com.alt/tree/main/?displayType=list&components%5B0%5D=ddd-lite) ![codecov](https://codecov.io/gh/evan-liu/cal.com.alt/graph/badge.svg?token=8V71PNA50B&component=ddd-lite)
- [`shared/infra-core`](https://app.codecov.io/gh/evan-liu/cal.com.alt/tree/main/?displayType=list&components%5B0%5D=infra-core) ![codecov](https://codecov.io/gh/evan-liu/cal.com.alt/graph/badge.svg?token=8V71PNA50B&component=infra-core)
- [`shared/runtime-core`](https://app.codecov.io/gh/evan-liu/cal.com.alt/tree/main/?displayType=list&components%5B0%5D=runtime-core) ![codecov](https://codecov.io/gh/evan-liu/cal.com.alt/graph/badge.svg?token=8V71PNA50B&component=runtime-core)

## Service Locator

> Inversion of control is a common feature of frameworks,
> but it's something that comes at a price.
> It tends to be hard to understand
> and leads to problems when you are trying to debug.
> So on the whole I prefer to avoid it unless I need it.
> This isn't to say it's a bad thing,
> just that I think
> it needs to justify itself over the more straightforward alternative.
>
> -- Martin Fowler [Service Locator vs Dependency Injection](https://martinfowler.com/articles/injection.html#ServiceLocatorVsDependencyInjection)

While Dependency Injection is a common IoC pattern,
Many TypeScript DI frameworks introduce tight coupling through decorators,
metadata, or framework-specific setup —
which can defeat the purpose of IoC.

`cal.com.alt` takes a pragmatic approach using TypeScript interfaces for service location:

- No framework coupling
- Pure TypeScript interfaces and types
- Simple runtime configuration
- Type-safe without string lookups

Example:

```ts
// Service interface to depend on
interface Logger {}

// Service locator
let runtimeServices = {} as { logger: Logger }

// Configure the service locators at application bootstrap
registerServices(runtimeServices, { logger: new ConsoleLogger() })
```

This setup aims for simplicity and decoupling, avoiding DI complexity.

## Coding Style

- [`const` vs `let`](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/apA.md#const-antly-confused)
- [`===` vs `==`](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/types-grammar/ch4.md#type-aware-equality)
