import { NextRequest, NextResponse } from "next/server";
import { updateTask } from "@/lib/tasks";

export const dynamic = "force-dynamic";

/**
 * POST /api/tasks/:id/reject
 *
 * Rejects a task in the "approval" lane — moves it to "complete" with no dispatch.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);

  if (isNaN(id) || id <= 0) {
    return NextResponse.json({ error: "invalid task id" }, { status: 400 });
  }

  const result = updateTask(id, { status: "complete" });
  if (!result.ok) {
    const status = result.error?.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ ok: true, task: result.task });
}
