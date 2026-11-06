import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Main, Radios } from "@/components/govuk";
import { completeMockVerification, markVerificationStarted } from "@/domain/actions";
import { usePrototype } from "@/domain/store";
import type { DocumentType } from "@/domain/types";
import type { MockScenarioOutcome } from "@/identity/provider";
import { pageHead } from "@/lib/meta";
import { InvalidInvitation } from "./invite.$token.index";

export const Route = createFileRoute("/invite/$token/one-login")({
  head: () => pageHead("GOV.UK One Login (simulated)", "Simulated GOV.UK One Login identity check for research."),
  component: MockOneLogin,
});

function MockOneLogin() {
  const { token } = Route.useParams();
  const s = usePrototype();
  const navigate = useNavigate();
  const inv = s.invitations.find((i) => i.token === token && i.status !== "cancelled");
  const [outcome, setOutcome] = useState<MockScenarioOutcome>("success");
  const [doc, setDoc] = useState<DocumentType>("passport");
  const [flag, setFlag] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (inv) markVerificationStarted(token);
  }, [token, inv?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!inv) return <InvalidInvitation />;

  return (
    <Main>
      <div className="app-simulation">
        <p className="govuk-body govuk-!-font-weight-bold govuk-!-margin-bottom-1">Simulation – this is not GOV.UK One Login</p>
        <p className="govuk-body govuk-!-margin-bottom-0">No real sign-in or identity check happens in this prototype.</p>
      </div>
      <span className="govuk-caption-l">GOV.UK One Login</span>
      <h1 className="govuk-heading-l">Sign in and prove your identity</h1>
      <p className="govuk-body">In the real service, GOV.UK One Login would:</p>
      <ol className="govuk-list govuk-list--number">
        <li>ask you to sign in, or create an account, with your email address and a security code</li>
        <li>ask you to prove your identity, for example by scanning photo ID with your phone</li>
        <li>send you back here once you have finished</li>
      </ol>
      <p className="govuk-body">Signing in on its own does not prove your identity.</p>

      <h2 className="govuk-heading-m">Researcher controls</h2>
      <form
        noValidate
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          await completeMockVerification(token, { outcome, documentType: doc, flagForAssuranceReview: flag });
          navigate({ to: "/invite/$token/outcome", params: { token }, search: { alt: undefined } });
        }}
      >
        <Radios
          name="outcome"
          legend="Choose what happens"
          legendClass="govuk-fieldset__legend--s"
          value={outcome}
          onChange={(v) => setOutcome(v as MockScenarioOutcome)}
          options={[
            { value: "success", label: "Identity verification successful" },
            { value: "incomplete", label: "Verification attempted but not completed" },
            { value: "unsuccessful", label: "Verification unsuccessful" },
            { value: "declined", label: "User decides not to continue" },
            { value: "additional_needed", label: "Additional verification needed" },
          ]}
        />
        {outcome === "success" && (
          <>
            <Radios
              name="doc"
              legend="Evidence returned in the simulated result"
              legendClass="govuk-fieldset__legend--s"
              value={doc}
              onChange={(v) => setDoc(v as DocumentType)}
              options={[
                { value: "passport", label: "Passport" },
                { value: "driving_licence", label: "Driving licence" },
                { value: "other", label: "Other supported evidence" },
                { value: "not_provided", label: "Not provided" },
              ]}
            />
            <div className="govuk-form-group">
              <div className="govuk-checkboxes govuk-checkboxes--small">
                <div className="govuk-checkboxes__item">
                  <input className="govuk-checkboxes__input" id="flag" type="checkbox" checked={flag} onChange={(e) => setFlag(e.target.checked)} />
                  <label className="govuk-label govuk-checkboxes__label" htmlFor="flag">
                    Flag that further assurance is needed for this result
                  </label>
                </div>
              </div>
            </div>
          </>
        )}
        <button type="submit" className="govuk-button" disabled={busy}>
          Return to HM Land Registry
        </button>
      </form>
    </Main>
  );
}
