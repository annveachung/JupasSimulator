import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { generateUsername, generatePassword } from "@/lib/generate";
import { rollResult } from "@/lib/bands";
import { PROGRAMMES_BY_CODE } from "@/data/programmes";

interface ChoiceInput {
  rank: number;
  jupasCode: string;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.choices)) {
    return error(400, "INVALID_BODY", "Request body must include a choices array.");
  }

  const rawChoices: ChoiceInput[] = body.choices;

  // Validate presence of choice #1
  if (!rawChoices.some((c) => c.rank === 1)) {
    return error(400, "MISSING_CHOICE_1", "Choice #1 is required.");
  }

  // Validate each choice
  const seen = new Set<number>();
  for (const c of rawChoices) {
    if (!Number.isInteger(c.rank) || c.rank < 1 || c.rank > 20) {
      return error(400, "INVALID_RANK", `Rank must be between 1 and 20. Got: ${c.rank}`);
    }
    if (seen.has(c.rank)) {
      return error(400, "INVALID_RANK", `Duplicate rank: ${c.rank}`);
    }
    seen.add(c.rank);
    if (!PROGRAMMES_BY_CODE.has(c.jupasCode)) {
      return error(400, "INVALID_CODE", `Unknown JUPAS code: ${c.jupasCode}`);
    }
  }

  // Resolve programme data
  const choices = rawChoices.map((c) => {
    const prog = PROGRAMMES_BY_CODE.get(c.jupasCode)!;
    return { rank: c.rank, jupasCode: c.jupasCode, university: prog.university, program: prog.name };
  });

  const admittedChoiceRank = rollResult(choices);
  const username = await generateUsername();
  const plainPassword = generatePassword();
  const passwordHash = await bcrypt.hash(plainPassword, 12);

  await prisma.user.create({
    data: {
      username,
      passwordHash,
      admittedChoiceRank,
      choices: { create: choices },
    },
  });

  return NextResponse.json({ username, password: plainPassword }, { status: 201 });
}

function error(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}
