import { NextRequest, NextResponse } from "next/server";
import { updateTask } from "@/lib/tasks";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);

  if (isNaN(id) || id <= 0) {
    return NextResponse.json({ error: "invalid task id" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const result = updateTask(id, {
    title: body.title as string | undefined,
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
    const status = result.error?.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json(result.task);
}
