import { useRef, useState } from "react"
import {
  calculatorTargetFields,
  calculatorTargetLabels,
  calculatorTargetUnit,
} from "@/lib/calculator-presentation"
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
  FieldSet,
  FieldLegend,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

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
  onConfirmed,
}: {
  session: CalculatorSession
  method: CalculatorMethod | null | undefined
  ready: boolean
  update: (next: CalculatorSession) => void
  onConfirmed: () => void
}) {
  const [notice, setNotice] = useState("")
  const previewButton = useRef<HTMLButtonElement>(null)
  function closePreview(next: CalculatorSession) {
    const wasPreviewOpen = !!session.preview
    update(next)
    if (wasPreviewOpen) previewButton.current?.focus()
  }
  const field = session.edit.field as CalculatorTargetField
  const selectionError = session.editErrors.some(
    (error) => error.code === "MODIFICATION_NON_UNIQUE"
  )
  return (
    <section
      aria-labelledby="edit-title"
      className="mt-8 max-w-3xl space-y-6"
      onKeyDown={(event) => {
        if (session.preview && event.key === "Escape") {
          event.preventDefault()
          setNotice(
            "Prévisualisation annulée : la cible courante est conservée."
          )
          closePreview(cancelCalculatorEdit(session))
        }
      }}
    >
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
          setNotice("")
          update(previewCalculatorEdit(session, method))
        }}
      >
        <FieldSet disabled={!ready} className="gap-6">
          <FieldLegend className="sr-only">
            Modification de la cible
          </FieldLegend>
          <Field data-invalid={selectionError}>
            <FieldLabel htmlFor="edit-field">Champ à modifier</FieldLabel>
            <NativeSelect
              id="edit-field"
              value={session.edit.field}
              aria-invalid={selectionError}
              aria-describedby={selectionError ? "edit-field-error" : undefined}
              onChange={(event) => {
                setNotice("")
                update(changeCalculatorEdit(session, event.target.value, ""))
              }}
            >
              <NativeSelectOption value="">Choisir</NativeSelectOption>
              {calculatorTargetFields.map((key) => (
                <NativeSelectOption key={key} value={key}>
                  {calculatorTargetLabels[key]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            {selectionError && (
              <FieldError id="edit-field-error" role="presentation">
                {session.editErrors
                  .filter((error) => error.code === "MODIFICATION_NON_UNIQUE")
                  .map((error) => error.message)
                  .join(" ")}
              </FieldError>
            )}
          </Field>
          <Field
            data-invalid={!selectionError && session.editErrors.length > 0}
          >
            <FieldLabel htmlFor="edit-value">
              Nouvelle valeur{" "}
              {field
                ? `de ${calculatorTargetLabels[field].toLowerCase()} (${calculatorTargetUnit(field)})`
                : "(choisissez un champ)"}
            </FieldLabel>
            <Input
              id="edit-value"
              inputMode="decimal"
              value={session.edit.value}
              onChange={(event) => {
                setNotice("")
                update(
                  changeCalculatorEdit(
                    session,
                    session.edit.field,
                    event.target.value
                  )
                )
              }}
              aria-invalid={!selectionError && session.editErrors.length > 0}
              aria-describedby={`edit-help${!selectionError && session.editErrors.length ? " edit-value-error" : ""}`}
            />
            <FieldDescription id="edit-help">
              Virgule ou point accepté, au plus six décimales. Aucune valeur
              arrondie n'est préremplie. {field && consequences[field]}
            </FieldDescription>
            {!selectionError && session.editErrors.length > 0 && (
              <FieldError id="edit-value-error" role="presentation">
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
              className="public-secondary min-h-11"
              onClick={() => {
                setNotice(
                  "Modification annulée : la cible courante est conservée."
                )
                closePreview(cancelCalculatorEdit(session))
              }}
            >
              Annuler la modification
            </Button>
            <Button
              type="button"
              variant="outline"
              className="public-secondary min-h-11 whitespace-normal"
              onClick={() => {
                setNotice(
                  "Cible originale rétablie. Le brouillon de modification est effacé."
                )
                closePreview(resetCalculatorTarget(session, method))
              }}
            >
              Réinitialiser la cible originale
            </Button>
          </div>
        </FieldSet>
      </form>
      <div aria-live="polite" aria-atomic="true">
        {notice && !session.preview && session.editErrors.length === 0 && (
          <p>{notice}</p>
        )}
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
                  render={
                    <a
                      href={
                        error.code === "MODIFICATION_NON_UNIQUE"
                          ? "#edit-field"
                          : "#edit-value"
                      }
                    />
                  }
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
                    {calculatorTargetFields.map((key) => {
                      const value = session.preview?.[state][key]
                      return (
                        value && (
                          <div key={key}>
                            <dt>{calculatorTargetLabels[key]}</dt>
                            <dd className="tabular-nums">
                              {displayCalculatorValue(value)}{" "}
                              {calculatorTargetUnit(key)}
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
                {calculatorTargetFields.map((key) => {
                  const previous = session.preview?.previous[key]
                  const next = session.preview?.target[key]
                  return (
                    previous &&
                    next && (
                      <div key={key}>
                        <dt>
                          {calculatorTargetLabels[key]} (
                          {calculatorTargetUnit(key)})
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
                onClick={() => {
                  const next = confirmCalculatorEdit(session, method)
                  setNotice("")
                  closePreview(next)
                  if (
                    next.outcome?.ok &&
                    next.currentState === "modified" &&
                    next.editErrors.length === 0 &&
                    next.preview === null
                  )
                    onConfirmed()
                }}
              >
                Confirmer la modification
              </Button>
              <Button
                disabled={!ready}
                variant="outline"
                className="public-secondary min-h-11"
                onClick={() => {
                  setNotice(
                    "Modification annulée : la cible courante est conservée."
                  )
                  closePreview(cancelCalculatorEdit(session))
                }}
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
