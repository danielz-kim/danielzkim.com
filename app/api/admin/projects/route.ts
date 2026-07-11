import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const projectsFile = path.join(process.cwd(), "content", "projects.json");

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json(JSON.parse(fs.readFileSync(projectsFile, "utf-8")));
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const newProject = await req.json();
  const projects = JSON.parse(fs.readFileSync(projectsFile, "utf-8"));
  projects.push(newProject);
  fs.writeFileSync(projectsFile, JSON.stringify(projects, null, 2));
  return NextResponse.json({ success: true });
}
