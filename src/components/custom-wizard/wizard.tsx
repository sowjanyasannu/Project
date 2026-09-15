"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileUploadField, type UploadedFile } from "@/components/custom-wizard/file-upload-field";
import { QuantityMatrix, type MatrixRow } from "@/components/custom-wizard/quantity-matrix";
import { buildWhatsAppLink, customRequestMessage } from "@/lib/whatsapp";
import {
  UNIFORM_TYPES,
  FABRIC_OPTIONS,
  LOGO_PLACEMENTS,
  BRANDING_METHODS,
  GARMENT_MEASUREMENTS,
  wearerOptions,
  matrixColumns,
  sizesForUniformType,
  uniformCategoryGroup,
} from "@/lib/custom-wizard-options";
import type { CustomizationOption, GarmentOption } from "@/types/database";

type RequestType = "custom_uniform" | "bulk_order";

interface WizardState {
  customizationOptions: string[];
  referenceFiles: UploadedFile[];
  logoFiles: UploadedFile[];
  organizationName: string;
  customerName: string;
  email: string;
  phone: string;
  whatsapp: string;
  city: string;
  state: string;
  uniformType: string;
  wearerType: string;
  garments: string[];
  matrix: MatrixRow[];
  measurementMode: "standard" | "custom";
  standardSize: string;
  customMeasurements: Record<string, Record<string, string>>;
  measurementUnit: "cm" | "inch";
  fabricPreference: string;
  colourPreference: string;
  brandingPlacement: string;
  brandingMethod: string;
  deliveryDate: string;
  deliveryLocation: string;
  additionalNotes: string;
}

const STEP_LABELS = [
  "Customization",
  "Upload Reference",
  "Your Details",
  "Garments",
  "Sizes & Quantity",
  "Measurements",
  "Branding & Delivery",
  "Review",
];

export function CustomRequestWizard({
  requestType,
  draftId,
  customizationOptions,
  garmentOptions,
  initialUniformType,
  sourceProductId,
}: {
  requestType: RequestType;
  draftId: string;
  customizationOptions: CustomizationOption[];
  garmentOptions: GarmentOption[];
  initialUniformType?: string;
  sourceProductId?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState<{ requestNumber: string; totalQuantity: number } | null>(null);

  const [state, setState] = useState<WizardState>({
    customizationOptions: [],
    referenceFiles: [],
    logoFiles: [],
    organizationName: "",
    customerName: "",
    email: "",
    phone: "",
    whatsapp: "",
    city: "",
    state: "",
    uniformType: initialUniformType ?? "",
    wearerType: "",
    garments: [],
    matrix: [],
    measurementMode: "standard",
    standardSize: "M",
    customMeasurements: {},
    measurementUnit: "inch",
    fabricPreference: "",
    colourPreference: "",
    brandingPlacement: "",
    brandingMethod: "",
    deliveryDate: "",
    deliveryLocation: "",
    additionalNotes: "",
  });

  function set<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  const garmentGroup = uniformCategoryGroup(state.uniformType);
  const availableGarments = useMemo(
    () => garmentOptions.filter((g) => g.category_group === garmentGroup),
    [garmentOptions, garmentGroup]
  );
  const columns = matrixColumns(state.uniformType, state.wearerType);
  const sizes = sizesForUniformType(state.uniformType);
  const totalQuantity = state.matrix.reduce(
    (sum, row) => sum + columns.reduce((s, c) => s + Number(row[c] ?? 0), 0),
    0
  );

  function toggle(list: string[], value: string): string[] {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  }

  function validateStep(): string | null {
    if (step === 2) {
      if (!state.customerName || !state.email || !state.phone || !state.uniformType) {
        return "Please fill in your contact details and uniform type.";
      }
    }
    if (step === 3 && state.garments.length === 0) {
      return "Please select at least one garment.";
    }
    if (step === 3 && !state.wearerType) {
      return "Please select who this is for.";
    }
    return null;
  }

  function goNext() {
    const error = validateStep();
    if (error) {
      toast.error(error);
      return;
    }
    setStep((s) => Math.min(STEP_LABELS.length - 1, s + 1));
  }

  function submit() {
    const measurements = Object.entries(state.customMeasurements).map(([garment_type, fields]) => ({
      garment_type,
      unit: state.measurementUnit,
      measurements: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, Number(v) || 0])),
    }));

    const payload = {
      request_type: requestType,
      customer_name: state.customerName,
      organization_name: state.organizationName || undefined,
      email: state.email,
      phone: state.phone,
      whatsapp_number: state.whatsapp || undefined,
      city: state.city || undefined,
      state: state.state || undefined,
      uniform_type: state.uniformType,
      wearer_type: state.wearerType || undefined,
      garments: state.garments,
      customization_options: state.customizationOptions,
      fabric_preference: state.fabricPreference || undefined,
      colour_preference: state.colourPreference || undefined,
      branding_placement: state.brandingPlacement || undefined,
      branding_method: state.brandingMethod || undefined,
      measurement_mode: state.measurementMode,
      size_quantity_matrix: state.matrix,
      measurements: state.measurementMode === "custom" ? measurements : [],
      delivery_date: state.deliveryDate || undefined,
      delivery_location: state.deliveryLocation || undefined,
      additional_notes: state.additionalNotes || undefined,
      source_product_id: sourceProductId,
      uploaded_file_urls: [...state.referenceFiles, ...state.logoFiles].map((f) => ({
        url: f.path,
        name: f.name,
        purpose: f.purpose,
      })),
    };

    startTransition(async () => {
      const res = await fetch("/api/custom-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSubmitted({ requestNumber: data.requestNumber, totalQuantity: data.totalQuantity });
    });
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border p-8 text-center">
        <CheckCircle2 className="mx-auto size-12 text-emerald-600" />
        <h2 className="mt-4 font-heading text-xl font-bold text-brand-navy">Requirement Submitted Successfully</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Thank you for sharing your requirements with Jobert Apparels. Our team will review your request and
          contact you shortly.
        </p>
        <p className="mt-4 text-sm">
          Request ID: <span className="font-semibold">{submitted.requestNumber}</span>
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            render={
              <a
                href={buildWhatsAppLink(
                  customRequestMessage({
                    requestNumber: submitted.requestNumber,
                    organization: state.organizationName,
                    uniformType: state.uniformType,
                    wearerType: state.wearerType,
                    totalQuantity: submitted.totalQuantity,
                    customizationOptions: state.customizationOptions,
                  })
                )}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            Continue on WhatsApp
          </Button>
          <Button variant="outline" render={<Link href="/account/custom-requests" />}>
            Track Request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap gap-1.5 text-[11px] font-medium">
        {STEP_LABELS.map((label, i) => (
          <span
            key={label}
            className={cn(
              "rounded-full border px-2.5 py-1",
              i === step ? "border-brand-navy bg-brand-navy text-white" : i < step ? "border-brand-navy text-brand-navy" : "text-muted-foreground"
            )}
          >
            {i + 1}. {label}
          </span>
        ))}
      </div>

      <div className="rounded-xl border p-6">
        {step === 0 && (
          <div>
            <h2 className="font-heading text-lg font-semibold text-brand-navy">What kind of customization do you need?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Select all that apply.</p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {customizationOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => set("customizationOptions", toggle(state.customizationOptions, opt.label))}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-left text-sm",
                    state.customizationOptions.includes(opt.label)
                      ? "border-brand-navy bg-brand-navy/5 font-medium text-brand-navy"
                      : "hover:border-brand-navy"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="font-heading text-lg font-semibold text-brand-navy">Upload Your Design / Reference</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload an image of your existing uniform, logo, design, colour reference or any sample that will
              help us understand your requirement.
            </p>
            <div className="mt-4">
              <FileUploadField
                draftId={draftId}
                purpose="reference"
                label="Reference Images / Files"
                description="JPG, PNG, WEBP, PDF or SVG. You can upload multiple files."
                files={state.referenceFiles}
                onChange={(files) => set("referenceFiles", files)}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-heading text-lg font-semibold text-brand-navy">Tell us more about your requirement</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Organization / School Name</Label>
                <Input value={state.organizationName} onChange={(e) => set("organizationName", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Contact Person *</Label>
                <Input value={state.customerName} onChange={(e) => set("customerName", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Mobile Number *</Label>
                <Input value={state.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>WhatsApp Number</Label>
                <Input value={state.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input type="email" value={state.email} onChange={(e) => set("email", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input value={state.city} onChange={(e) => set("city", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>State</Label>
                <Input value={state.state} onChange={(e) => set("state", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>What do you need? *</Label>
              <div className="flex flex-wrap gap-2">
                {UNIFORM_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      set("uniformType", type);
                      set("wearerType", "");
                      set("garments", []);
                    }}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm",
                      state.uniformType === type ? "border-brand-navy bg-brand-navy text-white" : "hover:border-brand-navy"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-lg font-semibold text-brand-navy">Who is this for?</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {wearerOptions(state.uniformType).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => set("wearerType", w)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm",
                      state.wearerType === w ? "border-brand-navy bg-brand-navy text-white" : "hover:border-brand-navy"
                    )}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold text-brand-navy">Which garments do you need?</h2>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {availableGarments.map((g) => (
                  <label key={g.id} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={state.garments.includes(g.label)}
                      onChange={() => set("garments", toggle(state.garments, g.label))}
                    />
                    {g.label}
                  </label>
                ))}
                {availableGarments.length === 0 && (
                  <p className="col-span-full text-sm text-muted-foreground">Select a uniform type first.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="font-heading text-lg font-semibold text-brand-navy">Size &amp; Quantity</h2>
            <p className="mt-1 text-sm text-muted-foreground">Enter quantities for each size.</p>
            <div className="mt-4">
              <QuantityMatrix sizes={sizes} columns={columns} rows={state.matrix} onChange={(rows) => set("matrix", rows)} />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-lg font-semibold text-brand-navy">Measurements</h2>
              <RadioGroup
                className="mt-3"
                value={state.measurementMode}
                onValueChange={(v) => set("measurementMode", v as "standard" | "custom")}
              >
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="standard" /> I will use the standard Jobert size chart
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="custom" /> I want to provide custom measurements
                </label>
              </RadioGroup>

              {state.measurementMode === "standard" ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set("standardSize", s)}
                      className={cn(
                        "rounded-md border px-3 py-1.5 text-sm",
                        state.standardSize === s ? "border-brand-navy bg-brand-navy text-white" : "hover:border-brand-navy"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <span>Units:</span>
                    <RadioGroup
                      className="flex flex-row gap-3"
                      value={state.measurementUnit}
                      onValueChange={(v) => set("measurementUnit", v as "cm" | "inch")}
                    >
                      <label className="flex items-center gap-1.5"><RadioGroupItem value="inch" /> Inches</label>
                      <label className="flex items-center gap-1.5"><RadioGroupItem value="cm" /> CM</label>
                    </RadioGroup>
                  </div>
                  {state.garments.map((garment) => {
                    const fields = GARMENT_MEASUREMENTS[garment] ?? ["Chest", "Waist", "Length"];
                    return (
                      <div key={garment}>
                        <p className="text-sm font-medium">{garment}</p>
                        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {fields.map((field) => (
                            <div key={field} className="space-y-1">
                              <Label className="text-xs">{field}</Label>
                              <Input
                                type="number"
                                value={state.customMeasurements[garment]?.[field] ?? ""}
                                onChange={(e) =>
                                  set("customMeasurements", {
                                    ...state.customMeasurements,
                                    [garment]: { ...state.customMeasurements[garment], [field]: e.target.value },
                                  })
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Fabric Preference</Label>
                <div className="flex flex-wrap gap-2">
                  {FABRIC_OPTIONS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => set("fabricPreference", f)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs",
                        state.fabricPreference === f ? "border-brand-navy bg-brand-navy text-white" : "hover:border-brand-navy"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Colour Preference</Label>
                <Input
                  value={state.colourPreference}
                  onChange={(e) => set("colourPreference", e.target.value)}
                  placeholder="e.g. Navy blue with red trim"
                />
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-lg font-semibold text-brand-navy">Logo &amp; Branding</h2>
              <div className="mt-3">
                <FileUploadField
                  draftId={draftId}
                  purpose="logo"
                  label="Upload Logo"
                  description="PNG, JPG, PDF or SVG."
                  files={state.logoFiles}
                  onChange={(files) => set("logoFiles", files)}
                  multiple={false}
                />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Logo Placement</Label>
                  <div className="flex flex-wrap gap-2">
                    {LOGO_PLACEMENTS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => set("brandingPlacement", p)}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-xs",
                          state.brandingPlacement === p ? "border-brand-navy bg-brand-navy text-white" : "hover:border-brand-navy"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Branding Method</Label>
                  <div className="flex flex-wrap gap-2">
                    {BRANDING_METHODS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => set("brandingMethod", m)}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-xs",
                          state.brandingMethod === m ? "border-brand-navy bg-brand-navy text-white" : "hover:border-brand-navy"
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Required Delivery Date</Label>
                <Input type="date" value={state.deliveryDate} onChange={(e) => set("deliveryDate", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Delivery Location</Label>
                <Input value={state.deliveryLocation} onChange={(e) => set("deliveryLocation", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Additional Instructions</Label>
              <Textarea
                value={state.additionalNotes}
                onChange={(e) => set("additionalNotes", e.target.value)}
                placeholder="Tell us anything else we should know about your requirement."
              />
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-4">
            <h2 className="font-heading text-lg font-semibold text-brand-navy">Review Your Request</h2>
            <dl className="space-y-2 text-sm">
              <Row label="Organization" value={state.organizationName || "—"} />
              <Row label="Contact" value={`${state.customerName} · ${state.phone} · ${state.email}`} />
              <Row label="Uniform" value={state.uniformType} />
              <Row label="For" value={state.wearerType} />
              <Row label="Customization" value={state.customizationOptions.join(", ") || "—"} />
              <Row label="Garments" value={state.garments.join(", ") || "—"} />
              <Row label="Total Quantity" value={String(totalQuantity)} />
              <Row label="Fabric" value={state.fabricPreference || "—"} />
              <Row label="Colour" value={state.colourPreference || "—"} />
              <Row label="Branding" value={[state.brandingPlacement, state.brandingMethod].filter(Boolean).join(" · ") || "—"} />
              <Row label="Reference Images" value={`${state.referenceFiles.length} uploaded`} />
              <Row label="Logo" value={`${state.logoFiles.length} uploaded`} />
              <Row label="Delivery" value={state.deliveryLocation || "—"} />
              <Row label="Required By" value={state.deliveryDate || "—"} />
            </dl>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
            Back
          </Button>
          {step < STEP_LABELS.length - 1 ? (
            <Button onClick={goNext}>Continue</Button>
          ) : (
            <Button disabled={pending} onClick={submit}>
              {pending ? "Submitting…" : "Submit Requirement"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b py-2 last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="max-w-[60%] text-right font-medium">{value}</dd>
    </div>
  );
}
