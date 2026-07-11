import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const projectsFile = path.join(process.cwd(), "content", "projects.json");

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function PUT(req: NextRequest, { params }: { params: { name: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decodedName = decodeURIComponent(params.name);
  const updated = await req.json();
  const projects = JSON.parse(fs.readFileSync(projectsFile, "utf-8"));
  const idx = projects.findIndex((p: any) => p.name === decodedName);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  projects[idx] = updated;
  fs.writeFileSync(projectsFile, JSON.stringify(projects, null, 2));
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { name: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decodedName = decodeURIComponent(params.name);
  const projects = JSON.parse(fs.readFileSync(projectsFile, "utf-8"));
  const idx = projects.findIndex((p: any) => p.name === decodedName);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  projects.splice(idx, 1);
  fs.writeFileSync(projectsFile, JSON.stringify(projects, null, 2));
  return NextResponse.json({ success: true });
}
