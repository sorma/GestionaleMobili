// app/api/pin/verify/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();
  const pin = String(body?.pin || "");

  const ok = pin === process.env.GUADAGNI_PIN; // metti GUADAGNI_PIN nel .env

  if (!ok) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });

  res.cookies.set({
    name: "pin_ok",
    value: "1",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minuti
  });

  return res;
}
