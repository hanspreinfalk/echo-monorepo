"use client"

import * as React from "react"
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form"

import { cn } from "@workspace/ui/lib/utils"
import { Label } from "@workspace/ui/components/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = fieldContext.name
    ? getFieldState(fieldContext.name, formState)
    : null

  const id = itemContext.id || ""
  const base = {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
  }
  if (!fieldContext.name || !fieldState) {
    return { ...base, invalid: false, error: undefined }
  }
  return { ...base, ...fieldState }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId()
  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("flex flex-col gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  )
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  const { formItemId } = useFormField()
  return (
    <Label
      data-slot="form-label"
      className={cn(className)}
      htmlFor={formItemId}
      {...props}
    />
  )
}

function FormControl({
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { formItemId, formDescriptionId, formMessageId, invalid } = useFormField()
  const child = React.Children.only(children) as React.ReactElement
  return (
    <div data-slot="form-control" {...props}>
      {React.cloneElement(child, {
        id: formItemId,
        "aria-describedby": [formDescriptionId, formMessageId]
          .filter(Boolean)
          .join(" ")
          || undefined,
        "aria-invalid": invalid,
      } as React.Attributes)}
    </div>
  )
}

function FormMessage({
  className,
  children,
  ...props
}: React.ComponentProps<"p">) {
  const { formMessageId, error } = useFormField()
  const body = error?.message ?? children
  if (!body) return null
  return (
    <p
      id={formMessageId}
      data-slot="form-message"
      className={cn("text-sm font-normal text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
}

export {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
}
