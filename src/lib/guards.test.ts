import { describe, expect, it } from "vitest";
import { UnauthorizedError, adminMutationStatus, assertAdminUser } from "@/lib/guards";
import { sameOrigin } from "@/lib/origin";

describe("authorization", () => {
  it("rejects anonymous mutations", () => {
    expect(adminMutationStatus(null)).toBe(401);
    expect(() => assertAdminUser(null)).toThrow(UnauthorizedError);
    expect(adminMutationStatus({ id: "admin" })).toBe(200);
  });
});

describe("sameOrigin", () => {
  it("matches the request host", () => {
    const request = new Request("https://vault.example/api/analytics", {
      headers: { origin: "https://vault.example", host: "vault.example" },
    });
    expect(sameOrigin(request)).toBe(true);
    expect(sameOrigin(new Request("https://vault.example", { headers: { origin: "https://evil.example", host: "vault.example" } }))).toBe(
      false,
    );
  });
});
