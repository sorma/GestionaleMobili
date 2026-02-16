import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const username = body?.username?.trim();
  const password = body?.password;

  const adminUser = process.env.ADMIN_USER;
  const adminPass = process.env.ADMIN_PASS;

  if (!adminUser || !adminPass) {
    return NextResponse.json(
      { error: "Credenziali admin non configurate (ADMIN_USER / ADMIN_PASS)." },
      { status: 500 }
    );
  }

  if (username !== adminUser || password !== adminPass) {
    return NextResponse.json({ error: "Credenziali non valide." }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("session", "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return NextResponse.json({ ok: true });
}
