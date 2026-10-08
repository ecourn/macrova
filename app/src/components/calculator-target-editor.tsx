import { useRef } from "react"
import type {
  CalculatorMethod,
  CalculatorSession,
  CalculatorTargetField,
} from "@/domain/calculator"
import {
  cancelCalculatorEdit,
  changeCalculatorEdit,
  confirmCalculatorEdit,
  displayCalculatorValue,
  previewCalculatorEdit,
  resetCalculatorTarget,
} from "@/domain/calculator"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

export const targetLabels = {
  E: "Calories",
  P: "Protéines",
  G: "Glucides",
  L: "Lipides",
}
const consequences = {
  E: "Fractions énergétiques conservées ; protéines, glucides et lipides recalculés.",
  P: "Calories et lipides conservés ; glucides recalculés.",
  G: "Calories et protéines conservées ; lipides recalculés.",
  L: "Calories et protéines conservées ; glucides recalculés.",
}
export function CalculatorTargetEditor({
  session,
  method,
  ready,
  update,
}: {
  session: CalculatorSession
  method: CalculatorMethod | null | undefined
  ready: boolean
  update: (next: CalculatorSession) => void
}) {
  const previewButton = useRef<HTMLButtonElement>(null)
  function closePreview(next: CalculatorSession) {
    update(next)
    previewButton.current?.focus()
  }
  const field = session.edit.field as CalculatorTargetField
  const selectionError = session.editErrors.some(
    (error) => error.code === "MODIFICATION_NON_UNIQUE"
  )
  return (
    <section aria-labelledby="edit-title" className="mt-8 max-w-3xl space-y-6">
      <h2 id="edit-title" className="text-xl font-semibold">
        Modifier ma cible
      </h2>
      <p>
        Choisissez un seul champ et saisissez sa nouvelle valeur. Les calories
        doivent rester entre 90 % et 110 % de l'estimation originale. La
        prévisualisation ne change pas votre cible courante.
      </p>
      <form
        method="post"
        autoComplete="off"
        onSubmit={(event) => {
          event.preventDefault()
          update(previewCalculatorEdit(session, method))
        }}
      >
        <fieldset disabled={!ready} className="space-y-6">
          <Field data-invalid={selectionError}>
            <FieldLabel htmlFor="edit-field">Champ à modifier</FieldLabel>
            <NativeSelect
              id="edit-field"
              value={session.edit.field}
              aria-invalid={selectionError}
              aria-describedby={selectionError ? "edit-error" : undefined}
              onChange={(event) =>
                update(changeCalculatorEdit(session, event.target.value, ""))
              }
            >
              <NativeSelectOption value="">
                Choisir explicitement
              </NativeSelectOption>
              {Object.entries(targetLabels).map(([key, label]) => (
                <NativeSelectOption key={key} value={key}>
                  {label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          <Field data-invalid={session.editErrors.length > 0}>
            <FieldLabel htmlFor="edit-value">
              Nouvelle valeur{" "}
              {field
                ? `de ${targetLabels[field].toLowerCase()} (${field === "E" ? "kcal/jour" : "g/jour"})`
                : "(choisissez un champ)"}
            </FieldLabel>
            <Input
              id="edit-value"
              inputMode="decimal"
              value={session.edit.value}
              onChange={(event) =>
                update(
                  changeCalculatorEdit(
                    session,
                    session.edit.field,
                    event.target.value
                  )
                )
              }
              aria-invalid={!selectionError && session.editErrors.length > 0}
              aria-describedby={`edit-help${session.editErrors.length ? " edit-error" : ""}`}
            />
            <FieldDescription id="edit-help">
              Virgule ou point accepté, au plus six décimales. Aucune valeur
              arrondie n'est préremplie. {field && consequences[field]}
            </FieldDescription>
            {session.editErrors.length > 0 && (
              <FieldError id="edit-error" role="presentation">
                {session.editErrors.map((error) => error.message).join(" ")}
              </FieldError>
            )}
          </Field>
          <div className="flex flex-wrap gap-3">
            <Button ref={previewButton} type="submit" className="min-h-11">
              Prévisualiser le recalcul
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => update(cancelCalculatorEdit(session))}
            >
              Annuler la modification
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 whitespace-normal"
              onClick={() => update(resetCalculatorTarget(session, method))}
            >
              Réinitialiser la cible originale
            </Button>
          </div>
        </fieldset>
      </form>
      <div aria-live="polite" aria-atomic="true">
        {session.editErrors.length > 0 && (
          <Alert variant="destructive" role="group">
            <AlertTitle>Modification refusée</AlertTitle>
            <AlertDescription>
              <p>
                La cible courante précédente est conservée. Corrigez votre
                saisie puis prévisualisez à nouveau.
              </p>
              {session.editErrors.map((error) => (
                <Button
                  key={error.code}
                  variant="link"
                  role="link"
                  nativeButton={false}
                  render={<a href="#edit-value" />}
                  className="h-auto min-h-11 whitespace-normal px-0 text-left text-destructive underline"
                  onClick={(event) => {
                    event.preventDefault()
                    event.currentTarget.ownerDocument
                      .getElementById(
                        error.code === "MODIFICATION_NON_UNIQUE"
                          ? "edit-field"
                          : "edit-value"
                      )
                      ?.focus()
                  }}
                >
                  {error.message}
                </Button>
              ))}
            </AlertDescription>
          </Alert>
        )}
        {session.preview && (
          <section
            aria-labelledby="preview-title"
            className="space-y-4 rounded-xl border p-4"
          >
            <h3 id="preview-title" className="text-xl font-semibold">
              Prévisualisation de modification
            </h3>
            <p>
              {consequences[session.preview.field]} Confirmez explicitement pour
              remplacer la cible courante, même si les valeurs sont identiques.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {(["previous", "target"] as const).map((state) => (
                <div key={state}>
                  <h4 className="font-semibold">
                    {state === "previous"
                      ? "Ancienne cible courante"
                      : "Nouvelle cible proposée"}
                  </h4>
                  <dl className="space-y-3">
                    {Object.entries(targetLabels).map(([key, label]) => {
                      const value =
                        session.preview?.[state][key as CalculatorTargetField]
                      return (
                        value && (
                          <div key={key}>
                            <dt>{label}</dt>
                            <dd className="tabular-nums">
                              {displayCalculatorValue(value)}{" "}
                              {key === "E" ? "kcal/jour" : "g/jour"}
                            </dd>
                          </div>
                        )
                      )
                    })}
                  </dl>
                </div>
              ))}
            </div>
            <details>
              <summary className="min-h-11 cursor-pointer py-3">
                Consulter les valeurs exactes de la prévisualisation
              </summary>
              <dl className="space-y-2 break-all">
                {Object.entries(targetLabels).map(([key, label]) => {
                  const previous =
                    session.preview?.previous[key as CalculatorTargetField]
                  const next =
                    session.preview?.target[key as CalculatorTargetField]
                  return (
                    previous &&
                    next && (
                      <div key={key}>
                        <dt>
                          {label} ({key === "E" ? "kcal/jour" : "g/jour"})
                        </dt>
                        <dd>
                          Ancienne : {String(previous.numerator)}/
                          {String(previous.denominator)} ; nouvelle :{" "}
                          {String(next.numerator)}/{String(next.denominator)}
                        </dd>
                      </div>
                    )
                  )
                })}
              </dl>
            </details>
            <div className="flex flex-wrap gap-3">
              <Button
                disabled={!ready}
                className="min-h-11"
                onClick={() =>
                  closePreview(confirmCalculatorEdit(session, method))
                }
              >
                Confirmer la modification
              </Button>
              <Button
                disabled={!ready}
                variant="outline"
                className="min-h-11"
                onClick={() => closePreview(cancelCalculatorEdit(session))}
              >
                Annuler la prévisualisation
              </Button>
            </div>
          </section>
        )}
      </div>
    </section>
  )
}
