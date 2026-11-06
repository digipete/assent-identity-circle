import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Details, Main } from "@/components/govuk";
import { track } from "@/domain/actions";
import { usePrototype } from "@/domain/store";
import { pageHead } from "@/lib/meta";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Check identities for an Assent application",
      "Invite the people involved in a property transfer after a death to prove their identity using GOV.UK One Login.",
    ),
  component: StartPage,
});

function StartPage() {
  const s = usePrototype();
  const navigate = useNavigate();
  useEffect(() => {
    track("start_page_viewed");
  }, []);

  return (
    <Main>
      <h1 className="govuk-heading-xl">Check identities for an Assent application</h1>
      <p className="govuk-body">
        If you're transferring a property after someone has died, you may need to prove the identity of the people
        involved.
      </p>
      <p className="govuk-body">
        This service lets you invite people to prove their identity using GOV.UK One Login and check when their
        identity checks are complete.
      </p>

      <h2 className="govuk-heading-m">Who can use this service</h2>
      <p className="govuk-body">You can use this service if you are dealing with a registered property in England or Wales and you are:</p>
      <ul className="govuk-list govuk-list--bullet">
        <li>an executor or administrator of the estate of someone who has died</li>
        <li>a beneficiary receiving the property</li>
        <li>an attorney acting for one of these people</li>
        <li>helping to prepare the Assent application</li>
      </ul>

      <h2 className="govuk-heading-m">Before you start</h2>
      <p className="govuk-body">You'll need:</p>
      <ul className="govuk-list govuk-list--bullet">
        <li>the address of the property</li>
        <li>the title number, if you know it</li>
        <li>the name of the person who has died</li>
        <li>the names and email addresses of the other people involved</li>
      </ul>

      <h2 className="govuk-heading-m">How it works</h2>
      <p className="govuk-body">
        You add the people involved and invite anyone who needs to prove their identity. Each person completes their
        own identity check. You cannot prove someone else's identity for them.
      </p>
      <p className="govuk-body">You can see who has completed their check and what is still outstanding.</p>

      <div className="govuk-inset-text">
        This service does not replace the Assent application. You still need to complete and send form AS1 and form
        AP1, where needed, to HM Land Registry. Completing identity checks does not transfer or approve anything.
      </div>

      <button
        type="button"
        className="govuk-button govuk-button--start"
        onClick={() => {
          track("service_started");
          navigate({ to: s.case ? "/people" : "/transfer" });
        }}
      >
        Start now
        <svg className="govuk-button__start-icon" xmlns="http://www.w3.org/2000/svg" width="17.5" height="19" viewBox="0 0 33 40" aria-hidden="true" focusable="false">
          <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z" />
        </svg>
      </button>

      <p className="govuk-body">
        <Link to="/other-ways" className="govuk-link">
          Find out about other ways to prove your identity
        </Link>
      </p>

      <Details summary="This is a research prototype">
        <p className="govuk-body">
          This prototype is being used to understand how people would use an online identity check. Identity checks
          are simulated. Use fictional details only.
        </p>
      </Details>
    </Main>
  );
}
