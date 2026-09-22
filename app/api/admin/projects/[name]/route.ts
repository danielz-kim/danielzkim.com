import { NextRequest, NextResponse } from "next/server";
import { getFile, putFile } from "@/lib/github-content";

const projectsFile = "content/projects.json";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function PUT(req: NextRequest, { params }: { params: { name: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decodedName = decodeURIComponent(params.name);
  const updated = await req.json();
  const file = await getFile(projectsFile);
  const projects = file ? JSON.parse(file.content) : [];
  const idx = projects.findIndex((p: any) => p.name === decodedName);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  projects[idx] = updated;
  await putFile(projectsFile, JSON.stringify(projects, null, 2), `Update project: ${decodedName}`, file!.sha);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { name: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decodedName = decodeURIComponent(params.name);
  const file = await getFile(projectsFile);
  const projects = file ? JSON.parse(file.content) : [];
  const idx = projects.findIndex((p: any) => p.name === decodedName);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  projects.splice(idx, 1);
  await putFile(projectsFile, JSON.stringify(projects, null, 2), `Delete project: ${decodedName}`, file!.sha);
  return NextResponse.json({ success: true });
}
