import { NextRequest, NextResponse } from "next/server";
import { getFile, putFile } from "@/lib/github-content";

const projectsFile = "content/projects.json";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const file = await getFile(projectsFile);
  return NextResponse.json(file ? JSON.parse(file.content) : []);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const newProject = await req.json();
  const file = await getFile(projectsFile);
  const projects = file ? JSON.parse(file.content) : [];
  projects.push(newProject);
  await putFile(
    projectsFile,
    JSON.stringify(projects, null, 2),
    `Add project: ${newProject?.name ?? ""}`,
    file?.sha
  );
  return NextResponse.json({ success: true });
}
