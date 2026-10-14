export function isPubliclyVisible(status: string) {
  return status === "PUBLISHED";
}

export function publicPromptFields(creation: { status: string; prompt: string; negativePrompt: string | null }) {
  if (!isPubliclyVisible(creation.status)) return null;
  return {
    prompt: creation.prompt,
    negativePrompt: creation.negativePrompt,
  };
}

export function categoryDeleteBlockReason(creationCount: number) {
  if (creationCount > 0) {
    return "Reassign or remove the creations in this category before deleting it.";
  }
  return null;
}

export function withStepOrder<T extends { title: string }>(steps: T[]) {
  return steps.map((step, index) => ({ ...step, order: index + 1 }));
}

export function formatSettingsClipboard(input: {
  prompt: string;
  negativePrompt?: string | null;
  modelName?: string | null;
  platformName?: string | null;
  aspectRatio?: string | null;
  settings: { label: string; value: string }[];
}) {
  const lines = [`Prompt:\n${input.prompt}`];
  if (input.negativePrompt) lines.push(`Negative prompt:\n${input.negativePrompt}`);
  if (input.platformName) lines.push(`Platform: ${input.platformName}`);
  if (input.modelName) lines.push(`Model: ${input.modelName}`);
  if (input.aspectRatio) lines.push(`Aspect ratio: ${input.aspectRatio}`);
  for (const setting of input.settings) lines.push(`${setting.label}: ${setting.value}`);
  return lines.join("\n\n");
}

export function publishBlockers(input: {
  prompt: string;
  shortDescription: string;
  description: string;
  hasCover: boolean;
  coverAlt: boolean;
  categoryCount: number;
}) {
  const issues: string[] = [];
  if (!input.prompt.trim()) issues.push("Add the generation prompt before publishing.");
  if (input.shortDescription.trim().length < 10) issues.push("Add a short description before publishing.");
  if (input.description.trim().length < 10) issues.push("Add a description before publishing.");
  if (!input.hasCover) issues.push("Add cover or main media before publishing.");
  else if (!input.coverAlt) issues.push("Add alt text for the cover media.");
  if (input.categoryCount < 1) issues.push("Choose a category before publishing.");
  return issues;
}
