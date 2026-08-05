"use client";

import * as React from "react";
import { CheckIcon, CopyIcon, ExternalLinkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildIssueUrl, submissionSchema, submissionToMarkdown } from "@/lib/board";

type FieldErrors = Partial<Record<string, string>>;

const EMPTY_FORM = {
  gameName: "",
  studioName: "",
  website: "",
  pitch: "",
  merchAngle: "",
  contact: "",
};

export function SubmissionForm() {
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [copied, setCopied] = React.useState(false);

  function set<K extends keyof typeof EMPTY_FORM>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const result = submissionSchema.safeParse(form);
    if (result.success) {
      setErrors({});
      return result.data;
    }
    const next: FieldErrors = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (!next[key]) next[key] = issue.message;
    }
    setErrors(next);
    return null;
  }

  function submitViaGitHub(event: React.FormEvent) {
    event.preventDefault();
    const data = validate();
    if (!data) return;
    window.open(buildIssueUrl(data), "_blank", "noopener,noreferrer");
  }

  async function copySubmission() {
    const data = validate();
    if (!data) return;
    try {
      await navigator.clipboard.writeText(submissionToMarkdown(data));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard unavailable; the GitHub route still works.
    }
  }

  return (
    <form onSubmit={submitViaGitHub} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Game name" id="gameName" error={errors.gameName} required>
          <Input
            id="gameName"
            value={form.gameName}
            onChange={(e) => set("gameName", e.target.value)}
            maxLength={120}
            aria-invalid={Boolean(errors.gameName)}
          />
        </Field>
        <Field label="Studio name" id="studioName" error={errors.studioName} required>
          <Input
            id="studioName"
            value={form.studioName}
            onChange={(e) => set("studioName", e.target.value)}
            maxLength={120}
            aria-invalid={Boolean(errors.studioName)}
          />
        </Field>
        <Field label="Website (optional)" id="website" error={errors.website}>
          <Input
            id="website"
            type="url"
            placeholder="https://yourstudio.com"
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
            maxLength={300}
            aria-invalid={Boolean(errors.website)}
          />
        </Field>
        <Field label="Contact (email or social handle)" id="contact" error={errors.contact} required>
          <Input
            id="contact"
            value={form.contact}
            onChange={(e) => set("contact", e.target.value)}
            maxLength={200}
            aria-invalid={Boolean(errors.contact)}
          />
        </Field>
      </div>
      <Field
        label="Tell us about your game"
        id="pitch"
        error={errors.pitch}
        required
        hint="What is it, who plays it, and why do fans love it? 30–2000 characters."
      >
        <textarea
          id="pitch"
          value={form.pitch}
          onChange={(e) => set("pitch", e.target.value)}
          maxLength={2000}
          rows={5}
          aria-invalid={Boolean(errors.pitch)}
          className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2"
        />
      </Field>
      <Field
        label="Merch angle (optional)"
        id="merchAngle"
        error={errors.merchAngle}
        hint="Characters, symbols, or products you think would sell — helps us rate faster."
      >
        <textarea
          id="merchAngle"
          value={form.merchAngle}
          onChange={(e) => set("merchAngle", e.target.value)}
          maxLength={1000}
          rows={3}
          className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2"
        />
      </Field>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit">
          <ExternalLinkIcon aria-hidden />
          Submit via GitHub
        </Button>
        <Button type="button" variant="outline" onClick={copySubmission}>
          {copied ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
          {copied ? "Copied" : "Copy as text"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        “Submit via GitHub” opens a prefilled issue on the LootSignal repository (a free GitHub
        account is required — that keeps submissions attributable and spam-resistant). No GitHub
        account? Use “Copy as text” and send it to the research team through any channel you
        already share.
      </p>
    </form>
  );
}

function Field({
  label,
  id,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>
        {label}
        {required && (
          <span aria-hidden className="text-warning-risk">
            *
          </span>
        )}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs text-warning-risk">
          {error}
        </p>
      )}
    </div>
  );
}
