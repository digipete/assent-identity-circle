import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Details, Main, SummaryList } from "@/components/govuk";
import { markInvitationOpened } from "@/domain/actions";
import { fullName, rolesText } from "@/domain/logic";
import { usePrototype } from "@/domain/store";
import { pageHead } from "@/lib/meta";

export const Route = createFileRoute("/invite/$token/")({
  head: () => pageHead("You've been invited to prove your identity", "Prove your identity for a property transfer using GOV.UK One Login."),
  component: InviteLanding,
});

export function InvalidInvitation() {
  return (
    <Main>
      <h1 className="govuk-heading-l">This invitation link is not valid</h1>
      <p className="govuk-body">The link may have expired, been replaced by a newer invitation, or been typed incorrectly.</p>
      <p className="govuk-body">Ask the person who invited you to send a new invitation.</p>
    </Main>
  );
}

function InviteLanding() {
  const { token } = Route.useParams();
  const s = usePrototype();
  const navigate = useNavigate();
  const inv = s.invitations.find((i) => i.token === token && i.status !== "cancelled");
  useEffect(() => {
    if (inv) markInvitationOpened(token);
  }, [token, inv?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const p = inv && s.participants.find((x) => x.id === inv.participantId);
  if (!inv || !p || !s.case) return <InvalidInvitation />;
  const coordinator = s.participants.find((x) => x.id === s.case?.coordinatorParticipantId);

  if (p.verificationStatus === "verified")
    return (
      <Main>
        <h1 className="govuk-heading-l">You've already proved your identity</h1>
        <p className="govuk-body">You do not need to do anything else for this property transfer.</p>
      </Main>
    );

  return (
    <Main>
      <h1 className="govuk-heading-l">You've been invited to prove your identity</h1>
      <p className="govuk-body">Someone has added you as a person involved in a property transfer.</p>
      <p className="govuk-body">You need to prove your identity before the identity-check stage can be completed.</p>
      <SummaryList
        rows={[
          { key: "Property transfer reference", value: s.case.reference },
          { key: "Invited by", value: coordinator ? fullName(coordinator) : "The person managing this property transfer" },
          { key: "Your name", value: fullName(p) },
          { key: "Your recorded role", value: rolesText(p.roles) },
        ]}
      />
      <h2 className="govuk-heading-m">What happens next</h2>
      <p className="govuk-body">
        You'll sign in or create a GOV.UK One Login and prove your identity, usually with photo ID such as a passport or
        driving licence. Only you can do this – nobody else can prove your identity for you.
      </p>
      <h2 className="govuk-heading-m">How your information will be used</h2>
      <p className="govuk-body">
        HM Land Registry will receive confirmation that you have proved your identity and the date you did it. The person
        who invited you will only see that your check is complete. They will not see your identity documents.
      </p>
      <div className="govuk-inset-text">You do not need to pay anything. This does not transfer the property or approve an application.</div>
      <Details summary="If you do not recognise this invitation">
        <p className="govuk-body">Do not continue. Contact HM Land Registry customer support and quote the reference above.</p>
      </Details>
      <button type="button" className="govuk-button" onClick={() => navigate({ to: "/invite/$token/one-login", params: { token } })}>
        Continue to GOV.UK One Login
      </button>
      <p className="govuk-body">
        <Link to="/invite/$token/outcome" params={{ token }} search={{ alt: "1" }} className="govuk-link">
          I want to prove my identity another way
        </Link>
      </p>
    </Main>
  );
}
