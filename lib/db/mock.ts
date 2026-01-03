import "server-only";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";
import type { User } from "./schema";
import { generateHashedPassword } from "./utils";

const DB_FILE = join(process.cwd(), ".mock-db.json");

interface MockDB {
  users: User[];
}

function readDB(): MockDB {
  if (!existsSync(DB_FILE)) {
    return { users: [] };
  }
  try {
    const content = readFileSync(DB_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return { users: [] };
  }
}

function writeDB(data: MockDB): void {
  writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function mockGetUser(email: string): Promise<User[]> {
  const db = readDB();
  return db.users.filter((u) => u.email === email);
}

export async function mockCreateUser(
  email: string,
  password: string
): Promise<void> {
  const db = readDB();
  const hashedPassword = generateHashedPassword(password);
  const newUser: User = {
    id: randomUUID(),
    email,
    password: hashedPassword,
  };
  db.users.push(newUser);
  writeDB(db);
}

export async function mockCreateGuestUser(): Promise<
  Array<{ id: string; email: string }>
> {
  const db = readDB();
  const email = `guest-${Date.now()}`;
  const password = generateHashedPassword(randomUUID());
  const newUser: User = {
    id: randomUUID(),
    email,
    password,
  };
  db.users.push(newUser);
  writeDB(db);
  return [{ id: newUser.id, email: newUser.email }];
}

