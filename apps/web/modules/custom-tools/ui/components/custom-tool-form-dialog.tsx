"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { useEffect } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Textarea } from "@workspace/ui/components/textarea";
import { Switch } from "@workspace/ui/components/switch";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { api } from "@workspace/backend/_generated/api";
import type { Doc } from "@workspace/backend/_generated/dataModel";
import { InfoIcon, MinusIcon, PlusIcon } from "lucide-react";
import {
  type CustomToolFormValues,
  customToolFormSchema,
} from "../../schemas";

type AgentCustomTool = Doc<"agentCustomTools">;

type CustomToolFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: AgentCustomTool | null;
};

const defaultValues: CustomToolFormValues = {
  name: "",
  description: "",
  endpoint: "",
  method: "POST",
  argumentFields: [],
  headers: [],
};

const defaultArgumentField = {
  name: "",
  type: "string" as const,
  description: "",
  schema: "",
  required: false,
};

export const CustomToolFormDialog = ({
  open,
  onOpenChange,
  editing,
}: CustomToolFormDialogProps) => {
  const createTool = useMutation(api.private.agentCustomTools.create);
  const updateTool = useMutation(api.private.agentCustomTools.update);

  const form = useForm<CustomToolFormValues>({
    resolver: zodResolver(customToolFormSchema),
    defaultValues,
  });

  const {
    fields: argumentFieldRows,
    append: appendArgumentField,
    remove: removeArgumentField,
  } = useFieldArray({
    control: form.control,
    name: "argumentFields",
  });

  const {
    fields: headerFields,
    append: appendHeader,
    remove: removeHeader,
  } = useFieldArray({
    control: form.control,
    name: "headers",
  });

  const watchedArgumentFields = useWatch({
    control: form.control,
    name: "argumentFields",
    defaultValue: [],
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    if (editing) {
      form.reset({
        name: editing.name,
        description: editing.description,
        endpoint: editing.endpoint,
        method: editing.method,
        argumentFields: (editing.argumentFields ?? []).map((f) => ({
          name: f.name,
          type: f.type ?? "string",
          description: f.description ?? "",
          schema: f.schema ?? "",
          required: f.required === true,
        })),
        headers: editing.headers?.length ? editing.headers : [],
      });
    } else {
      form.reset(defaultValues);
    }
  }, [open, editing?._id, editing, form.reset]);

  const onSubmit = form.handleSubmit(async (values) => {
    const headers =
      values.headers.length > 0
        ? values.headers.filter((h) => h.key.trim().length > 0)
        : undefined;

    const argumentFields =
      values.argumentFields.length > 0
        ? values.argumentFields
            .filter((a) => a.name.trim().length > 0)
            .map((a) => ({
              name: a.name.trim(),
              type: a.type,
              ...(a.required ? { required: true } : {}),
              ...(a.description?.trim()
                ? { description: a.description.trim() }
                : {}),
              ...(a.schema?.trim() &&
              (a.type === "array" || a.type === "object")
                ? { schema: a.schema.trim() }
                : {}),
            }))
        : [];

    try {
      if (editing) {
        await updateTool({
          toolId: editing._id,
          name: values.name,
          description: values.description,
          endpoint: values.endpoint,
          method: values.method,
          headers,
          argumentFields,
        });
        toast.success("Tool updated");
      } else {
        await createTool({
          name: values.name,
          description: values.description,
          endpoint: values.endpoint,
          method: values.method,
          headers,
          argumentFields,
        });
        toast.success("Tool created");
      }
      onOpenChange(false);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Something went wrong. Try again.";
      toast.error(message);
    }
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] min-w-0 overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit custom tool" : "New custom tool"}
          </DialogTitle>
          <DialogDescription>
            You define argument <span className="font-mono text-foreground">names</span>{" "}
            (and optional hints); the model fills values from the chat. Leave
            arguments empty to allow any key-value payload. Tools appear as{" "}
            <span className="font-mono text-foreground">custom_…</span> to the model.
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-muted-foreground/20 bg-muted/40 py-3">
          <InfoIcon aria-hidden className="text-muted-foreground" />
          <AlertTitle className="text-foreground">
            Authenticated endpoints
          </AlertTitle>
          <AlertDescription className="space-y-2 text-muted-foreground">
            <p>
              If your API expects a static token or API key, add it below. Common
              patterns:
            </p>
            <ul className="list-none space-y-1.5 border-l-2 border-muted-foreground/25 pl-3 font-mono text-xs text-foreground">
              <li>
                <span className="text-muted-foreground">Authorization</span> →{" "}
                <span className="break-all">Bearer &lt;token&gt;</span>
              </li>
              <li>
                <span className="text-muted-foreground">X-Api-Key</span> →{" "}
                <span className="break-all">&lt;key&gt;</span>{" "}
                <span className="font-sans text-muted-foreground">
                  (or any name your server documents)
                </span>
              </li>
            </ul>
            <p className="text-xs">
              Skip headers when the endpoint is public or handles auth another
              way.
            </p>
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form className="space-y-4" onSubmit={onSubmit}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tool name</FormLabel>
                  <FormControl>
                    <Input
                      className="font-mono"
                      placeholder="rechargeTokens"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Identifier the model uses (letters, numbers, underscores).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[88px] resize-y"
                      placeholder="When the user asks to add credits, call this to recharge their token balance."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endpoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endpoint URL</FormLabel>
                  <FormControl>
                    <Input
                      className="font-mono text-sm"
                      placeholder="https://api.example.com/v1/recharge"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Must be https (http allowed only for localhost).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>HTTP method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="GET">GET (query parameters)</SelectItem>
                      <SelectItem value="POST">POST (JSON body)</SelectItem>
                      <SelectItem value="PUT">PUT (JSON body)</SelectItem>
                      <SelectItem value="PATCH">PATCH (JSON body)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel className="text-foreground">Arguments</FormLabel>
                <Button
                  className="gap-1"
                  onClick={() => appendArgumentField({ ...defaultArgumentField })}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <PlusIcon className="size-3.5" />
                  Add argument
                </Button>
              </div>
              <p className="text-muted-foreground text-sm">
                Name, type, hint, and whether the argument is required—the model
                fills values from the chat.
              </p>
              <div className="space-y-3">
                {argumentFieldRows.map((row, index) => {
                  const argType = watchedArgumentFields?.[index]?.type;
                  const showSchema = argType === "array" || argType === "object";
                  return (
                    <div
                      className="space-y-2 rounded-lg border border-border/60 bg-muted/25 p-3"
                      key={row.id}
                    >
                      <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,30%)_minmax(0,20%)_minmax(0,1fr)_auto] sm:items-end">
                        <FormField
                          control={form.control}
                          name={`argumentFields.${index}.name`}
                          render={({ field }) => (
                            <FormItem className="min-w-0">
                              <FormControl>
                                <Input
                                  className="w-full min-w-0 font-mono text-sm"
                                  placeholder="userId"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`argumentFields.${index}.type`}
                          render={({ field }) => (
                            <FormItem className="min-w-0">
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-8 w-full min-w-0 max-w-full justify-between">
                                    <SelectValue placeholder="Type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="string">String</SelectItem>
                                  <SelectItem value="number">Number</SelectItem>
                                  <SelectItem value="integer">Integer</SelectItem>
                                  <SelectItem value="boolean">Boolean</SelectItem>
                                  <SelectItem value="array">Array</SelectItem>
                                  <SelectItem value="object">Object</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`argumentFields.${index}.description`}
                          render={({ field }) => (
                            <FormItem className="min-w-0">
                              <FormControl>
                                <Input
                                  className="w-full min-w-0 max-w-full text-sm"
                                  placeholder="Hint (optional)"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end sm:block sm:justify-self-start">
                          <Button
                            aria-label="Remove argument"
                            className="shrink-0"
                            onClick={() => removeArgumentField(index)}
                            size="icon"
                            type="button"
                            variant="ghost"
                          >
                            <MinusIcon className="size-4" />
                          </Button>
                        </div>
                      </div>
                      <FormField
                        control={form.control}
                        name={`argumentFields.${index}.required`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between gap-3 rounded-md border border-border/50 bg-background/50 px-3 py-2">
                            <div className="space-y-0.5">
                              <FormLabel className="text-foreground text-sm font-normal">
                                Required argument
                              </FormLabel>
                              <FormDescription className="text-xs">
                                When on, the tool description tells the model to
                                call only once this value is known (it may omit
                                the field while asking the customer).
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      {showSchema ? (
                        <FormField
                          control={form.control}
                          name={`argumentFields.${index}.schema`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-muted-foreground text-xs font-normal">
                                Shape / JSON Schema
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  className="min-h-[88px] resize-y font-mono text-xs"
                                  placeholder={`e.g. {"type":"array","items":{"type":"string"}}\nor describe fields in plain language`}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="text-xs">
                                Shown to the model so it matches your API. JSON
                                Schema is optional; plain-English structure works too.
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel className="text-foreground">Headers</FormLabel>
                <Button
                  className="gap-1"
                  onClick={() => appendHeader({ key: "", value: "" })}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <PlusIcon className="size-3.5" />
                  Add header
                </Button>
              </div>
              <p className="text-muted-foreground text-sm">
                Optional static headers (for example{" "}
                <span className="font-mono">Authorization</span>). Store secrets
                carefully.
              </p>
              <div className="space-y-2">
                {headerFields.map((row, index) => (
                  <div className="flex gap-2" key={row.id}>
                    <FormField
                      control={form.control}
                      name={`headers.${index}.key`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input className="font-mono text-sm" placeholder="Name" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`headers.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input className="font-mono text-sm" placeholder="Value" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      aria-label="Remove header"
                      className="shrink-0"
                      onClick={() => removeHeader(index)}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <MinusIcon className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={() => onOpenChange(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button type="submit">
                {editing ? "Save changes" : "Create tool"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
