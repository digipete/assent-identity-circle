import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BackLink, Details, ErrorSummary, errorFor, Main, Radios, TextInput, type FieldError } from "@/components/govuk";
import { createCase } from "@/domain/actions";
import { getState, usePrototype } from "@/domain/store";
import type { Role } from "@/domain/types";
import { pageHead } from "@/lib/meta";

export const Route = createFileRoute("/transfer")({
  head: () => pageHead("About the property transfer", "Tell us about the property and the person who has died."),
  component: TransferPage,
});

const POSTCODE = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;

function TransferPage() {
  const s = usePrototype();
  const navigate = useNavigate();
  const c = s.case;
  const [f, setF] = useState({
    line1: c?.propertyAddress.line1 ?? "",
    line2: c?.propertyAddress.line2 ?? "",
    town: c?.propertyAddress.town ?? "",
    postcode: c?.propertyAddress.postcode ?? "",
    titleNumber: c?.titleNumber ?? "",
    deceased: c?.deceasedOwnerName ?? "",
    role: (c?.coordinatorRole ?? "") as string,
  });
  const [errors, setErrors] = useState<FieldError[]>([]);
  const set = (k: keyof typeof f) => (v: string) => setF((x) => ({ ...x, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: FieldError[] = [];
    if (!f.line1.trim()) errs.push({ field: "line1", message: "Enter address line 1, typically the building and street" });
    if (!f.town.trim()) errs.push({ field: "town", message: "Enter town or city" });
    if (!f.postcode.trim()) errs.push({ field: "postcode", message: "Enter postcode" });
    else if (!POSTCODE.test(f.postcode.trim())) errs.push({ field: "postcode", message: "Enter a full UK postcode, like HG1 4PL" });
    if (f.titleNumber.trim() && !/^[A-Z]{0,3}\d{1,6}$/i.test(f.titleNumber.trim().replace(/\s/g, "")))
      errs.push({ field: "titleNumber", message: "Title number must be up to 3 letters followed by up to 6 numbers, like NYK305718" });
    if (!f.deceased.trim()) errs.push({ field: "deceased", message: "Enter the name of the person who has died" });
    if (!f.role) errs.push({ field: "role", message: "Select your role in the transfer" });
    setErrors(errs);
    if (errs.length) return;
    createCase({
      address: { line1: f.line1.trim(), line2: f.line2.trim(), town: f.town.trim(), postcode: f.postcode.trim().toUpperCase() },
      titleNumber: f.titleNumber.trim().toUpperCase().replace(/\s/g, ""),
      deceasedOwnerName: f.deceased.trim(),
      role: f.role as Role,
    });
    const st = getState();
    if (st.journeyMode === "B" && !st.case?.coordinatorParticipantId) navigate({ to: "/your-details" });
    else navigate({ to: "/people" });
  }

  return (
    <Main back={<BackLink to="/" />}>
      <ErrorSummary errors={errors} />
      <h1 className="govuk-heading-l">About the property transfer</h1>
      <form onSubmit={submit} noValidate>
        <fieldset className="govuk-fieldset">
          <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">Property address</legend>
          <TextInput id="line1" label="Address line 1" value={f.line1} onChange={set("line1")} error={errorFor(errors, "line1")} autoComplete="address-line1" />
          <TextInput id="line2" label="Address line 2 (optional)" value={f.line2} onChange={set("line2")} autoComplete="address-line2" />
          <TextInput id="town" label="Town or city" value={f.town} onChange={set("town")} error={errorFor(errors, "town")} widthClass="govuk-!-width-two-thirds" autoComplete="address-level2" />
          <TextInput id="postcode" label="Postcode" value={f.postcode} onChange={set("postcode")} error={errorFor(errors, "postcode")} widthClass="govuk-input--width-10" autoComplete="postal-code" />
        </fieldset>

        <TextInput
          id="titleNumber"
          label="Title number (optional)"
          hint="This is on the title register for the property, for example NYK305718"
          value={f.titleNumber}
          onChange={set("titleNumber")}
          error={errorFor(errors, "titleNumber")}
          widthClass="govuk-input--width-10"
          spellCheck={false}
        />
        <Details summary="Where to find the title number">
          <p className="govuk-body">
            The title number is on the title register, which you can get from HM Land Registry. If you do not know it,
            leave this blank.
          </p>
        </Details>

        <TextInput id="deceased" label="Full name of the person who has died" hint="This is the registered owner of the property" value={f.deceased} onChange={set("deceased")} error={errorFor(errors, "deceased")} />

        <Radios
          name="role"
          legend="What is your role in the transfer?"
          value={f.role}
          onChange={set("role")}
          error={errorFor(errors, "role")}
          options={[
            { value: "executor", label: "Executor", hint: "You are named in the will to deal with the estate" },
            { value: "administrator", label: "Administrator", hint: "You were appointed to deal with the estate because there is no valid will" },
            { value: "beneficiary", label: "Beneficiary", hint: "You are receiving the property" },
            { value: "attorney", label: "Attorney", hint: "You are legally authorised to act for one of the people involved" },
            { value: "other", label: "Other", hint: "For example, you are helping to prepare the application" },
          ]}
        />
        <Details summary="If you have more than one role">
          <p className="govuk-body">Choose your main role. You can add other roles when you add yourself to the list of people involved.</p>
        </Details>

        <button type="submit" className="govuk-button">
          Continue
        </button>
      </form>
    </Main>
  );
}
