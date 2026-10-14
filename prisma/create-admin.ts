import { readFileSync } from "node:fs";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { passwordIssue } from "../src/lib/passwords";

function loadEnv() {
  try {
    const text = readFileSync(new URL("../.env", import.meta.url), "utf8");
    for (const line of text.split("\n")) {
      const match = line.match(/^([A-Z0-9_]+)="(.*)"$/);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
    }
  } catch {
    // The shell or host can provide the variables instead.
  }
}

async function ask(question: string) {
  const rl = readline.createInterface({ input, output });
  const answer = (await rl.question(question)).trim();
  rl.close();
  return answer;
}

async function main() {
  loadEnv();
  const tty = Boolean(input.isTTY);
  const email = (process.env.ADMIN_EMAIL || (tty ? await ask("Administrator email: ") : "")).toLowerCase();
  const name = process.env.ADMIN_NAME || (tty ? await ask("Administrator name: ") : "");
  const password = process.env.ADMIN_PASSWORD || (tty ? await ask("Administrator password: ") : "");
  if (!email || !name || !password) {
    console.error("Set ADMIN_EMAIL, ADMIN_NAME, and ADMIN_PASSWORD, or run this command in a terminal.");
    process.exit(1);
  }
  const issue = passwordIssue(password);
  if (issue) {
    console.error(issue);
    process.exit(1);
  }
  const prisma = new PrismaClient();
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.error("An administrator with that email already exists. No password was changed.");
    await prisma.$disconnect();
    process.exit(1);
  }
  await prisma.adminUser.create({
    data: { email, name, passwordHash: await bcrypt.hash(password, 12) },
  });
  await prisma.$disconnect();
  console.log(`Administrator ${email} created.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Could not create the administrator.");
  process.exit(1);
});
