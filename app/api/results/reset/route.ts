import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getBand, rollResult } from "@/lib/bands";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Please log in." } }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { choices: true },
  });

  if (!user) {
    return NextResponse.json({ error: { code: "USER_NOT_FOUND", message: "User not found." } }, { status: 404 });
  }

  const newRank = rollResult(user.choices);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { admittedChoiceRank: newRank, resetCount: { increment: 1 } },
    include: { choices: true },
  });

  const admittedChoice = updated.choices.find((c) => c.rank === newRank);

  return NextResponse.json({
    admittedChoiceRank: newRank,
    admittedChoice: admittedChoice
      ? { ...admittedChoice, band: getBand(admittedChoice.rank) }
      : null,
    resetCount: updated.resetCount,
  });
}
