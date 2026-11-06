import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Checkboxes, Details, ErrorSummary, errorFor, Radios, TextInput, WarningText, type FieldError } from "@/components/govuk";
import type { PersonInput } from "@/domain/actions";
import { findDuplicate, fullName, isValidEmail, ROLE_LABELS } from "@/domain/logic";
import type { Participant, Role } from "@/domain/types";

interface Props {
  participants: Participant[];
  existing?: Participant;
  coordinatorTaken: boolean;
  submitLabel: string;
  onSubmit: (input: PersonInput) => void;
}

const ROLE_HINTS: Partial<Record<Role, string>> = {
  executor: "Named in the will to deal with the estate",
  administrator: "Appointed to deal with the estate when there is no valid will",
  beneficiary: "Receiving the property. The form calls this person the transferee",
  attorney: "Legally authorised to act for someone else involved",
};

export function PersonForm({ participants, existing, coordinatorTaken, submitLabel, onSubmit }: Props) {
  const [f, setF] = useState({
    firstName: existing?.firstName ?? "",
    lastName: existing?.lastName ?? "",
    email: existing?.email ?? "",
    confirmEmail: existing?.email ?? "",
    roles: (existing?.roles ?? []) as string[],
    isMe: existing ? (existing.isCoordinator ? "yes" : "no") : "",
    required: existing?.identityCheckRequired ?? "",
    route: existing?.verificationRoute ?? "",
  });
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [duplicate, setDuplicate] = useState<Participant | null>(null);
  const set = <K extends keyof typeof f>(k: K) => (v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  const verified = existing?.verificationStatus === "verified";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: FieldError[] = [];
    if (!f.firstName.trim()) errs.push({ field: "firstName", message: "Enter their first name" });
    if (!f.lastName.trim()) errs.push({ field: "lastName", message: "Enter their last name" });
    if (!f.roles.length) errs.push({ field: "roles", message: "Select at least one role in the transaction" });
    if (!f.isMe) errs.push({ field: "isMe", message: "Select yes if this person is you" });
    if (!f.email.trim()) errs.push({ field: "email", message: "Enter their email address" });
    else if (!isValidEmail(f.email)) errs.push({ field: "email", message: "Enter an email address in the correct format, like name@example.com" });
    else if (f.confirmEmail.trim().toLowerCase() !== f.email.trim().toLowerCase())
      errs.push({ field: "confirmEmail", message: "Email addresses do not match" });
    if (!f.required) errs.push({ field: "required", message: "Select whether this person will need to prove their identity" });
    if (f.required !== "no" && !f.route) errs.push({ field: "route", message: "Select how this person will prove their identity" });
    const dup = f.firstName.trim() && f.lastName.trim() ? findDuplicate(participants, f, existing?.id) : undefined;
    if (dup) errs.push({ field: "firstName", message: `${fullName(dup)} is already in this transfer. If they have more than one role, change their roles instead of adding them again` });
    setDuplicate(dup ?? null);
    setErrors(errs);
    if (errs.length) return;
    onSubmit({
      firstName: f.firstName.trim(),
      lastName: f.lastName.trim(),
      email: f.email.trim(),
      roles: f.roles as Role[],
      isCoordinator: f.isMe === "yes",
      identityCheckRequired: f.required as PersonInput["identityCheckRequired"],
      verificationRoute: (f.required === "no" ? "undecided" : f.route) as PersonInput["verificationRoute"],
    });
  }

  return (
    <form onSubmit={submit} noValidate>
      <ErrorSummary errors={errors} />
      {duplicate && (
        <div className="govuk-inset-text">
          <Link to="/people/$id/edit" params={{ id: duplicate.id }} className="govuk-link">
            Change roles for {fullName(duplicate)}
          </Link>
        </div>
      )}
      {verified && (
        <WarningText>
          {fullName(existing!)} has already proved their identity. If you change their name or email address, they will
          need to complete a new identity check.
        </WarningText>
      )}

      <TextInput id="firstName" label="First name" value={f.firstName} onChange={set("firstName")} error={errorFor(errors, "firstName")} autoComplete="off" />
      <TextInput id="lastName" label="Last name" value={f.lastName} onChange={set("lastName")} error={errorFor(errors, "lastName")} autoComplete="off" />

      <Checkboxes
        name="roles"
        legend="What is their role in the transaction?"
        hint="Select all that apply. One person can have more than one role."
        values={f.roles}
        onChange={set("roles")}
        error={errorFor(errors, "roles")}
        options={(Object.keys(ROLE_LABELS) as Role[]).map((r) => ({ value: r, label: ROLE_LABELS[r], hint: ROLE_HINTS[r] }))}
      />

      <Radios
        name="isMe"
        legend="Is this person you?"
        inline
        value={f.isMe}
        onChange={set("isMe")}
        error={errorFor(errors, "isMe")}
        hint={coordinatorTaken && !existing?.isCoordinator ? "You have already added yourself. Selecting yes will replace that." : undefined}
        options={[
          { value: "yes", label: "Yes, this is me" },
          { value: "no", label: "No" },
        ]}
      />

      <TextInput id="email" type="email" label="Email address" hint="We'll send the identity-check invitation to this address" value={f.email} onChange={set("email")} error={errorFor(errors, "email")} autoComplete="off" spellCheck={false} />
      <TextInput id="confirmEmail" type="email" label="Confirm email address" value={f.confirmEmail} onChange={set("confirmEmail")} error={errorFor(errors, "confirmEmail")} autoComplete="off" spellCheck={false} />

      <Radios
        name="required"
        legend="Will this person need to prove their identity?"
        hint="HM Land Registry's requirements decide whether a check is needed. This service does not make that decision for you."
        value={f.required}
        onChange={set("required")}
        error={errorFor(errors, "required")}
        options={[
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
          { value: "not_sure", label: "Not sure", hint: "We'll treat them as needing a check until you know" },
        ]}
      />
      <Details summary="Who usually needs to prove their identity">
        <p className="govuk-body">
          Usually the personal representatives signing the Assent and the people receiving the property. The person or
          conveyancer sending the application can advise you.
        </p>
      </Details>

      <Radios
        name="route"
        legend="How will this person prove their identity?"
        hint="You can change this later. Skip this question if they do not need to prove their identity."
        value={f.route}
        onChange={set("route")}
        error={errorFor(errors, "route")}
        options={[
          { value: "one_login", label: "GOV.UK One Login", hint: "They prove their identity online themselves" },
          { value: "existing", label: "Existing identity verification process", hint: "For example, through a conveyancer" },
          { value: "undecided", label: "Not decided yet" },
        ]}
      />

      <button type="submit" className="govuk-button">
        {submitLabel}
      </button>
    </form>
  );
}
