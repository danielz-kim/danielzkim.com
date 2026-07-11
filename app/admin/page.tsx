"use client";

import { useState, useEffect, useCallback } from "react";

type Tab = "writing" | "work" | "projects";

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

interface WorkMeta {
  slug: string;
  title: string;
  subtitle: string;
  company: string;
  date: string;
  tags: string[];
  featured: boolean;
  readTime: string;
  coverImage?: string;
}

interface Project {
  name: string;
  tagline: string;
  description: string;
  status: "profitable" | "active" | "in development" | "archived";
  stat?: string | null;
  tags: string[];
  url?: string;
  featured: boolean;
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

const defaultProject: {
  name: string;
  tagline: string;
  description: string;
  status: Project["status"];
  stat: string;
  tags: string;
  url: string;
  featured: boolean;
} = {
  name: "",
  tagline: "",
  description: "",
  status: "active",
  stat: "",
  tags: "",
  url: "",
  featured: false,
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

      <Field label="Tagline">
        <input
          className={inputCls}
          value={form.tagline}
          onChange={(e) => set("tagline", e.target.value)}
          placeholder="I built a translation layer for neurotech."
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

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.featured}
          onChange={(e) => set("featured", e.target.checked)}
          className="accent-primary"
        />
        <span className="text-sm text-secondary">Featured on homepage</span>
      </label>

      <FormActions saving={saving} onSave={onSave} onCancel={onCancel} />
    </div>
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
  const [workList, setWorkList] = useState<WorkMeta[]>([]);
  const [projectsList, setProjectsList] = useState<Project[]>([]);

  const [writingForm, setWritingForm] = useState(defaultWriting);
  const [workForm, setWorkForm] = useState(defaultWork);
  const [projectForm, setProjectForm] = useState(defaultProject);

  const [editingWriting, setEditingWriting] = useState<string | null>(null);
  const [editingWork, setEditingWork] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<string | null>(null);

  const [newWriting, setNewWriting] = useState(false);
  const [newWork, setNewWork] = useState(false);
  const [newProject, setNewProject] = useState(false);

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
      const res = await apiFetch("/api/admin/work", password);
      setWorkList(await res.json());
    } else {
      const res = await apiFetch("/api/admin/projects", password);
      setProjectsList(await res.json());
    }
  }, [authed, tab, password]);

  useEffect(() => {
    loadData();
    setEditingWriting(null);
    setEditingWork(null);
    setEditingProject(null);
    setNewWriting(false);
    setNewWork(false);
    setNewProject(false);
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

  // ── work CRUD ───────────────────────────────────────────────────────────────

  async function openWork(slug: string) {
    const res = await apiFetch(`/api/admin/work/${slug}`, password);
    const { frontmatter, content } = await res.json();
    setWorkForm({
      slug,
      title: frontmatter.title ?? "",
      subtitle: frontmatter.subtitle ?? "",
      company: frontmatter.company ?? "",
      date: frontmatter.date ?? "",
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags.join(", ") : "",
      featured: !!frontmatter.featured,
      readTime: frontmatter.readTime ?? "",
      coverImage: frontmatter.coverImage ?? "",
      content: content ?? "",
    });
    setEditingWork(slug);
    setNewWork(false);
  }

  async function saveWork() {
    setSaving(true);
    const frontmatter: Record<string, unknown> = {
      title: workForm.title,
      subtitle: workForm.subtitle,
      company: workForm.company,
      slug: editingWork ?? workForm.slug,
      date: workForm.date,
      tags: tagsToArray(workForm.tags),
      featured: workForm.featured,
      readTime: workForm.readTime,
    };
    if (workForm.coverImage) frontmatter.coverImage = workForm.coverImage;

    const res = editingWork
      ? await apiFetch(`/api/admin/work/${editingWork}`, password, {
          method: "PUT",
          body: JSON.stringify({ frontmatter, content: workForm.content }),
        })
      : await apiFetch("/api/admin/work", password, {
          method: "POST",
          body: JSON.stringify({
            frontmatter,
            content: workForm.content,
            slug: workForm.slug,
          }),
        });

    if (res.ok) {
      showToast("Saved");
      await loadData();
      if (!editingWork) {
        setNewWork(false);
        setWorkForm({ ...defaultWork, date: today() });
      }
    } else {
      const { error } = await res.json().catch(() => ({ error: "Error" }));
      showToast(`Error: ${error}`);
    }
    setSaving(false);
  }

  async function deleteWork(slug: string) {
    if (!confirm(`Delete "${slug}"?`)) return;
    await apiFetch(`/api/admin/work/${slug}`, password, { method: "DELETE" });
    await loadData();
    if (editingWork === slug) setEditingWork(null);
  }

  // ── projects CRUD ────────────────────────────────────────────────────────────

  function openProject(p: Project) {
    setProjectForm({
      name: p.name,
      tagline: p.tagline,
      description: p.description,
      status: p.status,
      stat: p.stat ?? "",
      tags: Array.isArray(p.tags) ? p.tags.join(", ") : "",
      url: p.url ?? "",
      featured: p.featured,
    });
    setEditingProject(p.name);
    setNewProject(false);
  }

  async function saveProject() {
    setSaving(true);
    const project = {
      name: projectForm.name,
      tagline: projectForm.tagline,
      description: projectForm.description,
      status: projectForm.status,
      stat: projectForm.stat || null,
      tags: tagsToArray(projectForm.tags),
      ...(projectForm.url ? { url: projectForm.url } : {}),
      featured: projectForm.featured,
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
      ? editingWork !== null || newWork
      : editingProject !== null || newProject;

  const listCount =
    tab === "writing"
      ? writingList.length
      : tab === "work"
      ? workList.length
      : projectsList.length;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-neutral-50 mt-14">
      {/* toolbar */}
      <div className="sticky top-14 z-40 bg-white border-b border-neutral-200">
        <div className="max-w-[1200px] mx-auto px-6 h-11 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-xs font-medium text-tertiary uppercase tracking-wider">
              Content
            </span>
            {(["writing", "work", "projects"] as Tab[]).map((t) => (
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
                {listCount} {tab === "writing" ? "posts" : tab === "work" ? "case studies" : "projects"}
              </span>
              <button
                onClick={() => {
                  if (tab === "writing") {
                    setWritingForm({ ...defaultWriting, date: today() });
                    setEditingWriting(null);
                    setNewWriting(true);
                  } else if (tab === "work") {
                    setWorkForm({ ...defaultWork, date: today() });
                    setEditingWork(null);
                    setNewWork(true);
                  } else {
                    setProjectForm(defaultProject);
                    setEditingProject(null);
                    setNewProject(true);
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

            {tab === "work" &&
              workList.map((item) => (
                <div
                  key={item.slug}
                  onClick={() => openWork(item.slug)}
                  className={`bg-white border rounded-lg p-3 cursor-pointer transition-colors hover:border-neutral-300 ${
                    editingWork === item.slug
                      ? "border-primary shadow-sm"
                      : "border-neutral-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-primary truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-secondary mt-0.5">
                        {item.company} · {item.date}
                        {item.featured && (
                          <span className="ml-2 text-tertiary">★</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteWork(item.slug);
                      }}
                      className="text-tertiary hover:text-red-500 text-lg leading-none shrink-0 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}

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
              {tab === "work" && (editingWork !== null || newWork) && (
                <WorkForm
                  form={workForm}
                  setForm={setWorkForm}
                  isNew={newWork}
                  saving={saving}
                  onSave={saveWork}
                  onCancel={() => {
                    setEditingWork(null);
                    setNewWork(false);
                  }}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
