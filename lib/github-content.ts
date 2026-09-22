const OWNER = process.env.GITHUB_CONTENT_OWNER || "danielz-kim";
const REPO = process.env.GITHUB_CONTENT_REPO || "danielzkim.com";
const BRANCH = process.env.GITHUB_CONTENT_BRANCH || "main";

function githubHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not set");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "danielzkim-admin",
  };
}

function apiUrl(path: string) {
  return `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
}

export type GithubDirEntry = { name: string; path: string; sha: string };

export async function listDir(dirPath: string): Promise<GithubDirEntry[]> {
  const res = await fetch(`${apiUrl(dirPath)}?ref=${BRANCH}`, {
    headers: githubHeaders(),
    cache: "no-store",
  });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`GitHub list ${dirPath} failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getFile(filePath: string): Promise<{ content: string; sha: string } | null> {
  const res = await fetch(`${apiUrl(filePath)}?ref=${BRANCH}`, {
    headers: githubHeaders(),
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub get ${filePath} failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { content: Buffer.from(data.content, "base64").toString("utf-8"), sha: data.sha };
}

export async function putFile(
  filePath: string,
  content: string,
  message: string,
  sha?: string
): Promise<void> {
  const res = await fetch(apiUrl(filePath), {
    method: "PUT",
    headers: { ...githubHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: Buffer.from(content, "utf-8").toString("base64"),
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) throw new Error(`GitHub write ${filePath} failed: ${res.status} ${await res.text()}`);
}

export async function deleteFile(filePath: string, message: string, sha: string): Promise<void> {
  const res = await fetch(apiUrl(filePath), {
    method: "DELETE",
    headers: { ...githubHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ message, sha, branch: BRANCH }),
  });
  if (!res.ok) throw new Error(`GitHub delete ${filePath} failed: ${res.status} ${await res.text()}`);
}
