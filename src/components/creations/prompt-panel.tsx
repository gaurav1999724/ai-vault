import { CopyPromptButton } from "@/components/creations/copy-prompt-button";
import { ToolLink } from "@/components/creations/tool-link";
import { GenerationSettings } from "@/components/creations/generation-settings";
import { formatSettingsClipboard } from "@/lib/content-rules";
import type { CreationDetail } from "@/types/content";

export function PromptPanel({ creation }: { creation: CreationDetail }) {
  const settings = [
    creation.aspectRatio ? { label: "Aspect ratio", value: creation.aspectRatio } : null,
    creation.resolution ? { label: "Resolution", value: creation.resolution } : null,
    creation.seed ? { label: "Seed", value: creation.seed } : null,
    creation.guidanceScale != null ? { label: "Guidance scale", value: String(creation.guidanceScale) } : null,
    creation.stepCount != null ? { label: "Steps", value: String(creation.stepCount) } : null,
    creation.durationSeconds != null ? { label: "Duration", value: `${creation.durationSeconds}s` } : null,
    creation.frameRate ? { label: "Frame rate", value: creation.frameRate } : null,
    creation.cameraMovement ? { label: "Camera movement", value: creation.cameraMovement } : null,
    ...creation.generationSettings,
  ].filter((item): item is { label: string; value: string } => Boolean(item));
  const tool = creation.tools.find((item) => item.websiteUrl);
  const allSettings = formatSettingsClipboard({
    prompt: creation.prompt,
    negativePrompt: creation.negativePrompt,
    modelName: creation.modelName,
    platformName: creation.platformName,
    aspectRatio: creation.aspectRatio,
    settings,
  });
  return (
    <aside className="rounded-[2rem] border border-line bg-surface p-6 lg:sticky lg:top-28">
      <p className="text-[11px] tracking-[0.22em] text-cyan">PROMPT LABORATORY</p>
      <h2 className="mt-3 font-display text-4xl">The exact prompt</h2>
      <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-ink/90">{creation.prompt || "No prompt has been added yet."}</p>
      {creation.negativePrompt ? (
        <div className="mt-6">
          <p className="text-[11px] tracking-[0.18em] text-muted">NEGATIVE PROMPT</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-muted">{creation.negativePrompt}</p>
        </div>
      ) : null}
      <GenerationSettings
        modelName={creation.modelName}
        platformName={creation.platformName}
        settings={settings}
      />
      <div className="mt-6 flex flex-wrap gap-2">
        <CopyPromptButton text={creation.prompt} label="Copy Prompt" creationId={creation.id} track />
        {creation.negativePrompt ? <CopyPromptButton text={creation.negativePrompt} label="Copy Negative Prompt" /> : null}
        <CopyPromptButton text={allSettings} label="Copy All Settings" />
        {tool?.websiteUrl ? <ToolLink href={tool.websiteUrl} creationId={creation.id} label={tool.name} /> : null}
      </div>
    </aside>
  );
}
