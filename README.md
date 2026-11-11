# Assent Identity Circle

# Build: HM Land Registry — Assent Multi-Party Identity Verification Prototype

## Your role

You are a senior UK government service designer, user researcher, frontend engineer and technical architect.

Build a working, interactive service prototype for HM Land Registry (HMLR), exploring how multiple people involved in an Assent property transaction could prove their identity using GOV.UK One Login.

This is an experiment prototype for user research, not a live government service.

Apply the GOV.UK Service Standard, GOV.UK Design System and GOV.UK Frontend throughout.

The experience must look and behave like a credible GOV.UK transactional service. Avoid the appearance of a commercial SaaS product.

**Build the working prototype, not a design specification or static mock-up.**

## 1. Context and problem

An Assent is the process by which the personal representatives of someone who has died transfer registered property to a beneficiary.

The current process involves paper forms, including AS1 and AP1 as applicable, and identity evidence where required.

Identity verification may involve several individuals, including:

- Executors — personal representatives named in a will
- Administrators — personal representatives appointed when there is no valid will
- Beneficiaries — people receiving the property, referred to as transferees in the form
- Attorneys — individuals legally authorised to act for other parties
- Applicants or people lodging the application, where different from the above

Not every person associated with an estate necessarily needs to prove their identity. The prototype must distinguish between being named in the transaction and requiring verification.

The hypothesis is that GOV.UK One Login could provide an accessible alternative to existing identity verification arrangements, including where multiple individuals need to verify their identities independently.

The experiment will help determine:

1. Whether citizens choose GOV.UK One Login when offered an alternative.
2. Whether multiple people can complete independent identity checks associated with one transaction.
3. Whether citizens understand who needs to verify their identity and how.
4. Whether the coordinating citizen can successfully manage other people's participation.
5. Where people encounter difficulties, abandon the process or require support.
6. Whether identity verification provides sufficient assurance, or additional checks are needed.

The prototype should support testing these questions.

## 2. Primary design concept

**One application. Multiple people. Individual identity checks. Shared progress.**

Create a simple digital experience that allows someone intending to complete an Assent application to set up an identity verification record for that transaction.

This happens before the paper Assent application is completed or submitted.

The citizen should be able to:

- Establish who is involved in the transaction.
- Identify their roles.
- Indicate which individuals need to complete identity checks, subject to service rules.
- Choose how each person will verify their identity.
- Invite other people to verify independently.
- Track each person's progress.
- Understand what remains outstanding.
- Receive confirmation when identity checks have been completed.
- Understand how the completed checks relate to the existing Assent application.

The service should clearly explain that completing identity verification does not itself submit or approve a property transfer.

**Crucially, the coordinator must not be able to verify another person's identity on their behalf.**

## 3. Build using GOV.UK Frontend

Use the official GOV.UK Frontend package and its styles, typography, spacing, interaction and accessibility conventions.

Reference:

https://design-system.service.gov.uk/

https://frontend.design-system.service.gov.uk/

https://design-system.service.gov.uk/components/

Use official components wherever possible:

- GOV.UK header and footer
- Service navigation where appropriate
- Phase banner
- Back link
- Buttons and secondary buttons
- Text inputs
- Fieldsets
- Radios
- Checkboxes
- Details
- Inset text
- Warning text
- Notification banners
- Error summaries
- Summary lists and summary cards
- Tables
- Status tags
- Confirmation panels

Use the GOV.UK typography and colour system, with accessible contrast.

Prefer official GOV.UK Frontend markup and behaviour over approximating the components using custom styles.

If the project uses React, integrate GOV.UK Frontend styling and accessible component structure while keeping navigation and state managed in React.

### Design constraints

- No sidebar dashboard.
- No gradients or oversized rounded cards.
- No decorative icons.
- No artificial progress charts.
- No unnecessary navigation.
- No marketing-style landing page.
- Do not overuse status colours.
- Use standard page widths, clear labels and generous GOV.UK spacing.
- Prioritise readability, simplicity and confidence.

Use UK English and plain language.

The service header should identify HM Land Registry and the service as:

**Check identities for an Assent application**

Display a beta phase banner.

Make it clear in the prototype that this is a research service and uses simulated identity checks.

## 4. Information architecture and screens

Build the following screens as a functioning journey.

### Screen 1 — Start page

Title:

**Check identities for an Assent application**

Introductory content:

"If you're transferring a property after someone has died, you may need to prove the identity of the people involved.

This service lets you invite people to prove their identity using GOV.UK One Login and check when their identity checks are complete."

Explain:

- Who the service is for.
- What information is needed before starting.
- That other people may be invited.
- That each person completes their own identity check.
- That existing paper application requirements remain.
- That an alternative identity verification route is available.

Primary action:

**Start now**

Secondary link:

**Find out about other ways to prove your identity**

Do not force a genuine One Login authentication at this point. The prototype uses simulated identity verification.

### Screen 2 — About the transaction

Title:

**About the property transfer**

Ask for only the information needed to establish a meaningful prototype record.

Fields:

- Property address, with separate address lines and postcode
- Title number, optional
- Name of the deceased property owner
- Your role in the transfer

For role, use:

- Executor
- Administrator
- Beneficiary
- Attorney
- Other

Show explanatory help for unfamiliar terms.

Avoid asking for unnecessary sensitive probate information.

On Continue:

- Create a unique mock Assent identity-check reference.
- Save the record in prototype state.
- Take the user to the people-management screen.

### Screen 3 — People involved

This is the most important screen in the entire prototype.

Title:

**People involved in this property transfer**

Supporting text:

"Add the people involved in the transfer. You can then invite anyone who needs to prove their identity.

Each person will complete their own identity check."

The page should have two states.

**Empty state**

When no people have been added, show straightforward instructions and a prominent:

**Add a person**

**Populated state**

Once people are present, show a list of individuals and their verification progress.

Display the following information where available:

| Field | Purpose |
|---|---|
| Name | Person involved in the transaction |
| Role | Executor, administrator, beneficiary, attorney or other |
| Verification route | GOV.UK One Login or existing route |
| Identity checked | Date of successful verification, if applicable |
| Identity evidence | Document type if available and appropriate, otherwise "Not provided" |
| Status | Human-readable progress or outcome |
| Actions | View, change details, send invitation, resend invitation |

Prefer a responsive GOV.UK table on larger screens. Use GOV.UK summary cards on smaller screens if this is more understandable and accessible.

Status values should include:

- Not started — neutral grey
- Invitation sent — blue
- In progress — blue
- Verified — green
- Needs attention — yellow
- Unable to verify — red
- Using another route — neutral

Use official GOV.UK status tag styling.

Never rely on colour alone.

Show a short progress statement above the list, such as:

"1 of 3 people have completed their identity checks."

Do not use a colourful graphical progress bar unless research demonstrates a clear need.

Provide:

**Add another person**

And a link to:

**Review identity checks**

Each listed person should have a working details screen.

### Screen 4 — Add a person

Title:

**Add a person involved in the transfer**

Fields:

- First name
- Last name
- Their role in the transaction
- Email address
- Confirm email address, if the design requires it

Use role options:

- Executor
- Administrator
- Beneficiary
- Attorney
- Person submitting the application
- Other

Allow a person to have more than one role where relevant, without creating duplicate identity-check records.

For example, one individual may be both an executor and beneficiary.

Ask:

**Will this person need to prove their identity?**

For research purposes, allow the user to indicate:

- Yes
- No
- Not sure

Explain that HM Land Registry requirements determine whether a check is necessary and the prototype does not automatically make a legal determination.

Ask:

**How will this person prove their identity?**

Options:

- GOV.UK One Login
- Existing identity verification process
- Not decided yet

Support inviting another person by email, using simulated invitations.

For the current user, provide the option:

**This is me**

Validation:

- Required fields
- Valid email format
- Clearly described duplicate-person warning
- Accessible GOV.UK error summary
- Preserve previously entered information after errors

On save, return to the people list.

### Screen 5 — Person details

Title:

**Identity check for [person's name]**

Show:

- Name
- Role or roles
- Verification required
- Verification route
- Email
- Invitation status
- Verification status
- Verified date, if completed
- Document type, only when explicitly available
- Assurance assessment, if available and appropriate for the prototype

Actions:

- Send invitation
- Resend invitation
- Change email
- Change role
- Change verification route
- Remove person
- View identity-check outcome

Do not allow a completed identity check to be silently reassigned to a different person following a name or email change.

If identity has already been verified, explain that changing material identity details may require a new check.

### Screen 6 — Invitation preview

The coordinator can select:

**Send identity-check invitation**

Show a confirmation screen identifying the intended recipient.

Example:

"You're about to invite James Mitchell to prove their identity for this property transfer."

Show the email address.

Clicking Send:

- Generates a simulated unique invitation token.
- Changes the person's status to Invitation sent.
- Stores the invitation date and time.
- Displays a GOV.UK notification banner.
- Makes an invitation preview available.

The invitation should contain:

- HM Land Registry service name
- A clear explanation of why the person has been invited
- The relevant property transfer reference
- Information about the person who invited them
- A secure-link-style action to begin verification
- Guidance on what they should do if they do not recognise the invitation
- A clear statement that no payment or property transfer is being authorised

In the prototype, make the invitation link open a real internal route so a researcher can demonstrate the recipient experience.

Never send actual emails unless a separate integration is explicitly configured.

### Screen 7 — Invited person's journey

This should behave as a separate journey.

Title:

**You've been invited to prove your identity**

Explain:

"Someone has added you as a person involved in a property transfer.

You need to prove your identity before the identity-check stage can be completed."

Show:

- The property transfer reference
- Who invited them
- Their recorded role
- An explanation of the check
- How their information will be used

Do not reveal unnecessary information about other participants or the deceased.

Primary action:

**Continue to GOV.UK One Login**

The simulated journey should be structured like a genuine One Login handoff, but clearly labelled as a simulation.

Provide an accessible mock screen explaining that GOV.UK One Login would normally authenticate the user and, when required, verify their identity.

Give the researcher controls to simulate:

1. Identity verification successful.
2. Verification attempted but not completed.
3. Verification unsuccessful.
4. User decides not to continue.
5. Additional verification needed.

Successful verification should return the participant to an individual confirmation screen.

Do not allow an invited participant to see the coordinator's full application or another participant's identity evidence.

### Screen 8 — Verification outcome

Title:

**Your identity check is complete**

For a successful scenario:

- Explain that the identity check was completed.
- State the date.
- State the verification route.
- Explain that the result has been associated with the relevant Assent identity-check record.
- Confirm there is no need to prove another participant's identity.

Example:

"You've completed your identity check.

The person managing this property transfer can now see that your identity check is complete."

Do not imply that the legal identity-evidence requirements have been satisfied unless that has been separately determined.

For failure scenarios, provide clear next steps.

### Screen 9 — Coordinator progress and review

Return to the main people list when appropriate.

Display all participants' current states.

Example:

"2 of 3 required identity checks are complete."

Include clear actions for outstanding checks.

When every required participant has completed the relevant verification step, show:

**All requested identity checks are complete**

Explain that the results must still be considered against HM Land Registry's identity-evidence and assurance requirements.

Do not imply that all checks are legally sufficient just because all participants have completed One Login.

Provide a working action:

**View identity-check summary**

### Screen 10 — Identity-check summary

Build a clear printable summary containing:

- Assent identity-check reference
- Property reference or address
- Each person's name and role
- Verification route
- Verification status
- Date completed
- Whether additional checks are needed
- An explanation of next steps

Provide:

**Print this summary**

And:

**Return to people involved**

The summary should clearly say:

"This is a prototype identity-check summary. It is not proof of ownership, a completed Assent application or an official HM Land Registry identity certificate."

Do not invent an official document format or certificate.

## 5. Data model

Create a clean data model that separates the transaction, participants, invitations and verification outcomes.

AssentIdentityCase:

- id
- reference
- propertyAddress
- titleNumber
- deceasedOwnerName
- coordinatorParticipantId
- createdAt
- updatedAt
- status

Participant:

- id
- caseId
- firstName
- lastName
- email
- roles[]
- isCoordinator
- identityCheckRequired
- verificationRoute
- verificationStatus
- verificationOutcome
- verifiedAt
- evidenceDocumentType
- assuranceOutcome
- additionalChecksRequired
- createdAt
- updatedAt

Invitation:

- id
- caseId
- participantId
- token
- status
- sentAt
- openedAt
- completedAt

IdentityCheck:

- id
- participantId
- provider
- providerSubjectReference
- requestedConfidenceLevel
- returnedConfidenceLevel
- outcome
- checkedAt
- evidenceCategory
- requiresManualReview

ActivityEvent:

- id
- caseId
- participantId
- eventType
- timestamp
- metadata

Use generated fictional data only.

For the prototype, implement local state and local storage persistence so researchers can reload the prototype without losing their current scenario.

Keep the data model and verification provider logic separated so a genuine service integration could be introduced later.

## 6. Mock One Login integration

Do not attempt to implement genuine GOV.UK One Login identity verification.

Instead, create an IdentityVerificationProvider abstraction with a MockOneLoginProvider implementation.

The mock provider should simulate:

- Authentication
- Identity verification
- Success and failure callbacks
- Identity confidence results
- Optional evidence attributes
- Unavailable or incomplete identity claims

In a future implementation, this could be replaced with a genuine One Login integration.

Design for the fact that One Login authenticates each individual and returns identity claims to the requesting service.

Never imply that one person's One Login account can authenticate multiple identities.

Do not store photographs, scanned identity documents, JWTs or real identity tokens.

Do not assume that successful authentication means identity verification has succeeded.

Do not assume that identity verification success automatically means HM Land Registry's requirements have been met.

The document type field is optional and may show:

- Passport
- Driving licence
- Other supported evidence
- Not provided

Only display a document type when it is part of the simulated result.

Avoid using document numbers in the coordinator's interface.

## 7. Prototype research controls

This is an experiment, so include a researcher mode.

Access through a clearly labelled prototype-only research link, separated from the citizen experience.

The research controls must make it easy to reset the prototype and demonstrate realistic scenarios.

Create these scenarios:

**Scenario A — Single participant**

One executor who is also the beneficiary. The participant completes identity verification successfully.

**Scenario B — Multiple parties**

Two executors and one beneficiary.

One participant is verified, one has been invited but has not responded, and one has not yet started.

**Scenario C — Mixed verification routes**

Three participants.

One uses One Login successfully, one uses the existing verification route, and one requires additional checks.

**Scenario D — Verification difficulty**

An invited person starts One Login but cannot complete the identity verification process.

Allow the user to choose an alternative route.

**Scenario E — Duplicate roles**

A person is both executor and beneficiary. They should appear as one individual with multiple roles, not as two separate identities.

**Scenario F — Assurance exception**

Every required participant has completed identity verification, but the mock result indicates that additional assurance is needed for one person.

Demonstrate that completing the online check and satisfying the application's evidence requirements are separate outcomes.

The researcher should be able to reset any scenario without touching source code.

## 8. Capture useful research events

Implement lightweight client-side event recording for research.

Capture:

- Start page viewed
- Service started
- Transaction details submitted
- Person added
- Person edited
- Verification route chosen
- Invitation sent
- Invitation opened
- Invitation resent
- Identity verification started
- Identity verification completed
- Identity verification failed
- Alternative route selected
- User returned to coordinator view
- Summary viewed

Also record useful metadata:

- Scenario identifier
- Participant count
- Selected role types
- Verification route
- Time between invitation and completion
- Last reached stage
- Mock verification outcome

Make event records accessible through the researcher interface.

Allow export as JSON or CSV using generated prototype data.

Do not silently collect real personal or identity information.

Use these events to help researchers analyse how people navigate the experience, not to claim real-world experiment success.

## 9. Additional research considerations

Build the prototype to explore several uncertainties.

### Who coordinates the transaction?

Can one executor take responsibility for adding all parties?

Does a beneficiary understand their role when invited?

Can one person hold more than one role?

### How are invitations understood?

Does the invited person understand why they have received an invitation?

Do they trust it?

What information is necessary to establish legitimacy without exposing unnecessary case details?

### Is a shared status view useful?

Can the coordinator understand who is complete, outstanding or requires help?

Does the coordinator incorrectly interpret "Verified" as meaning the overall Assent application has been approved?

### Are alternative routes understood?

Can participants choose an existing verification route without feeling they have failed?

Can the coordinator distinguish between a pending One Login check and a person verifying using another method?

### When should the coordinating person's verification happen?

The experiment describes an identity-first journey before the coordinator adds other people.

The proposed concept places the participant collection step before verification.

Implement a researcher-controlled option for both:

- **Journey A — Add people first:** the coordinating person adds participants, then completes their own identity verification.
- **Journey B — Verify first:** the coordinating person completes their simulated identity verification before adding other participants.

Use Journey A as the default.

This lets researchers test the difference without maintaining two separate prototypes.

## 10. Accessibility and usability

Follow GOV.UK Design System accessibility patterns and WCAG 2.2 AA.

Ensure:

- Keyboard navigation throughout
- Semantic form controls
- Proper labels and fieldsets
- Accessible validation errors
- Correct focus handling
- Screen-reader announcements for state changes
- Clear text for statuses
- Responsive mobile layouts
- No colour-only communication
- No inaccessible modal-only journeys
- No unnecessary time limits

Use GOV.UK plain-language conventions.

Avoid technical terms such as OIDC, claims, confidence levels or identity tokens in citizen-facing pages.

Use explanatory help where necessary.

## 11. Technical implementation

Use the existing prototype development environment.

Prefer:

- React
- TypeScript
- GOV.UK Frontend
- React Router or equivalent routing
- Simple typed state management
- Local persistence for prototype scenarios
- Modular, reusable components

Separate:

- Page components
- Form components
- Case and participant models
- Mock identity provider
- Invitation service
- Research event recording
- Scenario configuration

Make all buttons, links, validation, invitations, status changes and navigation functional.

Do not add a database, production identity integration, email service or backend infrastructure unless necessary for the prototype.

Do not use actual GOV.UK One Login credentials or production authentication endpoints.

Ensure the service can run as a standalone prototype and be deployed to a preview URL.

## 12. Acceptance criteria

The prototype is complete when a researcher can:

1. Open a credible GOV.UK-style Assent identity-check service.
2. Start an identity-check record.
3. Add multiple people with different transaction roles.
4. Identify a person with more than one role.
5. Select verification routes for each person.
6. Send simulated invitations.
7. Open an invitation as a separate participant.
8. Complete a mock One Login verification.
9. Return to the coordinator view and see the new status.
10. Simulate an unsuccessful or incomplete verification.
11. Change someone to an alternative verification route.
12. Review the identity-check status of every participant.
13. View and print a summary.
14. Reset or switch research scenarios.
15. Inspect and export research events.

The prototype must work on mobile and desktop.

## 13. Delivery priorities

Build in this order:

**Priority 1 — The working multi-party journey**

- Start page
- Transaction setup
- Add people
- People list and statuses
- Invitation flow
- Mock identity verification
- Return and update status

**Priority 2 — Experiment depth**

- Alternative verification routes
- Multiple roles
- Verification exceptions
- Identity-check summaries
- Research scenarios

**Priority 3 — Research instrumentation**

- Event recording
- Scenario reset
- Research event export
- Journey A/B configuration

Do not spend time creating an elaborate administration dashboard.

The value is in the citizen-facing transaction and the ability to test it.

## 14. Final direction

This prototype is about answering an important question:

**Can one person coordinate a property Assent application while multiple people independently prove their identities through GOV.UK One Login?**

Build the smallest coherent service experience that allows real users to demonstrate whether this works.

It should feel like something HM Land Registry could genuinely test with citizens.

Start by implementing the complete working journey. Use realistic fictional data, familiar GOV.UK patterns and minimal complexity.

Do not stop after building the first screen.

Every important interaction must work.

**Live prototype**: https://digipete.github.io/assent-identity-circle/

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
