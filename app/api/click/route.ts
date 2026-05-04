import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  // Production note:
  // Save this event to a database such as Supabase, Neon, Vercel Postgres, or BigQuery.
  // For this MVP, we return success so the frontend can safely redirect.
  console.log("DealClick click event", {
    dealId: body.dealId,
    store: body.store,
    url: body.url,
    createdAt: new Date().toISOString()
  });

  return NextResponse.json({ ok: true });
}
