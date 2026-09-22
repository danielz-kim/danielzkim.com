"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Reorder, useDragControls } from "framer-motion";
import type { WorkHistoryEntry } from "@/lib/types";

type Tab = "writing" | "work" | "projects" | "reading";

// ── helpers ──────────────────────────────────────────────────────────────────

function apiFetch(url: string, password: string, options?: RequestInit) {
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-password": password,
      ...(options?.headers ?? {}),
    },
  });
}

function titleToSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function tagsToArray(str: string): string[] {
  return str
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

// ── types ────────────────────────────────────────────────────────────────────

interface WritingMeta {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  readTime: string;
  excerpt: string;
}

interface Project {
  name: string;
  kind: string;
  description: string;
  status: "profitable" | "active" | "in development" | "archived";
  stat?: string | null;
  tags: string[];
  url?: string;
  featured: boolean;
  previewImage?: string;
  caseStudy?: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  status: "wishlist" | "in-progress" | "finished";
  year?: number | null;
  rating?: number | null;
  notes?: string;
  addedAt: string;
}

interface OpenLibraryResult {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
}

// ── defaults ─────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().split("T")[0];

const defaultWriting = {
  slug: "",
  title: "",
  date: today(),
  tags: "",
  readTime: "5 min",
  excerpt: "",
  content: "",
};

const defaultWork = {
  slug: "",
  title: "",
  subtitle: "",
  company: "",
  date: today(),
  tags: "",
  featured: false,
  readTime: "5 min",
  coverImage: "",
  content: "",
};

const defaultWorkEntry: WorkHistoryEntry = {
  company: "",
  period: "",
  role: "",
  desc: "",
  type: "Employment",
  badgeType: "dark",
  showBadge: false,
  href: "",
};

const defaultProject: {
  name: string;
  kind: string;
  description: string;
  status: Project["status"];
  stat: string;
  tags: string;
  url: string;
  featured: boolean;
  previewImage: string;
  caseStudy: string;
} = {
  name: "",
  kind: "",
  description: "",
  status: "active",
  stat: "",
  tags: "",
  url: "",
  featured: false,
  previewImage: "",
  caseStudy: "",
};

const defaultBook: {
  title: string;
  author: string;
  coverUrl: string;
  status: Book["status"];
  year: string;
  rating: number | null;
  notes: string;
} = {
  title: "",
  author: "",
  coverUrl: "",
  status: "wishlist",
  year: "",
  rating: null,
  notes: "",
};

// ── shared input styles ───────────────────────────────────────────────────────

const inputCls =
  "w-full border border-neutral-200 rounded px-3 py-2 text-sm text-primary bg-white focus:outline-none focus:border-primary transition-colors";

const labelCls = "block text-xs text-secondary mb-1";

// ── sub-components ────────────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function FormActions({
  saving,
  onSave,
  onCancel,
}: {
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <button
        onClick={onSave}
        disabled={saving}
        className="bg-primary text-white text-sm px-4 py-2 rounded hover:bg-neutral-800 disabled:opacity-50 transition-colors"
      >
        {saving ? "Saving…" : "Save"}
      </button>
      <button
        onClick={onCancel}
        className="text-sm text-secondary hover:text-primary transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}

function WritingForm({
  form,
  setForm,
  isNew,
  saving,
  onSave,
  onCancel,
}: {
  form: typeof defaultWriting;
  setForm: (f: typeof defaultWriting) => void;
  isNew: boolean;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  function set(field: keyof typeof defaultWriting, value: string) {
    setForm({ ...form, [field]: value });
  }

  function handleTitleChange(title: string) {
    const auto =
      form.slug === "" || form.slug === titleToSlug(form.title);
    setForm({
      ...form,
      title,
      slug: auto ? titleToSlug(title) : form.slug,
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="font-heading font-light text-lg text-primary">
        {isNew ? "New post" : "Edit post"}
      </h2>

      <Field label="Title">
        <input
          className={inputCls}
          value={form.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="What chess has taught me about the world"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Slug">
          <input
            className={inputCls}
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="chess-and-the-world"
            disabled={!isNew}
          />
        </Field>
        <Field label="Date">
          <input
            className={inputCls}
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Read time">
          <input
            className={inputCls}
            value={form.readTime}
            onChange={(e) => set("readTime", e.target.value)}
            placeholder="5 min"
          />
        </Field>
        <Field label="Tags (comma-separated)">
          <input
            className={inputCls}
            value={form.tags}
            onChange={(e) => set("tags", e.target.value)}
            placeholder="chess, thinking, mental models"
          />
        </Field>
      </div>

      <Field label="Excerpt">
        <textarea
          className={`${inputCls} resize-none`}
          rows={2}
          value={form.excerpt}
          onChange={(e) => set("excerpt", e.target.value)}
          placeholder="One-line hook shown in the writing list…"
        />
      </Field>

      <Field label="Content (MDX)">
        <textarea
          className={`${inputCls} font-mono text-xs resize-y`}
          rows={20}
          value={form.content}
          onChange={(e) => set("content", e.target.value)}
          placeholder="Start writing in Markdown / MDX…"
          spellCheck={false}
        />
      </Field>

      <FormActions saving={saving} onSave={onSave} onCancel={onCancel} />
    </div>
  );
}

function WorkForm({
  form,
  setForm,
  isNew,
  saving,
  onSave,
  onCancel,
}: {
  form: typeof defaultWork;
  setForm: (f: typeof defaultWork) => void;
  isNew: boolean;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  function set(field: keyof typeof defaultWork, value: string | boolean) {
    setForm({ ...form, [field]: value });
  }

  function handleTitleChange(title: string) {
    const auto =
      form.slug === "" || form.slug === titleToSlug(form.title);
    setForm({
      ...form,
      title,
      slug: auto ? titleToSlug(title) : form.slug,
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="font-heading font-light text-lg text-primary">
        {isNew ? "New case study" : "Edit case study"}
      </h2>

      <Field label="Title">
        <input
          className={inputCls}
          value={form.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="When human behavior changes…"
        />
      </Field>

      <Field label="Subtitle">
        <input
          className={inputCls}
          value={form.subtitle}
          onChange={(e) => set("subtitle", e.target.value)}
          placeholder="How research reshaped the product roadmap"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Company">
          <input
            className={inputCls}
            value={form.company}
            onChange={(e) => set("company", e.target.value)}
            placeholder="Beats by Dre"
          />
        </Field>
        <Field label="Date">
          <input
            className={inputCls}
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Slug">
          <input
            className={inputCls}
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="beats"
            disabled={!isNew}
          />
        </Field>
        <Field label="Read time">
          <input
            className={inputCls}
            value={form.readTime}
            onChange={(e) => set("readTime", e.target.value)}
            placeholder="5 min"
          />
        </Field>
      </div>

      <Field label="Tags (comma-separated)">
        <input
          className={inputCls}
          value={form.tags}
          onChange={(e) => set("tags", e.target.value)}
          placeholder="hardware, consumer research, product strategy"
        />
      </Field>

      <Field label="Cover image URL (optional)">
        <input
          className={inputCls}
          value={form.coverImage}
          onChange={(e) => set("coverImage", e.target.value)}
          placeholder="/images/beats-cover.jpg"
        />
      </Field>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.featured}
          onChange={(e) => set("featured", e.target.checked)}
          className="accent-primary"
        />
        <span className="text-sm text-secondary">Featured on homepage</span>
      </label>

      <Field label="Content (MDX)">
        <textarea
          className={`${inputCls} font-mono text-xs resize-y`}
          rows={20}
          value={form.content}
          onChange={(e) => set("content", e.target.value)}
          placeholder="Start writing in Markdown / MDX…"
          spellCheck={false}
        />
      </Field>

      <FormActions saving={saving} onSave={onSave} onCancel={onCancel} />
    </div>
  );
}

function WorkEntryForm({
  form,
  setForm,
  isNew,
  saving,
  onSave,
  onCancel,
  showCaseStudyEditor,
  caseStudyIsNew,
  caseStudyForm,
  setCaseStudyForm,
  onAddCaseStudy,
  onEditCaseStudy,
  onRemoveCaseStudy,
  onSaveCaseStudy,
  onCancelCaseStudy,
}: {
  form: WorkHistoryEntry;
  setForm: (f: WorkHistoryEntry) => void;
  isNew: boolean;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
  showCaseStudyEditor: boolean;
  caseStudyIsNew: boolean;
  caseStudyForm: typeof defaultWork;
  setCaseStudyForm: (f: typeof defaultWork) => void;
  onAddCaseStudy: () => void;
  onEditCaseStudy: () => void;
  onRemoveCaseStudy: () => void;
  onSaveCaseStudy: () => void;
  onCancelCaseStudy: () => void;
}) {
  function set(field: keyof WorkHistoryEntry, value: string | boolean) {
    setForm({ ...form, [field]: value });
  }

  function setType(type: string) {
    setForm({
      ...form,
      type,
      badgeType: type === "Contract" ? "light" : "dark",
      showBadge: type === "Contract",
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="font-heading font-light text-lg text-primary">
        {isNew ? "New role" : "Edit role"}
      </h2>

      <Field label="Company">
        <input
          className={inputCls}
          value={form.company}
          onChange={(e) => set("company", e.target.value)}
          placeholder="Nightfall Health"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Role">
          <input
            className={inputCls}
            value={form.role}
            onChange={(e) => set("role", e.target.value)}
            placeholder="Founding Product Manager"
          />
        </Field>
        <Field label="Period">
          <input
            className={inputCls}
            value={form.period}
            onChange={(e) => set("period", e.target.value)}
            placeholder="MAY 2026 — PRESENT"
          />
        </Field>
      </div>

      <Field label="Type">
        <select
          className={inputCls}
          value={form.type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="Employment">Employment</option>
          <option value="Contract">Contract</option>
        </select>
      </Field>

      <Field label="Description (optional)">
        <textarea
          className={`${inputCls} resize-none`}
          rows={2}
          value={form.desc}
          onChange={(e) => set("desc", e.target.value)}
          placeholder="One line shown under the role…"
        />
      </Field>

      <FormActions saving={saving} onSave={onSave} onCancel={onCancel} />

      {!isNew && (
        <div className="pt-4 mt-4 border-t border-neutral-200">
          <h3 className="text-sm font-medium text-primary mb-2">Case study</h3>

          {!showCaseStudyEditor && form.href && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-secondary">
                Published at {form.href}
              </span>
              <button
                onClick={onEditCaseStudy}
                className="text-xs text-primary underline"
              >
                Edit
              </button>
              <button
                onClick={onRemoveCaseStudy}
                className="text-xs text-red-500 underline"
              >
                Remove
              </button>
            </div>
          )}

          {!showCaseStudyEditor && !form.href && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-tertiary">
                No case study yet — the &ldquo;See Work&rdquo; link stays hidden
                until one is added.
              </span>
              <button
                onClick={onAddCaseStudy}
                className="text-xs bg-primary text-white px-3 py-1.5 rounded hover:bg-neutral-800 transition-colors shrink-0"
              >
                + Add case study
              </button>
            </div>
          )}

          {showCaseStudyEditor && (
            <div className="mt-3 bg-neutral-50 border border-neutral-200 rounded-lg p-4">
              <WorkForm
                form={caseStudyForm}
                setForm={setCaseStudyForm}
                isNew={caseStudyIsNew}
                saving={saving}
                onSave={onSaveCaseStudy}
                onCancel={onCancelCaseStudy}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProjectForm({
  form,
  setForm,
  isNew,
  saving,
  onSave,
  onCancel,
}: {
  form: typeof defaultProject;
  setForm: (f: typeof defaultProject) => void;
  isNew: boolean;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  function set(field: keyof typeof defaultProject, value: string | boolean) {
    setForm({ ...form, [field]: value });
  }

  return (
    <div className="space-y-4">
      <h2 className="font-heading font-light text-lg text-primary">
        {isNew ? "New project" : "Edit project"}
      </h2>

      <Field label="Name">
        <input
          className={inputCls}
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="NIA — Neurotech Intelligence Agency"
          disabled={!isNew}
        />
      </Field>

      <Field label="Kind">
        <input
          className={inputCls}
          value={form.kind}
          onChange={(e) => set("kind", e.target.value)}
          placeholder="Neurotech · SaaS"
        />
      </Field>

      <Field label="Description">
        <textarea
          className={`${inputCls} resize-none`}
          rows={4}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="The full story — shown on the projects page."
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Status">
          <select
            className={inputCls}
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
          >
            <option value="active">active</option>
            <option value="profitable">profitable</option>
            <option value="in development">in development</option>
            <option value="archived">archived</option>
          </select>
        </Field>
        <Field label="URL (optional)">
          <input
            className={inputCls}
            value={form.url}
            onChange={(e) => set("url", e.target.value)}
            placeholder="https://hemifocus.com"
          />
        </Field>
      </div>

      <Field label="Stat / social proof (optional)">
        <input
          className={inputCls}
          value={form.stat}
          onChange={(e) => set("stat", e.target.value)}
          placeholder="100% trial-to-paid conversion on organic users"
        />
      </Field>

      <Field label="Tags (comma-separated)">
        <input
          className={inputCls}
          value={form.tags}
          onChange={(e) => set("tags", e.target.value)}
          placeholder="neurotech, intelligence, newsletter"
        />
      </Field>

      <Field label="Preview image URL (shown on hover)">
        <input
          className={inputCls}
          value={form.previewImage}
          onChange={(e) => set("previewImage", e.target.value)}
          placeholder="/images/projects/nia.png"
        />
      </Field>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.featured}
          onChange={(e) => set("featured", e.target.checked)}
          className="accent-primary"
        />
        <span className="text-sm text-secondary">Featured on homepage</span>
      </label>

      <Field label="Case study (Markdown / MDX, optional)">
        <textarea
          className={`${inputCls} font-mono text-xs resize-y`}
          rows={14}
          value={form.caseStudy}
          onChange={(e) => set("caseStudy", e.target.value)}
          placeholder="Leave blank to hide the “See case study” button on this project's card…"
          spellCheck={false}
        />
      </Field>

      <FormActions saving={saving} onSave={onSave} onCancel={onCancel} />
    </div>
  );
}

function StarRating({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(value === n ? null : n)}
          className={`text-lg leading-none transition-colors ${
            value !== null && n <= value ? "text-primary" : "text-inactive hover:text-tertiary"
          }`}
        >
          ★
        </button>
      ))}
      {value !== null && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-xs text-tertiary hover:text-primary ml-1"
        >
          clear
        </button>
      )}
    </div>
  );
}

function BookForm({
  form,
  setForm,
  isNew,
  saving,
  onSave,
  onCancel,
}: {
  form: typeof defaultBook;
  setForm: (f: typeof defaultBook) => void;
  isNew: boolean;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OpenLibraryResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  function set<K extends keyof typeof defaultBook>(field: K, value: typeof defaultBook[K]) {
    setForm({ ...form, [field]: value });
  }

  async function runSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setSearchError("");
    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(
          query
        )}&limit=8&fields=key,title,author_name,first_publish_year,cover_i`
      );
      const data = await res.json();
      setResults(data.docs ?? []);
    } catch {
      setSearchError("Search failed — try again");
    }
    setSearching(false);
  }

  function pickResult(r: OpenLibraryResult) {
    setForm({
      ...form,
      title: r.title,
      author: r.author_name?.join(", ") ?? "",
      coverUrl: r.cover_i
        ? `https://covers.openlibrary.org/b/id/${r.cover_i}-L.jpg`
        : form.coverUrl,
      year: r.first_publish_year ? String(r.first_publish_year) : form.year,
    });
    setResults([]);
    setQuery("");
  }

  return (
    <div className="space-y-4">
      <h2 className="font-heading font-light text-lg text-primary">
        {isNew ? "New book" : "Edit book"}
      </h2>

      {isNew && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 space-y-2">
          <label className={labelCls}>Search Open Library</label>
          <div className="flex gap-2">
            <input
              className={inputCls}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  runSearch();
                }
              }}
              placeholder="Search by title or author…"
            />
            <button
              type="button"
              onClick={runSearch}
              disabled={searching}
              className="text-sm bg-primary text-white px-3 py-2 rounded hover:bg-neutral-800 disabled:opacity-50 transition-colors shrink-0"
            >
              {searching ? "…" : "Search"}
            </button>
          </div>
          {searchError && <p className="text-xs text-red-500">{searchError}</p>}
          {results.length > 0 && (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {results.map((r) => (
                <button
                  type="button"
                  key={r.key}
                  onClick={() => pickResult(r)}
                  className="w-full flex items-center gap-3 text-left p-2 rounded hover:bg-white border border-transparent hover:border-neutral-200 transition-colors"
                >
                  {r.cover_i ? (
                    <img
                      src={`https://covers.openlibrary.org/b/id/${r.cover_i}-S.jpg`}
                      alt=""
                      className="w-8 h-11 object-cover rounded-sm bg-neutral-200 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-11 rounded-sm bg-neutral-200 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm text-primary truncate">{r.title}</p>
                    <p className="text-xs text-secondary truncate">
                      {r.author_name?.join(", ") ?? "Unknown author"}
                      {r.first_publish_year ? ` · ${r.first_publish_year}` : ""}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-start gap-4">
        {form.coverUrl ? (
          <img
            src={form.coverUrl}
            alt=""
            className="w-16 h-24 object-cover rounded bg-neutral-200 shrink-0"
          />
        ) : (
          <div className="w-16 h-24 rounded bg-neutral-100 border border-dashed border-neutral-300 shrink-0" />
        )}
        <div className="flex-1 space-y-4">
          <Field label="Title">
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Man's Search for Meaning"
            />
          </Field>
          <Field label="Author">
            <input
              className={inputCls}
              value={form.author}
              onChange={(e) => set("author", e.target.value)}
              placeholder="Viktor Frankl"
            />
          </Field>
        </div>
      </div>

      <Field label="Cover image URL">
        <input
          className={inputCls}
          value={form.coverUrl}
          onChange={(e) => set("coverUrl", e.target.value)}
          placeholder="https://covers.openlibrary.org/b/id/…-L.jpg"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Status">
          <select
            className={inputCls}
            value={form.status}
            onChange={(e) => set("status", e.target.value as Book["status"])}
          >
            <option value="wishlist">Wishlist</option>
            <option value="in-progress">In progress</option>
            <option value="finished">Finished</option>
          </select>
        </Field>
        <Field label="Publication year">
          <input
            className={inputCls}
            value={form.year}
            onChange={(e) => set("year", e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="2019"
            inputMode="numeric"
          />
        </Field>
      </div>

      <Field label="Rating">
        <StarRating value={form.rating} onChange={(v) => set("rating", v)} />
      </Field>

      <Field label="Notes">
        <textarea
          className={`${inputCls} resize-y`}
          rows={6}
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="What stuck with you…"
        />
      </Field>

      <FormActions saving={saving} onSave={onSave} onCancel={onCancel} />
    </div>
  );
}

function BookListItem({
  book,
  isEditing,
  onOpen,
  onDelete,
}: {
  book: Book;
  isEditing: boolean;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={book}
      as="div"
      dragListener={false}
      dragControls={dragControls}
      className={`bg-white border rounded-lg p-3 flex items-center gap-2 transition-colors ${
        isEditing ? "border-primary shadow-sm" : "border-neutral-200"
      }`}
    >
      <div
        onPointerDown={(e) => dragControls.start(e)}
        title="Drag to reorder"
        className="cursor-grab active:cursor-grabbing text-tertiary hover:text-primary shrink-0 select-none touch-none px-1"
      >
        ⠿
      </div>
      <div
        onClick={onOpen}
        className="flex items-start gap-2 min-w-0 flex-1 cursor-pointer"
      >
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt=""
            className="w-7 h-10 object-cover rounded-sm bg-neutral-200 shrink-0"
          />
        ) : (
          <div className="w-7 h-10 rounded-sm bg-neutral-100 shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-primary truncate">{book.title}</p>
          <p className="text-xs text-secondary mt-0.5 truncate">{book.author}</p>
          <p className="text-xs text-tertiary mt-0.5">
            {book.status === "wishlist"
              ? "Wishlist"
              : book.status === "in-progress"
              ? "In progress"
              : `Finished${book.year ? ` · ${book.year}` : ""}`}
            {book.rating ? ` · ${"★".repeat(book.rating)}` : ""}
          </p>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="text-tertiary hover:text-red-500 text-lg leading-none shrink-0 transition-colors"
      >
        ×
      </button>
    </Reorder.Item>
  );
}

function WorkHistoryListItem({
  entry,
  isEditing,
  onOpen,
  onDelete,
}: {
  entry: WorkHistoryEntry;
  isEditing: boolean;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={entry}
      as="div"
      dragListener={false}
      dragControls={dragControls}
      className={`bg-white border rounded-lg p-3 flex items-center gap-2 transition-colors ${
        isEditing ? "border-primary shadow-sm" : "border-neutral-200"
      }`}
    >
      <div
        onPointerDown={(e) => dragControls.start(e)}
        title="Drag to reorder"
        className="cursor-grab active:cursor-grabbing text-tertiary hover:text-primary shrink-0 select-none touch-none px-1"
      >
        ⠿
      </div>
      <div onClick={onOpen} className="min-w-0 flex-1 cursor-pointer">
        <p className="text-sm font-medium text-primary truncate">
          {entry.company}
        </p>
        <p className="text-xs text-secondary mt-0.5 truncate">
          {entry.role} · {entry.period}
        </p>
        <p className="text-xs text-tertiary mt-0.5">
          {entry.href ? "Case study" : "No case study"}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="text-tertiary hover:text-red-500 text-lg leading-none shrink-0 transition-colors"
      >
        ×
      </button>
    </Reorder.Item>
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "active"
      ? "bg-green-50 text-green-700"
      : status === "profitable"
      ? "bg-blue-50 text-blue-700"
      : status === "in development"
      ? "bg-amber-50 text-amber-700"
      : "bg-neutral-100 text-neutral-500";
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded-full ${cls}`}>{status}</span>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [inputPw, setInputPw] = useState("");
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");

  const [tab, setTab] = useState<Tab>("writing");

  const [writingList, setWritingList] = useState<WritingMeta[]>([]);
  const [workHistoryList, setWorkHistoryList] = useState<WorkHistoryEntry[]>([]);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [readingList, setReadingList] = useState<Book[]>([]);

  const [writingForm, setWritingForm] = useState(defaultWriting);
  const [workEntryForm, setWorkEntryForm] = useState<WorkHistoryEntry>(defaultWorkEntry);
  const [caseStudyForm, setCaseStudyForm] = useState(defaultWork);
  const [projectForm, setProjectForm] = useState(defaultProject);
  const [bookForm, setBookForm] = useState(defaultBook);

  const [editingWriting, setEditingWriting] = useState<string | null>(null);
  const [editingWorkIndex, setEditingWorkIndex] = useState<number | null>(null);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingBook, setEditingBook] = useState<string | null>(null);

  const [newWriting, setNewWriting] = useState(false);
  const [newWorkEntry, setNewWorkEntry] = useState(false);
  const [newProject, setNewProject] = useState(false);
  const [newBook, setNewBook] = useState(false);

  const [showCaseStudyEditor, setShowCaseStudyEditor] = useState(false);
  const [caseStudyIsNew, setCaseStudyIsNew] = useState(false);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  async function tryAuth(pw: string) {
    const res = await fetch("/api/admin/writing", {
      headers: { "x-admin-password": pw },
    });
    if (res.ok) {
      setPassword(pw);
      setAuthed(true);
      localStorage.setItem("admin_pw", pw);
      setAuthError("");
    } else {
      setAuthError("Wrong password");
      localStorage.removeItem("admin_pw");
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem("admin_pw");
    if (stored) tryAuth(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = useCallback(async () => {
    if (!authed) return;
    if (tab === "writing") {
      const res = await apiFetch("/api/admin/writing", password);
      setWritingList(await res.json());
    } else if (tab === "work") {
      const res = await apiFetch("/api/admin/work-history", password);
      setWorkHistoryList(await res.json());
    } else if (tab === "projects") {
      const res = await apiFetch("/api/admin/projects", password);
      setProjectsList(await res.json());
    } else {
      const res = await apiFetch("/api/admin/reading", password);
      setReadingList(await res.json());
    }
  }, [authed, tab, password]);

  useEffect(() => {
    loadData();
    setEditingWriting(null);
    setEditingWorkIndex(null);
    setEditingProject(null);
    setEditingBook(null);
    setNewWriting(false);
    setNewWorkEntry(false);
    setNewProject(false);
    setNewBook(false);
    setShowCaseStudyEditor(false);
  }, [loadData]);

  // ── writing CRUD ────────────────────────────────────────────────────────────

  async function openWriting(slug: string) {
    const res = await apiFetch(`/api/admin/writing/${slug}`, password);
    const { frontmatter, content } = await res.json();
    setWritingForm({
      slug,
      title: frontmatter.title ?? "",
      date: frontmatter.date ?? "",
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags.join(", ") : "",
      readTime: frontmatter.readTime ?? "",
      excerpt: frontmatter.excerpt ?? "",
      content: content ?? "",
    });
    setEditingWriting(slug);
    setNewWriting(false);
  }

  async function saveWriting() {
    setSaving(true);
    const frontmatter = {
      title: writingForm.title,
      date: writingForm.date,
      tags: tagsToArray(writingForm.tags),
      readTime: writingForm.readTime,
      excerpt: writingForm.excerpt,
    };
    const res = editingWriting
      ? await apiFetch(`/api/admin/writing/${editingWriting}`, password, {
          method: "PUT",
          body: JSON.stringify({ frontmatter, content: writingForm.content }),
        })
      : await apiFetch("/api/admin/writing", password, {
          method: "POST",
          body: JSON.stringify({
            frontmatter,
            content: writingForm.content,
            slug: writingForm.slug,
          }),
        });

    if (res.ok) {
      showToast("Saved");
      await loadData();
      if (!editingWriting) {
        setNewWriting(false);
        setWritingForm({ ...defaultWriting, date: today() });
      }
    } else {
      const { error } = await res.json().catch(() => ({ error: "Error" }));
      showToast(`Error: ${error}`);
    }
    setSaving(false);
  }

  async function deleteWriting(slug: string) {
    if (!confirm(`Delete "${slug}"?`)) return;
    await apiFetch(`/api/admin/writing/${slug}`, password, { method: "DELETE" });
    await loadData();
    if (editingWriting === slug) setEditingWriting(null);
  }

  // ── work history CRUD ─────────────────────────────────────────────────────────

  function openWorkEntry(index: number) {
    setWorkEntryForm({ ...workHistoryList[index] });
    setEditingWorkIndex(index);
    setNewWorkEntry(false);
    setShowCaseStudyEditor(false);
  }

  async function saveWorkEntry() {
    setSaving(true);
    const updated = [...workHistoryList];
    if (editingWorkIndex !== null) {
      updated[editingWorkIndex] = workEntryForm;
    } else {
      updated.push(workEntryForm);
    }

    const res = await apiFetch("/api/admin/work-history", password, {
      method: "PUT",
      body: JSON.stringify(updated),
    });

    if (res.ok) {
      showToast("Saved");
      setWorkHistoryList(updated);
      if (newWorkEntry) {
        setNewWorkEntry(false);
        setEditingWorkIndex(updated.length - 1);
      }
    } else {
      const { error } = await res.json().catch(() => ({ error: "Error" }));
      showToast(`Error: ${error}`);
    }
    setSaving(false);
  }

  async function deleteWorkEntry(index: number) {
    const entry = workHistoryList[index];
    if (!confirm(`Delete "${entry.company}"?`)) return;
    const updated = workHistoryList.filter((_, i) => i !== index);
    await apiFetch("/api/admin/work-history", password, {
      method: "PUT",
      body: JSON.stringify(updated),
    });
    setWorkHistoryList(updated);
    if (editingWorkIndex === index) setEditingWorkIndex(null);
  }

  const workHistoryReorderTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleReorderWorkHistory(newOrder: WorkHistoryEntry[]) {
    setWorkHistoryList(newOrder);
    if (workHistoryReorderTimeout.current) clearTimeout(workHistoryReorderTimeout.current);
    workHistoryReorderTimeout.current = setTimeout(() => {
      apiFetch("/api/admin/work-history", password, {
        method: "PUT",
        body: JSON.stringify(newOrder),
      }).catch(() => {});
    }, 500);
  }

  // ── case study CRUD (attached to a work history entry) ───────────────────────

  async function openCaseStudyEditor() {
    if (workEntryForm.href) {
      const slug = workEntryForm.href.replace(/^\/work\//, "");
      const res = await apiFetch(`/api/admin/work/${slug}`, password);
      const { frontmatter, content } = await res.json();
      setCaseStudyForm({
        slug,
        title: frontmatter.title ?? "",
        subtitle: frontmatter.subtitle ?? "",
        company: frontmatter.company ?? workEntryForm.company,
        date: frontmatter.date ?? today(),
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags.join(", ") : "",
        featured: !!frontmatter.featured,
        readTime: frontmatter.readTime ?? "",
        coverImage: frontmatter.coverImage ?? "",
        content: content ?? "",
      });
      setCaseStudyIsNew(false);
    } else {
      setCaseStudyForm({
        ...defaultWork,
        date: today(),
        company: workEntryForm.company,
        slug: titleToSlug(workEntryForm.company),
      });
      setCaseStudyIsNew(true);
    }
    setShowCaseStudyEditor(true);
  }

  async function saveCaseStudy() {
    if (editingWorkIndex === null) return;
    setSaving(true);
    const frontmatter: Record<string, unknown> = {
      title: caseStudyForm.title,
      subtitle: caseStudyForm.subtitle,
      company: caseStudyForm.company,
      slug: caseStudyForm.slug,
      date: caseStudyForm.date,
      tags: tagsToArray(caseStudyForm.tags),
      featured: caseStudyForm.featured,
      readTime: caseStudyForm.readTime,
    };
    if (caseStudyForm.coverImage) frontmatter.coverImage = caseStudyForm.coverImage;

    if (caseStudyIsNew) {
      const res = await apiFetch("/api/admin/work", password, {
        method: "POST",
        body: JSON.stringify({
          frontmatter,
          content: caseStudyForm.content,
          slug: caseStudyForm.slug,
        }),
      });

      if (res.ok) {
        const { slug } = await res.json();
        const href = `/work/${slug}`;
        const updated = [...workHistoryList];
        updated[editingWorkIndex] = { ...updated[editingWorkIndex], href };
        await apiFetch("/api/admin/work-history", password, {
          method: "PUT",
          body: JSON.stringify(updated),
        });
        setWorkHistoryList(updated);
        setWorkEntryForm({ ...workEntryForm, href });
        setCaseStudyIsNew(false);
        setShowCaseStudyEditor(false);
        showToast("Case study created");
      } else {
        const { error } = await res.json().catch(() => ({ error: "Error" }));
        showToast(`Error: ${error}`);
      }
    } else {
      const res = await apiFetch(`/api/admin/work/${caseStudyForm.slug}`, password, {
        method: "PUT",
        body: JSON.stringify({ frontmatter, content: caseStudyForm.content }),
      });

      if (res.ok) {
        showToast("Saved");
        setShowCaseStudyEditor(false);
      } else {
        const { error } = await res.json().catch(() => ({ error: "Error" }));
        showToast(`Error: ${error}`);
      }
    }
    setSaving(false);
  }

  async function removeCaseStudy() {
    if (editingWorkIndex === null || !workEntryForm.href) return;
    if (!confirm("Remove this case study? Its content will be deleted permanently.")) return;

    const slug = workEntryForm.href.replace(/^\/work\//, "");
    await apiFetch(`/api/admin/work/${slug}`, password, { method: "DELETE" });

    const updated = [...workHistoryList];
    updated[editingWorkIndex] = { ...updated[editingWorkIndex], href: "" };
    await apiFetch("/api/admin/work-history", password, {
      method: "PUT",
      body: JSON.stringify(updated),
    });
    setWorkHistoryList(updated);
    setWorkEntryForm({ ...workEntryForm, href: "" });
    setShowCaseStudyEditor(false);
    showToast("Case study removed");
  }

  // ── projects CRUD ────────────────────────────────────────────────────────────

  function openProject(p: Project) {
    setProjectForm({
      name: p.name,
      kind: p.kind,
      description: p.description,
      status: p.status,
      stat: p.stat ?? "",
      tags: Array.isArray(p.tags) ? p.tags.join(", ") : "",
      url: p.url ?? "",
      featured: p.featured,
      previewImage: p.previewImage ?? "",
      caseStudy: p.caseStudy ?? "",
    });
    setEditingProject(p.name);
    setNewProject(false);
  }

  async function saveProject() {
    setSaving(true);
    const project = {
      name: projectForm.name,
      kind: projectForm.kind,
      description: projectForm.description,
      status: projectForm.status,
      stat: projectForm.stat || null,
      tags: tagsToArray(projectForm.tags),
      ...(projectForm.url ? { url: projectForm.url } : {}),
      featured: projectForm.featured,
      ...(projectForm.previewImage ? { previewImage: projectForm.previewImage } : {}),
      ...(projectForm.caseStudy ? { caseStudy: projectForm.caseStudy } : {}),
    };

    const res = editingProject
      ? await apiFetch(
          `/api/admin/projects/${encodeURIComponent(editingProject)}`,
          password,
          { method: "PUT", body: JSON.stringify(project) }
        )
      : await apiFetch("/api/admin/projects", password, {
          method: "POST",
          body: JSON.stringify(project),
        });

    if (res.ok) {
      showToast("Saved");
      await loadData();
      if (!editingProject) {
        setNewProject(false);
        setProjectForm(defaultProject);
      }
    } else {
      const { error } = await res.json().catch(() => ({ error: "Error" }));
      showToast(`Error: ${error}`);
    }
    setSaving(false);
  }

  async function deleteProject(name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    await apiFetch(
      `/api/admin/projects/${encodeURIComponent(name)}`,
      password,
      { method: "DELETE" }
    );
    await loadData();
    if (editingProject === name) setEditingProject(null);
  }

  // ── reading CRUD ────────────────────────────────────────────────────────────

  function openBook(b: Book) {
    setBookForm({
      title: b.title,
      author: b.author,
      coverUrl: b.coverUrl ?? "",
      status: b.status,
      year: b.year ? String(b.year) : "",
      rating: b.rating ?? null,
      notes: b.notes ?? "",
    });
    setEditingBook(b.id);
    setNewBook(false);
  }

  async function saveBook() {
    setSaving(true);
    const payload = {
      title: bookForm.title,
      author: bookForm.author,
      coverUrl: bookForm.coverUrl || undefined,
      status: bookForm.status,
      year: bookForm.year ? Number(bookForm.year) : null,
      rating: bookForm.rating,
      notes: bookForm.notes,
    };

    const res = editingBook
      ? await apiFetch(`/api/admin/reading/${editingBook}`, password, {
          method: "PUT",
          body: JSON.stringify(payload),
        })
      : await apiFetch("/api/admin/reading", password, {
          method: "POST",
          body: JSON.stringify(payload),
        });

    if (res.ok) {
      showToast("Saved");
      await loadData();
      if (!editingBook) {
        setNewBook(false);
        setBookForm(defaultBook);
      }
    } else {
      const { error } = await res.json().catch(() => ({ error: "Error" }));
      showToast(`Error: ${error}`);
    }
    setSaving(false);
  }

  async function deleteBook(id: string) {
    if (!confirm("Delete this book?")) return;
    await apiFetch(`/api/admin/reading/${id}`, password, { method: "DELETE" });
    await loadData();
    if (editingBook === id) setEditingBook(null);
  }

  const reorderTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleReorderBooks(newOrder: Book[]) {
    setReadingList(newOrder);
    if (reorderTimeout.current) clearTimeout(reorderTimeout.current);
    reorderTimeout.current = setTimeout(() => {
      apiFetch("/api/admin/reading/reorder", password, {
        method: "PUT",
        body: JSON.stringify({ ids: newOrder.map((b) => b.id) }),
      }).catch(() => {});
    }, 500);
  }

  // ── render: password gate ────────────────────────────────────────────────────

  if (!authed) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-neutral-50 mt-14">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            tryAuth(inputPw);
          }}
          className="bg-white border border-neutral-200 rounded-lg p-8 w-full max-w-sm shadow-sm"
        >
          <h1 className="font-heading font-light text-2xl text-primary mb-1">
            Admin
          </h1>
          <p className="text-secondary text-sm mb-6">
            Enter your password to manage content.
          </p>
          {authError && (
            <p className="text-red-500 text-xs mb-3">{authError}</p>
          )}
          <input
            type="password"
            value={inputPw}
            onChange={(e) => setInputPw(e.target.value)}
            placeholder="Password"
            autoFocus
            className={`${inputCls} mb-3`}
          />
          <button
            type="submit"
            className="w-full bg-primary text-white text-sm px-4 py-2 rounded hover:bg-neutral-800 transition-colors"
          >
            Continue
          </button>
        </form>
      </div>
    );
  }

  // ── render: admin UI ─────────────────────────────────────────────────────────

  const showForm =
    tab === "writing"
      ? editingWriting !== null || newWriting
      : tab === "work"
      ? editingWorkIndex !== null || newWorkEntry
      : tab === "projects"
      ? editingProject !== null || newProject
      : editingBook !== null || newBook;

  const listCount =
    tab === "writing"
      ? writingList.length
      : tab === "work"
      ? workHistoryList.length
      : tab === "projects"
      ? projectsList.length
      : readingList.length;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-neutral-50 mt-14">
      {/* toolbar */}
      <div className="sticky top-14 z-40 bg-white border-b border-neutral-200">
        <div className="max-w-[1200px] mx-auto px-6 h-11 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-xs font-medium text-tertiary uppercase tracking-wider">
              Content
            </span>
            {(["writing", "work", "projects", "reading"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-sm transition-colors ${
                  tab === t
                    ? "text-primary font-medium"
                    : "text-secondary hover:text-primary"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setAuthed(false);
              setPassword("");
              localStorage.removeItem("admin_pw");
            }}
            className="text-xs text-secondary hover:text-primary transition-colors"
          >
            Log out
          </button>
        </div>
      </div>

      {/* toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-white text-sm px-4 py-2 rounded shadow-lg">
          {toast}
        </div>
      )}

      {/* content */}
      <div className="max-w-[1200px] mx-auto px-6 py-6">
        <div
          className={`grid gap-6 items-start ${
            showForm ? "grid-cols-[300px_1fr]" : "grid-cols-1"
          }`}
        >
          {/* left: list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-tertiary">
                {listCount}{" "}
                {tab === "writing"
                  ? "posts"
                  : tab === "work"
                  ? "roles"
                  : tab === "projects"
                  ? "projects"
                  : "books"}
              </span>
              <button
                onClick={() => {
                  if (tab === "writing") {
                    setWritingForm({ ...defaultWriting, date: today() });
                    setEditingWriting(null);
                    setNewWriting(true);
                  } else if (tab === "work") {
                    setWorkEntryForm(defaultWorkEntry);
                    setEditingWorkIndex(null);
                    setNewWorkEntry(true);
                    setShowCaseStudyEditor(false);
                  } else if (tab === "projects") {
                    setProjectForm(defaultProject);
                    setEditingProject(null);
                    setNewProject(true);
                  } else {
                    setBookForm(defaultBook);
                    setEditingBook(null);
                    setNewBook(true);
                  }
                }}
                className="text-xs bg-primary text-white px-3 py-1.5 rounded hover:bg-neutral-800 transition-colors"
              >
                + New
              </button>
            </div>

            {tab === "writing" &&
              writingList.map((item) => (
                <div
                  key={item.slug}
                  onClick={() => openWriting(item.slug)}
                  className={`bg-white border rounded-lg p-3 cursor-pointer transition-colors hover:border-neutral-300 ${
                    editingWriting === item.slug
                      ? "border-primary shadow-sm"
                      : "border-neutral-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-primary truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-secondary mt-0.5">{item.date}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteWriting(item.slug);
                      }}
                      className="text-tertiary hover:text-red-500 text-lg leading-none shrink-0 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}

            {tab === "work" && (
              <Reorder.Group
                as="div"
                axis="y"
                values={workHistoryList}
                onReorder={handleReorderWorkHistory}
                className="space-y-2"
              >
                {workHistoryList.map((entry, index) => (
                  <WorkHistoryListItem
                    key={entry.company}
                    entry={entry}
                    isEditing={editingWorkIndex === index}
                    onOpen={() => openWorkEntry(index)}
                    onDelete={() => deleteWorkEntry(index)}
                  />
                ))}
              </Reorder.Group>
            )}

            {tab === "projects" &&
              projectsList.map((item) => (
                <div
                  key={item.name}
                  onClick={() => openProject(item)}
                  className={`bg-white border rounded-lg p-3 cursor-pointer transition-colors hover:border-neutral-300 ${
                    editingProject === item.name
                      ? "border-primary shadow-sm"
                      : "border-neutral-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-primary truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={item.status} />
                        {item.featured && (
                          <span className="text-xs text-tertiary">★ featured</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(item.name);
                      }}
                      className="text-tertiary hover:text-red-500 text-lg leading-none shrink-0 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}

            {tab === "reading" && (
              <Reorder.Group
                as="div"
                axis="y"
                values={readingList}
                onReorder={handleReorderBooks}
                className="space-y-2"
              >
                {readingList.map((item) => (
                  <BookListItem
                    key={item.id}
                    book={item}
                    isEditing={editingBook === item.id}
                    onOpen={() => openBook(item)}
                    onDelete={() => deleteBook(item.id)}
                  />
                ))}
              </Reorder.Group>
            )}
          </div>

          {/* right: form */}
          {showForm && (
            <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm">
              {tab === "writing" && (editingWriting !== null || newWriting) && (
                <WritingForm
                  form={writingForm}
                  setForm={setWritingForm}
                  isNew={newWriting}
                  saving={saving}
                  onSave={saveWriting}
                  onCancel={() => {
                    setEditingWriting(null);
                    setNewWriting(false);
                  }}
                />
              )}
              {tab === "work" && (editingWorkIndex !== null || newWorkEntry) && (
                <WorkEntryForm
                  form={workEntryForm}
                  setForm={setWorkEntryForm}
                  isNew={newWorkEntry}
                  saving={saving}
                  onSave={saveWorkEntry}
                  onCancel={() => {
                    setEditingWorkIndex(null);
                    setNewWorkEntry(false);
                  }}
                  showCaseStudyEditor={showCaseStudyEditor}
                  caseStudyIsNew={caseStudyIsNew}
                  caseStudyForm={caseStudyForm}
                  setCaseStudyForm={setCaseStudyForm}
                  onAddCaseStudy={openCaseStudyEditor}
                  onEditCaseStudy={openCaseStudyEditor}
                  onRemoveCaseStudy={removeCaseStudy}
                  onSaveCaseStudy={saveCaseStudy}
                  onCancelCaseStudy={() => setShowCaseStudyEditor(false)}
                />
              )}
              {tab === "projects" && (editingProject !== null || newProject) && (
                <ProjectForm
                  form={projectForm}
                  setForm={setProjectForm}
                  isNew={newProject}
                  saving={saving}
                  onSave={saveProject}
                  onCancel={() => {
                    setEditingProject(null);
                    setNewProject(false);
                  }}
                />
              )}
              {tab === "reading" && (editingBook !== null || newBook) && (
                <BookForm
                  form={bookForm}
                  setForm={setBookForm}
                  isNew={newBook}
                  saving={saving}
                  onSave={saveBook}
                  onCancel={() => {
                    setEditingBook(null);
                    setNewBook(false);
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
