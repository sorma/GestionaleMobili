// app/api/pin/logout/route.js
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("pin_ok");
  return res;
}
