import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("session"); // mantiene path default, se serve vedi nota sotto
  return NextResponse.json({ ok: true });
}
