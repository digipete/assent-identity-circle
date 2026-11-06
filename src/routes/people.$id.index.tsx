import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { BackLink, Main, NotificationBanner, StatusTag, SummaryList, useFlash, WarningText } from "@/components/govuk";
import { chooseAlternativeRoute, setFlash, startSelfCheck, track } from "@/domain/actions";
import { DOCUMENT_LABELS, formatDate, formatDateTime, fullName, isRequired, OUTCOME_LABELS, rolesText, ROUTE_LABELS } from "@/domain/logic";
import { usePrototype } from "@/domain/store";
import { pageHead } from "@/lib/meta";

export const Route = createFileRoute("/people/$id/")({
  head: () => pageHead("Identity check for a person", "Details and identity check progress for one person."),
  component: PersonDetails,
});

const REQUIRED_LABELS = { yes: "Yes", no: "No", not_sure: "Not sure – treated as needed" };
const INVITE_LABELS = { sent: "Sent", opened: "Opened", completed: "Completed", cancelled: "Cancelled" };

function PersonDetails() {
  const { id } = Route.useParams();
  const s = usePrototype();
  const navigate = useNavigate();
  const clear = useCallback(() => setFlash(null), []);
  const flash = useFlash(s.flash, clear);
  const p = s.participants.find((x) => x.id === id);
  if (!s.case || !p) return <Navigate to="/people" />;

  const invitation = [...s.invitations].reverse().find((i) => i.participantId === p.id && !i.selfService && i.status !== "cancelled");
  const required = isRequired(p);
  const verified = p.verificationStatus === "verified";
  const onlineRoute = p.verificationRoute !== "existing";
  const change = (label: string, hash: string) => (
    <Link to="/people/$id/edit" params={{ id }} hash={hash} className="govuk-link">
      Change<span className="govuk-visually-hidden"> {label}</span>
    </Link>
  );

  const rows = [
    { key: "Name", value: fullName(p), action: change("name", "firstName") },
    { key: "Role", value: rolesText(p.roles), action: change("role", "roles") },
    { key: "Is this you?", value: p.isCoordinator ? "Yes" : "No" },
    { key: "Identity check needed", value: REQUIRED_LABELS[p.identityCheckRequired], action: change("whether a check is needed", "required") },
    { key: "How they will prove their identity", value: required ? ROUTE_LABELS[p.verificationRoute] : "No check needed", action: change("verification route", "route") },
    { key: "Email address", value: p.email, action: change("email address", "email") },
    {
      key: "Invitation",
      value: p.isCoordinator ? "Not needed – this is you" : invitation ? `${INVITE_LABELS[invitation.status]} – sent ${formatDateTime(invitation.sentAt)}` : "Not sent",
    },
    { key: "Status", value: required ? <StatusTag status={p.verificationStatus} /> : "No check needed" },
    { key: "Latest result", value: OUTCOME_LABELS[p.verificationOutcome] },
  ];
  if (p.verifiedAt) rows.push({ key: "Identity checked", value: formatDate(p.verifiedAt) });
  if (verified && p.evidenceDocumentType) rows.push({ key: "Evidence used", value: DOCUMENT_LABELS[p.evidenceDocumentType] });
  if (p.assuranceOutcome !== "not_assessed")
    rows.push({
      key: "Further checks",
      value: p.additionalChecksRequired ? "HM Land Registry may need further evidence for this person" : "None indicated by the simulated result",
    });

  return (
    <Main back={<BackLink to="/people">Back to people involved</BackLink>}>
      {flash && (
        <NotificationBanner success>
          <p className="govuk-notification-banner__heading">{flash}</p>
        </NotificationBanner>
      )}
      <span className="govuk-caption-l">Reference {s.case.reference}</span>
      <h1 className="govuk-heading-l">Identity check for {fullName(p)}</h1>

      {verified && (
        <div className="govuk-inset-text">
          {fullName(p)} completed their identity check on {formatDate(p.verifiedAt)}. If you change their name or email
          address, they will need to complete a new check.
        </div>
      )}
      {p.additionalChecksRequired && (
        <WarningText>
          The result shows that more evidence may be needed for {p.firstName}. Completing the online check is not the same
          as meeting the application's evidence requirements.
        </WarningText>
      )}

      <SummaryList rows={rows} />

      {required && !verified && onlineRoute && (
        <div className="govuk-button-group">
          {p.isCoordinator ? (
            <button
              type="button"
              className="govuk-button"
              onClick={() => {
                const token = startSelfCheck(p.id);
                navigate({ to: "/invite/$token/one-login", params: { token } });
              }}
            >
              Prove your identity
            </button>
          ) : (
            <Link to="/people/$id/invite" params={{ id }} className="govuk-button">
              {invitation ? "Resend invitation" : "Send invitation"}
            </Link>
          )}
          {invitation && (
            <Link to="/people/$id/invitation-preview" params={{ id }} className="govuk-link">
              View invitation
            </Link>
          )}
        </div>
      )}

      {required && !verified && onlineRoute && (
        <p className="govuk-body">
          <button
            type="button"
            className="govuk-button govuk-button--secondary"
            onClick={() => {
              chooseAlternativeRoute(p.id, "coordinator");
              setFlash(`${p.firstName} will prove their identity another way`);
            }}
          >
            Use another way to prove their identity
          </button>
        </p>
      )}

      {p.verificationRoute === "existing" && required && (
        <div className="govuk-inset-text">
          {p.firstName} will prove their identity another way. Their evidence should be sent with the paper application.
          This service does not check it.
        </div>
      )}

      <h2 className="govuk-heading-m">Other actions</h2>
      <ul className="govuk-list">
        <li>
          <Link to="/people/$id/remove" params={{ id }} className="govuk-link">
            Remove {fullName(p)} from this transfer
          </Link>
        </li>
        <li>
          <Link to="/people" className="govuk-link" onClick={() => track("returned_to_coordinator_view", p.id)}>
            Return to people involved
          </Link>
        </li>
      </ul>
    </Main>
  );
}
