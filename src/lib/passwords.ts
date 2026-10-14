export function passwordIssue(password: string) {
  if (password.length < 12) return "Use at least 12 characters.";
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Use upper and lower case letters and a number.";
  }
  return null;
}
