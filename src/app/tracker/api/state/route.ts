import { NextResponse } from "next/server";
import type { TrackerState } from "../../_types/tracker";
import {
  readServerTrackerState,
  writeServerTrackerState,
} from "../../_lib/serverStore";
import { normalizeTrackerState } from "../../_lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await readServerTrackerState();

  return NextResponse.json(state, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PUT(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);

    if (contentLength > 250_000) {
      return NextResponse.json(
        { error: "Tracker payload is too large." },
        { status: 413 },
      );
    }

    const body = (await request.json()) as TrackerState;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Tracker payload must be an object." },
        { status: 400 },
      );
    }

    const state = await writeServerTrackerState(normalizeTrackerState(body));

    return NextResponse.json(state, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to save tracker state." },
      { status: 400 },
    );
  }
}
