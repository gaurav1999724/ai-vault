import { describe, expect, it } from "vitest";
import { passwordIssue } from "@/lib/passwords";

describe("passwordIssue", () => {
  it("rejects short passwords", () => {
    expect(passwordIssue("Short1")).toMatch(/12/);
  });

  it("accepts a long mixed password", () => {
    expect(passwordIssue("Studio-Vault-2026")).toBeNull();
  });
});
