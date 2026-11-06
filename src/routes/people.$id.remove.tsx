import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BackLink, ErrorSummary, Main, Radios, type FieldError } from "@/components/govuk";
import { removeParticipant, setFlash } from "@/domain/actions";
import { fullName } from "@/domain/logic";
import { usePrototype } from "@/domain/store";
import { pageHead } from "@/lib/meta";

export const Route = createFileRoute("/people/$id/remove")({
  head: () => pageHead("Remove a person", "Remove a person from this property transfer."),
  component: RemovePage,
});

function RemovePage() {
  const { id } = Route.useParams();
  const s = usePrototype();
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [errors, setErrors] = useState<FieldError[]>([]);
  const p = s.participants.find((x) => x.id === id);
  if (!p) return <Navigate to="/people" />;
  const name = fullName(p);

  return (
    <Main back={<BackLink to="/people/$id" params={{ id }} />}>
      <ErrorSummary errors={errors} />
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (!value) return setErrors([{ field: "remove", message: `Select yes if you want to remove ${name}` }]);
          if (value === "yes") {
            removeParticipant(id);
            setFlash(`${name} has been removed`);
            navigate({ to: "/people" });
          } else navigate({ to: "/people/$id", params: { id } });
        }}
      >
        <Radios
          name="remove"
          isPageHeading
          legendClass="govuk-fieldset__legend--l"
          legend={`Are you sure you want to remove ${name}?`}
          hint="Any invitation sent to them will stop working. Their identity check result will be removed from this record."
          inline
          value={value}
          onChange={setValue}
          error={errors[0]?.message}
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
        />
        <button type="submit" className="govuk-button">
          Continue
        </button>
      </form>
    </Main>
  );
}
