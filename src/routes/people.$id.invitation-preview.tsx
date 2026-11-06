import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { BackLink, Main, NotificationBanner, useFlash } from "@/components/govuk";
import { setFlash } from "@/domain/actions";
import { formatDateTime, fullName, rolesText } from "@/domain/logic";
import { usePrototype } from "@/domain/store";
import { pageHead } from "@/lib/meta";

export const Route = createFileRoute("/people/$id/invitation-preview")({
  head: () => pageHead("Invitation preview", "Preview of the simulated identity-check invitation email."),
  component: Preview,
});

function Preview() {
  const { id } = Route.useParams();
  const s = usePrototype();
  const clear = useCallback(() => setFlash(null), []);
  const flash = useFlash(s.flash, clear);
  const p = s.participants.find((x) => x.id === id);
  const inv = [...s.invitations].reverse().find((i) => i.participantId === id && !i.selfService && i.status !== "cancelled");
  if (!s.case || !p) return <Navigate to="/people" />;
  if (!inv) return <Navigate to="/people/$id" params={{ id }} />;
  const coordinator = s.participants.find((x) => x.id === s.case?.coordinatorParticipantId);
  const inviter = coordinator ? fullName(coordinator) : "The person managing this property transfer";

  return (
    <Main back={<BackLink to="/people/$id" params={{ id }} />}>
      {flash && (
        <NotificationBanner success>
          <p className="govuk-notification-banner__heading">{flash}</p>
        </NotificationBanner>
      )}
      <h1 className="govuk-heading-l">Invitation preview</h1>
      <p className="govuk-body">
        This is what {p.firstName} would receive. Sent {formatDateTime(inv.sentAt)}.
      </p>

      <div className="app-email-preview" aria-label="Simulated email">
        <p className="govuk-body-s govuk-!-margin-bottom-1">
          <strong>From:</strong> HM Land Registry – Check identities for an Assent application
        </p>
        <p className="govuk-body-s govuk-!-margin-bottom-1">
          <strong>To:</strong> {p.email}
        </p>
        <p className="govuk-body-s">
          <strong>Subject:</strong> Prove your identity for a property transfer – reference {s.case.reference}
        </p>
        <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
        <p className="govuk-body">Dear {fullName(p)},</p>
        <p className="govuk-body">
          {inviter} has added you to a property transfer following a death. Your role is recorded as{" "}
          {rolesText(p.roles).toLowerCase()}.
        </p>
        <p className="govuk-body">
          HM Land Registry may need to confirm the identity of the people involved. You can prove your identity online
          using GOV.UK One Login. It usually takes about 10 minutes.
        </p>
        <p className="govuk-body">Property transfer reference: <strong>{s.case.reference}</strong></p>
        <p className="govuk-body">
          <Link to="/invite/$token" params={{ token: inv.token }} className="govuk-link">
            Prove your identity
          </Link>
        </p>
        <p className="govuk-body">
          You do not need to pay anything. Proving your identity does not authorise a payment or transfer the property.
        </p>
        <p className="govuk-body">
          If you do not recognise this invitation, do not click the link. Contact HM Land Registry customer support and
          quote the reference above.
        </p>
        <p className="govuk-body">HM Land Registry</p>
      </div>

      <p className="govuk-body">
        <Link to="/people" className="govuk-link">
          Return to people involved
        </Link>
      </p>
    </Main>
  );
}
