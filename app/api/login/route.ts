import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.username || !body?.password) {
    return error(400, "MISSING_FIELDS", "Username and password are required.");
  }

  const user = await prisma.user.findUnique({ where: { username: body.username } });
  if (!user) {
    return error(401, "INVALID_CREDENTIALS", "The application number or password is incorrect.");
  }

  const valid = await bcrypt.compare(body.password, user.passwordHash);
  if (!valid) {
    return error(401, "INVALID_CREDENTIALS", "The application number or password is incorrect.");
  }

  const token = await signToken({ userId: user.id, username: user.username });
  await setSessionCookie(token);

  return NextResponse.json({ success: true });
}

function error(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}
