export class UnauthorizedError extends Error {
  constructor() {
    super("UNAUTHORIZED");
  }
}

export function assertAdminUser(user: { id: string } | null): asserts user is { id: string } {
  if (!user) throw new UnauthorizedError();
}

export function adminMutationStatus(user: { id: string } | null) {
  return user ? 200 : 401;
}
