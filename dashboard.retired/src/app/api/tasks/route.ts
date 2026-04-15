import { NextRequest, NextResponse } from "next/server";
import { getTasks, createTask } from "@/lib/tasks";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const filters = {
    status: searchParams.get("status") ?? undefined,
    assigned_agent: searchParams.get("assigned_agent") ?? undefined,
    since: searchParams.get("since") ?? undefined,
  };

  const tasks = getTasks(filters);
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const result = createTask({
    title: body.title as string,
    description: body.description as string | undefined,
    status: body.status as string | undefined,
    priority: body.priority as string | undefined,
    assigned_agent: body.assigned_agent as string | undefined,
    dispatched_by: body.dispatched_by as string | undefined,
    router_profile: body.router_profile as string | undefined,
    model: body.model as string | undefined,
    complexity:
      body.complexity !== undefined ? Number(body.complexity) : undefined,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result.task, { status: 201 });
}
