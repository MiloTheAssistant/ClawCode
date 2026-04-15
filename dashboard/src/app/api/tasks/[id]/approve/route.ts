import { NextRequest, NextResponse } from "next/server";
import { updateTask, getTasks } from "@/lib/tasks";
import { execFile } from "child_process";

export const dynamic = "force-dynamic";

/**
 * POST /api/tasks/:id/approve
 *
 * Approves a task in the "approval" lane:
 * 1. Moves the task status to "working" immediately
 * 2. Fires off the gateway dispatch in the background (non-blocking)
 * 3. Returns instantly so the UI doesn't spin
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

  // Get the task
  const tasks = getTasks({ status: "approval" });
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    return NextResponse.json(
      { error: `task ${id} not found or not in approval status` },
      { status: 404 }
    );
  }

  // Move to working immediately
  const update = updateTask(id, { status: "working" });
  if (!update.ok) {
    return NextResponse.json({ error: update.error }, { status: 500 });
  }

  // Fire-and-forget: dispatch to gateway in background
  const agentId = task.assigned_agent || "elon";
  const taskDescription = task.description || task.title;

  execFile(
    "openclaw",
    [
      "agent",
      "--agent",
      agentId,
      "--message",
      taskDescription,
      "--timeout",
      "300",
    ],
    {
      timeout: 310_000,
      env: { ...process.env, NO_COLOR: "1" },
    },
    (error) => {
      if (error) {
        updateTask(id, { status: "stuck" });
      } else {
        updateTask(id, { status: "complete" });
      }
    }
  );

  // Return immediately — don't wait for the agent
  return NextResponse.json({
    ok: true,
    task: update.task,
    dispatch: { agentId, status: "dispatched" },
  });
}
