import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { BackLink, Main } from "@/components/govuk";
import { PersonForm } from "@/components/PersonForm";
import { setFlash, updateParticipant } from "@/domain/actions";
import { fullName } from "@/domain/logic";
import { usePrototype } from "@/domain/store";
import { pageHead } from "@/lib/meta";

export const Route = createFileRoute("/people/$id/edit")({
  head: () => pageHead("Change details", "Change the details of a person involved in the transfer."),
  component: EditPerson,
});

function EditPerson() {
  const { id } = Route.useParams();
  const s = usePrototype();
  const navigate = useNavigate();
  const p = s.participants.find((x) => x.id === id);
  if (!s.case || !p) return <Navigate to="/people" />;
  return (
    <Main back={<BackLink to="/people/$id" params={{ id }} />}>
      <PersonForm
        key={p.id}
        participants={s.participants}
        existing={p}
        coordinatorTaken={!!s.case.coordinatorParticipantId}
        heading={`Change details for ${fullName(p)}`}
        submitLabel="Save changes"
        onSubmit={(input) => {
          const reset = updateParticipant(id, input);
          setFlash(
            reset
              ? `Details changed. ${input.firstName} ${input.lastName} will need to complete a new identity check`
              : "Details changed",
          );
          navigate({ to: "/people/$id", params: { id } });
        }}
      />
    </Main>
  );
}
