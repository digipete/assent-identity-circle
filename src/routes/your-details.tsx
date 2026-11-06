import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BackLink, ErrorSummary, errorFor, Main, TextInput, type FieldError } from "@/components/govuk";
import { addParticipant, startSelfCheck } from "@/domain/actions";
import { isValidEmail } from "@/domain/logic";
import { usePrototype } from "@/domain/store";
import { pageHead } from "@/lib/meta";

export const Route = createFileRoute("/your-details")({
  head: () => pageHead("Prove your identity first", "Prove your own identity before adding other people."),
  component: YourDetails,
});

function YourDetails() {
  const s = usePrototype();
  const navigate = useNavigate();
  const [f, setF] = useState({ firstName: "", lastName: "", email: "" });
  const [errors, setErrors] = useState<FieldError[]>([]);
  if (!s.case) return <Navigate to="/transfer" />;
  const coordinator = s.participants.find((p) => p.id === s.case?.coordinatorParticipantId);
  if (coordinator) return <Navigate to="/people/$id" params={{ id: coordinator.id }} />;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: FieldError[] = [];
    if (!f.firstName.trim()) errs.push({ field: "firstName", message: "Enter your first name" });
    if (!f.lastName.trim()) errs.push({ field: "lastName", message: "Enter your last name" });
    if (!f.email.trim()) errs.push({ field: "email", message: "Enter your email address" });
    else if (!isValidEmail(f.email)) errs.push({ field: "email", message: "Enter an email address in the correct format, like name@example.com" });
    setErrors(errs);
    if (errs.length || !s.case) return;
    const id = addParticipant({
      firstName: f.firstName.trim(),
      lastName: f.lastName.trim(),
      email: f.email.trim(),
      roles: [s.case.coordinatorRole],
      isCoordinator: true,
      identityCheckRequired: "yes",
      verificationRoute: "one_login",
    });
    const token = startSelfCheck(id);
    navigate({ to: "/invite/$token/one-login", params: { token } });
  }

  return (
    <Main back={<BackLink to="/transfer" />}>
      <ErrorSummary errors={errors} />
      <span className="govuk-caption-l">Reference {s.case.reference}</span>
      <h1 className="govuk-heading-l">Prove your identity first</h1>
      <p className="govuk-body">Before you add other people, you need to prove your own identity using GOV.UK One Login.</p>
      <form onSubmit={submit} noValidate>
        <TextInput id="firstName" label="First name" value={f.firstName} onChange={(v) => setF({ ...f, firstName: v })} error={errorFor(errors, "firstName")} autoComplete="given-name" />
        <TextInput id="lastName" label="Last name" value={f.lastName} onChange={(v) => setF({ ...f, lastName: v })} error={errorFor(errors, "lastName")} autoComplete="family-name" />
        <TextInput id="email" type="email" label="Email address" value={f.email} onChange={(v) => setF({ ...f, email: v })} error={errorFor(errors, "email")} autoComplete="email" spellCheck={false} />
        <button type="submit" className="govuk-button">
          Continue to GOV.UK One Login
        </button>
      </form>
    </Main>
  );
}
