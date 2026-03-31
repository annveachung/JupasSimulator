import { prisma } from "./db";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

export function generatePassword(length = 8): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return result;
}

export async function generateUsername(): Promise<string> {
  const year = new Date().getFullYear().toString().slice(-2);
  let username: string;
  let attempts = 0;
  do {
    const digits = Math.floor(10000 + Math.random() * 90000);
    username = `${year}-${digits}`;
    const existing = await prisma.user.findUnique({ where: { username } });
    if (!existing) break;
    attempts++;
  } while (attempts < 20);
  return username!;
}
