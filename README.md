[![codecov](https://codecov.io/gh/evan-liu/cal.com.alt/graph/badge.svg?token=8V71PNA50B)](https://codecov.io/gh/evan-liu/cal.com.alt)

An alternative implementation of [cal.com](https://github.com/calcom/cal.com),
built with a different tech stack
using intentional alternatives to its key technologies.

## Tech stack

| cal.com                                                      | alt                             |     |
| ------------------------------------------------------------ | ------------------------------- | --- |
| [yarn](https://yarnpkg.com/)                                 | [pnpm](https://pnpm.io/)        |     |
| [Turborepo](https://turborepo.com/)                          | [nx](https://nx.dev/)           |     |
| [Conventional Commits](https://www.conventionalcommits.org/) | [Gitmoji](https://gitmoji.dev/) |     |
| ...(🚧 WIP)                                                  |                                 |     |

## Architecture

cal.com is a complex system
that can benefit from Domain-Driven Design and Clean Architecture.  
This project reimplements its architecture using a lightweight,
pragmatic form of DDD in TypeScript—"DDD-lite".

## Packages

| shared/       |                                                               |                                                                                                                                                                                                                               |
| ------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| domain-core   | Core types and interfaces for the DDD-lite domain layer       | [![codecov](https://codecov.io/gh/evan-liu/cal.com.alt/graph/badge.svg?token=8V71PNA50B&component=domain-core)](https://app.codecov.io/gh/evan-liu/cal.com.alt/tree/main/?displayType=list&components%5B0%5D=domain-core)     |
| domain-infra  | Infrastructure and support code for the DDD-lite domain layer | [![codecov](https://codecov.io/gh/evan-liu/cal.com.alt/graph/badge.svg?token=8V71PNA50B&component=domain-infra)](https://app.codecov.io/gh/evan-liu/cal.com.alt/tree/main/?displayType=list&components%5B0%5D=domain-infra)   |
| runtime-utils | Utilities for runtime use in TypeScript and Node.js           | [![codecov](https://codecov.io/gh/evan-liu/cal.com.alt/graph/badge.svg?token=8V71PNA50B&component=runtime-utils)](https://app.codecov.io/gh/evan-liu/cal.com.alt/tree/main/?displayType=list&components%5B0%5D=runtime-utils) |
