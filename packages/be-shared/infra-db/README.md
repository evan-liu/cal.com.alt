# infra-db

Shared schema and Drizzle ORM layer used across all contexts in `cal.com.alt`.

- Uses **Postgres** in production
- Uses **PGlite** for local development (file) and testing (in-memory)
- Repositories in infra layer to map domain entities to the existing `cal.com` tables.

---

## Context p

| Context                  | Type                | Entities / Domain Objects                                                                                    | Depends on / Publishes to                                                                                          |
| ------------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Identity & Access**    | Supporting          | User, Team, Organization, Membership, Auth Token, Profile                                                    | Referenced by every other context                                                                                  |
| **Scheduling**           | Core domain         | Schedule, Availability, EventType, Booking, Host                                                             | Depends on Identity & Calendar Integration<br>Publishes to Payments, Notifications, Automation, Billing, Analytics |
| **Calendar Integration** | Generic integration | Credential, DelegationCredential, DomainWideDelegation, DestinationCalendar, SelectedCalendar, CalendarCache | Called synchronously by Scheduling                                                                                 |
| **Payments**             | Generic integration | Payment                                                                                                      | Listens to Booking events from Scheduling                                                                          |
| **Automation**           | Supporting          | Workflow, WorkflowStep, Reminder, AIPhoneCallConfiguration                                                   | Subscribes to Scheduling & Notifications                                                                           |
| **Notifications**        | Generic             | Webhook, ReminderMail, WebhookScheduledTriggers                                                              | Listens to Scheduling & Automation                                                                                 |
| **Billing / Seats**      | Supporting          | Seat                                                                                                         | Consulted by Scheduling<br>May react to Payments                                                                   |
| **FeatureFlags**         | Supporting          | Feature, TeamFeatures, UserFeatures                                                                          | Consulted by Billing and Scheduling for entitlement & gradual rollout                                              |
| **Analytics**            | Reporting           | Tracking                                                                                                     | Event‑driven read‑models fed by Scheduling                                                                         |

<details>
<summary>Dependency graph</summary>

```mermaid
flowchart TD
  %% Identity
  subgraph Identity
    User
    Organization
    Team
    Membership
  end

  %% Scheduling
  subgraph Scheduling
    Schedule
    Availability
    EventType
    Booking
    Host
  end

  %% Calendar Integration
  subgraph CalendarIntegration
    Credential
    DelegationCredential
    DomainWideDelegation
    DestinationCalendar
    SelectedCalendar
    CalendarCache
  end

  %% Payments
  subgraph Payments
    Payment
  end

  %% Automation
  subgraph Automation
    Workflow
    WorkflowStep
    Reminder
  end

  %% Notifications
  subgraph Notifications
    Webhook
    ReminderMail
  end

  %% Billing
  subgraph Billing
    Seat
  end

  %% Feature Flags
  subgraph FeatureFlags
    Feature
  end

  %% Analytics
  subgraph Analytics
    Tracking
  end

  Organization --> Team
  Organization --> User
  Team --> Membership
  User --> Membership

  User --> Schedule
  Schedule --> Availability
  Schedule --> EventType
  EventType --> Booking
  EventType --> Host

  Booking --> Payment
  Booking --> DestinationCalendar
  Booking --> Workflow
  Booking --> Webhook
  Booking --> Seat
  Booking --> Tracking
  Booking --> Reminder

  Credential --> DestinationCalendar
  Credential --> SelectedCalendar
  Credential --> CalendarCache

  Workflow --> WorkflowStep
  Workflow --> Reminder
  Webhook --> ReminderMail

  Scheduling --> Features
  Billing --> Features
```

</details>

---

## Context-based schema breakdown

### Identity & Access (`identity-tables.ts`)

| Table                | PK · FK(s)                                                           | Enums / Types    |
| -------------------- | -------------------------------------------------------------------- | ---------------- |
| User                 | **id**<br>organizationId → Team.id                                   | IdentityProvider |
| Team                 | **id**<br>parentId → Team.id                                         | –                |
| Membership           | **id**<br>userId → User.id<br>teamId → Team.id                       | MembershipRole   |
| OrganizationSettings | **id**<br>organizationId → Team.id                                   | SMSLockState     |
| Profile              | **id**<br>userId → User.id<br>organizationId → Team.id               | –                |
| UserPassword         | **userId**<br>userId → User.id                                       | –                |
| Session              | **id**<br>userId → User.id                                           | –                |
| Account              | **id**<br>userId → User.id                                           | –                |
| Impersonations       | **id**<br>impersonatedUserId → User.id<br>impersonatedById → User.id | –                |
| ApiKey               | **id**<br>userId → User.id                                           | –                |
| AccessToken          | **id**<br>userId → User.id                                           | –                |
| RefreshToken         | **id**<br>userId → User.id                                           | –                |
| ResetPasswordRequest | **id**<br>userId → User.id                                           | –                |

### Scheduling (`scheduling-tables.ts`)

| Table                         | PK · FK(s)                                                                                                 | Enums / Types              |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------- |
| Schedule                      | **id**<br>userId → User.id                                                                                 | –                          |
| Availability                  | **id**<br>userId → User.id<br>eventTypeId → EventType.id<br>scheduleId → Schedule.id                       | –                          |
| EventType                     | **id**<br>userId → User.id<br>teamId → Team.id<br>scheduleId → Schedule.id                                 | SchedulingType, PeriodType |
| Host                          | **(userId,eventTypeId)**<br>userId → User.id<br>eventTypeId → EventType.id                                 | –                          |
| Booking                       | **id**<br>userId → User.id<br>eventTypeId → EventType.id<br>destinationCalendarId → DestinationCalendar.id | BookingStatus              |
| BookingReference              | **id**<br>bookingId → Booking.id                                                                           | –                          |
| Attendee                      | **id**<br>bookingId → Booking.id                                                                           | –                          |
| BookingSeat                   | **id**<br>bookingId → Booking.id<br>attendeeId → Attendee.id                                               | –                          |
| EventTypeCustomInput          | **id**<br>eventTypeId → EventType.id                                                                       | EventTypeCustomInputType   |
| ReminderMail                  | **id**<br>referenceId → Booking.id                                                                         | ReminderType               |
| HashedLink                    | **id**<br>eventTypeId → EventType.id                                                                       | –                          |
| SelectedSlots                 | **id**<br>userId → User.id                                                                                 | –                          |
| BookingInternalNote           | **id**<br>bookingId → Booking.id                                                                           | –                          |
| OutOfOfficeEntry              | **id**<br>userId → User.id                                                                                 | –                          |
| OutOfOfficeReason             | **id**<br>userId → User.id                                                                                 | –                          |
| BookingTimeStatus             | **id**<br>bookingId → Booking.id                                                                           | –                          |
| BookingDenormalized           | **id**                                                                                                     | –                          |
| BookingTimeStatusDenormalized | **id**                                                                                                     | –                          |

### Calendar Integration (`calendar-integration-tables.ts`)

| Table                | PK · FK(s)                                                                               | Enums / Types |
| -------------------- | ---------------------------------------------------------------------------------------- | ------------- |
| Credential           | **id**<br>userId → User.id<br>teamId → Team.id                                           | –             |
| DelegationCredential | **id**<br>userId → User.id<br>organizationId → Team.id                                   | –             |
| DomainWideDelegation | **id**<br>organizationId → Team.id                                                       | –             |
| DestinationCalendar  | **id**<br>userId → User.id<br>eventTypeId → EventType.id<br>credentialId → Credential.id | –             |
| SelectedCalendar     | **id**<br>userId → User.id<br>credentialId → Credential.id<br>eventTypeId → EventType.id | –             |
| CalendarCache        | **(credentialId,key)**<br>credentialId → Credential.id                                   | –             |

### Payments

| Table   | PK · FK(s)                       | Enums / Types |
| ------- | -------------------------------- | ------------- |
| Payment | **id**<br>bookingId → Booking.id | PaymentOption |

### Automation

| Table                    | PK · FK(s)                                                             | Enums / Types                                       |
| ------------------------ | ---------------------------------------------------------------------- | --------------------------------------------------- |
| Workflow                 | **id**<br>userId → User.id<br>teamId → Team.id                         | WorkflowTriggerEvents                               |
| WorkflowStep             | **id**<br>workflowId → Workflow.id                                     | WorkflowActions, WorkflowTemplates, WorkflowMethods |
| WorkflowsOnEventTypes    | **id**<br>workflowId → Workflow.id<br>eventTypeId → EventType.id       | –                                                   |
| WorkflowsOnTeams         | **id**<br>workflowId → Workflow.id<br>teamId → Team.id                 | –                                                   |
| WorkflowReminder         | **id**<br>bookingUid → Booking.uid<br>workflowStepId → WorkflowStep.id | TimeUnit                                            |
| AIPhoneCallConfiguration | **id**<br>eventTypeId → EventType.id                                   | –                                                   |

### Notifications

| Table                    | PK · FK(s)                                                                   | Enums / Types        |
| ------------------------ | ---------------------------------------------------------------------------- | -------------------- |
| Webhook                  | **id**<br>userId → User.id<br>teamId → Team.id<br>eventTypeId → EventType.id | WebhookTriggerEvents |
| WebhookScheduledTriggers | **id**<br>webhookId → Webhook.id<br>bookingId → Booking.id                   | –                    |
| ReminderMail             | **id**<br>referenceId → Booking.id                                           | ReminderType         |

### Billing / Seats

| Table | PK · FK(s)                                    | Enums / Types |
| ----- | --------------------------------------------- | ------------- |
| Seat  | **id**<br>orgId → Team.id<br>userId → User.id | –             |

### Feature (`feature-tables.ts`)

| Table        | PK · FK(s)                                 | Enums / Types |
| ------------ | ------------------------------------------ | ------------- |
| Feature      | **slug**                                   | FeatureType   |
| UserFeatures | **(userId,featureId)**<br>userId → User.id | –             |
| TeamFeatures | **(teamId,featureId)**<br>teamId → Team.id | –             |

### Analytics

| Table    | PK · FK(s)                       | Enums / Types |
| -------- | -------------------------------- | ------------- |
| Tracking | **id**<br>bookingId → Booking.id | –             |

<details>
<summary>Entity–relationship diagram</summary>

```mermaid
erDiagram
    User ||--o{ Membership : has
    Team ||--o{ Membership : has
    Team ||--o{ EventType : offers
    Team ||--o{ Credential : owns
    User ||--o{ Schedule : owns
    User ||--o{ EventType : creates
    User ||--o{ Credential : owns
    Schedule ||--o{ Availability : has
    Schedule ||--o{ EventType : appliesTo
    EventType ||--o{ Host : has
    EventType ||--o{ Booking : produces
    EventType ||--|| DestinationCalendar : "uses 1-1"
    Booking ||--|{ BookingReference : references
    Booking ||--o{ Attendee : includes
    Booking ||--o{ BookingSeat : assigns
    Booking ||--o{ Payment : charges
    Booking ||--o{ ReminderMail : triggers
    Booking ||--o{ WorkflowReminder : triggers
    Booking ||--o{ WebhookScheduledTriggers : triggers
    Credential ||--o{ DestinationCalendar : targets
    Credential ||--o{ SelectedCalendar : targets
    Credential ||--o{ CalendarCache : caches
    Workflow ||--o{ WorkflowStep : has
    Workflow ||--o{ WorkflowsOnEventTypes : forEvents
    Workflow ||--o{ WorkflowsOnTeams : forTeams
    User ||--o{ Workflow : owns
    Team ||--o{ Workflow : owns
    Webhook ||--o{ WebhookScheduledTriggers : schedules
    Feature ||--o{ UserFeatures : grants
    Feature ||--o{ TeamFeatures : grants
    User ||--o{ Webhook : owns
    Team ||--o{ Webhook : owns
    Booking ||--|| Tracking : has
    Booking ||--o{ Seat : uses
    EventType ||--o{ EventTypeCustomInput : has
    Booking ||--o{ BookingInternalNote : notes
    Booking ||--|| BookingTimeStatus : status
    Booking ||--|| BookingDenormalized : mirror
```

</details>
