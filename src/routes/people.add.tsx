import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { BackLink, Main } from "@/components/govuk";
import { PersonForm } from "@/components/PersonForm";
import { addParticipant, setFlash } from "@/domain/actions";
import { usePrototype } from "@/domain/store";
import { pageHead } from "@/lib/meta";

export const Route = createFileRoute("/people/add")({
  head: () => pageHead("Add a person involved in the transfer", "Add someone involved in the property transfer."),
  component: AddPerson,
});

function AddPerson() {
  const s = usePrototype();
  const navigate = useNavigate();
  if (!s.case) return <Navigate to="/transfer" />;
  return (
    <Main back={<BackLink to="/people" />}>
      <h1 className="govuk-heading-l">Add a person involved in the transfer</h1>
      <PersonForm
        participants={s.participants}
        coordinatorTaken={!!s.case.coordinatorParticipantId}
        submitLabel="Save and continue"
        onSubmit={(input) => {
          addParticipant(input);
          setFlash(`${input.firstName} ${input.lastName} has been added`);
          navigate({ to: "/people" });
        }}
      />
    </Main>
  );
}
