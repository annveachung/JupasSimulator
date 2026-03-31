import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getBand } from "@/lib/bands";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Please log in." } }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { choices: { orderBy: { rank: "asc" } } },
  });

  if (!user) {
    return NextResponse.json({ error: { code: "USER_NOT_FOUND", message: "User not found." } }, { status: 404 });
  }

  const admittedChoice = user.choices.find((c) => c.rank === user.admittedChoiceRank);

  return NextResponse.json({
    admittedChoiceRank: user.admittedChoiceRank,
    admittedChoice: admittedChoice
      ? { ...admittedChoice, band: getBand(admittedChoice.rank) }
      : null,
    resetCount: user.resetCount,
    choices: user.choices.map((c) => ({ ...c, band: getBand(c.rank) })),
  });
}
