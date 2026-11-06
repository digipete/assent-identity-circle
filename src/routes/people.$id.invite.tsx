import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { BackLink, Main, SummaryList } from "@/components/govuk";
import { sendInvitation, setFlash } from "@/domain/actions";
import { fullName, rolesText } from "@/domain/logic";
import { usePrototype } from "@/domain/store";
import { pageHead } from "@/lib/meta";

export const Route = createFileRoute("/people/$id/invite")({
  head: () => pageHead("Send identity-check invitation", "Confirm who you are inviting to prove their identity."),
  component: InvitePage,
});

function InvitePage() {
  const { id } = Route.useParams();
  const s = usePrototype();
  const navigate = useNavigate();
  const p = s.participants.find((x) => x.id === id);
  if (!s.case || !p) return <Navigate to="/people" />;
  const resend = s.invitations.some((i) => i.participantId === id && !i.selfService && i.status !== "cancelled");

  return (
    <Main back={<BackLink to="/people/$id" params={{ id }} />}>
      <h1 className="govuk-heading-l">{resend ? "Resend identity-check invitation" : "Send identity-check invitation"}</h1>
      <p className="govuk-body">You're about to invite {fullName(p)} to prove their identity for this property transfer.</p>
      <SummaryList
        rows={[
          { key: "Name", value: fullName(p) },
          { key: "Email address", value: p.email },
          { key: "Role", value: rolesText(p.roles) },
        ]}
      />
      <div className="govuk-inset-text">
        They will prove their own identity. You will be able to see when they have completed their check, but not the
        details of their identity documents.
      </div>
      {resend && <p className="govuk-body">Sending a new invitation will stop the previous link from working.</p>}
      <p className="govuk-body-s">This is a prototype. No email will actually be sent.</p>
      <div className="govuk-button-group">
        <button
          type="button"
          className="govuk-button"
          onClick={() => {
            sendInvitation(id);
            setFlash(`Invitation ${resend ? "resent" : "sent"} to ${fullName(p)} at ${p.email}`);
            navigate({ to: "/people/$id/invitation-preview", params: { id } });
          }}
        >
          {resend ? "Resend invitation" : "Send invitation"}
        </button>
        <BackLink to="/people/$id" params={{ id }}>
          Cancel
        </BackLink>
      </div>
    </Main>
  );
}
